serial.setBaudRate(BaudRate.BaudRate115200)

// Initialize the global environment so we have a fallback channel
Global.init({
    deviceType: Global.DEVICE_TYPE.CONTRLLER,
    radioGroup: 1
})

// Initialize Network (this hooks up the event listeners properly)
Network.init()

let isInjecting = false;

// Process incoming injection commands from the HTML interface
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    
    // Expected format from HTML: SEND:{target_group}:{duration}:{message}
    if (line.includes("SEND:")) {
        let parts = line.split(":")
        if (parts.length >= 4) {
            let targetGroup = parseFloat(parts[1])
            let duration = parseFloat(parts[2])
            
            // Re-stitch the message in case the user's value contained colons
            let msg = ""
            for (let i = 3; i < parts.length; i++) {
                msg += parts[i]
                if (i < parts.length - 1) {
                    msg += ":"
                }
            }

            // Pause the scanner and hop to the target frequency
            isInjecting = true;
            Network.RadioSniffer.searching = false; 
            radio.setGroup(targetGroup)

            // Determine if we need to send a String or a Name/Value pair
            let sendParts = msg.split(":");
            let isNameValue = sendParts.length > 1 && !isNaN(parseFloat(sendParts[1]));

            if (duration < 0) {
                // Single fire
                if (isNameValue) {
                    radio.sendValue(sendParts[0], parseFloat(sendParts[1]));
                } else {
                    radio.sendString(msg);
                }
            } else {
                // Sustained burst fire
                let sendStart = control.millis()
                while (control.millis() - sendStart < duration * 1000) {
                    if (isNameValue) {
                        radio.sendValue(sendParts[0], parseFloat(sendParts[1]));
                    } else {
                        radio.sendString(msg);
                    }
                    basic.pause(100)
                }
            }
            
            // Return to default group and allow the scanner to resume
            radio.setGroup(Global.radioGroup)
            isInjecting = false;
        }
    }
})

// Main Background Loop
basic.forever(function () {
    if (!isInjecting) {
        // Runs the 2-second sniffer cycle block
        Network.RadioSniffer.sniff()
        
        // Brief pause to allow other system tasks to process before starting the next cycle
        basic.pause(10) 
    }
})