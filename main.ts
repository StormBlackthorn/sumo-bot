let scanning = true
let currentGroup = 0
serial.setBaudRate(BaudRate.BaudRate115200)

// Listen for and capture incoming radio packets
radio.onReceivedString(function (receivedString: string) {
    if (scanning) {
        let rssi = radio.receivedSignalStrength()
        // Format string to be parsed by the HTML file: CAP:{group}:{rssi}:{msg}
        serial.writeLine(`CAP:${currentGroup}:${rssi}:${receivedString}`)
        music.playTone(880, music.beat(BeatFraction.Sixteenth))
    }
})

// Process incoming injection commands from the HTML interface
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    
    // Expected format from HTML: SEND:{target_group}:{duration}:{message}
    if (line.includes("SEND:")) {
        let parts = line.split(":")
        if (parts.length >= 4) {
            let targetGroup = parseFloat(parts[1])
            let duration = parseFloat(parts[2])
            
            // Re-stitch the message in case the value contained colons
            let msg = ""
            for (let i = 3; i < parts.length; i++) {
                msg += parts[i]
                if (i < parts.length - 1) {
                    msg += ":"
                }
            }

            // Pause the scanner and hop to the target frequency
            scanning = false
            radio.setGroup(targetGroup)

            if (duration < 0) {
                // Single fire
                radio.sendString(msg)
            } else {
                // Sustained burst fire
                let sendStart = control.millis()
                while (control.millis() - sendStart < duration * 1000) {
                    radio.sendString(msg)
                    basic.pause(100)
                }
            }
            
            // Return to scanner loop
            radio.setGroup(currentGroup)
            scanning = true
        }
    }
})

// Main 30ms Scanner Loop
basic.forever(function () {
    if (scanning) {
        radio.setGroup(currentGroup)
        basic.pause(30) // Wait 30ms on frequency
        
        currentGroup++
        if (currentGroup > 255) {
            currentGroup = 0 // Loop back
        }
    }
})