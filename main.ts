serial.setBaudRate(BaudRate.BaudRate115200)

// Initialize the global environment so we have a fallback channel
Global.init({
    deviceType: Global.DEVICE_TYPE.CONTRLLER,
    radioGroup: 1
})

// Initialize Network
Network.init()
radio.setGroup(Global.radioGroup)

// Process incoming injection commands from the HTML interface
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = serial.readUntil(serial.delimiters(Delimiters.NewLine))

    // Expected format from HTML: SEND:{target_group}:{duration}:{message_or_name}:{optional_value}
    if (line.includes("SEND:")) {
        let parts = line.split(":")
        if (parts.length >= 4) {
            let targetGroup = parseFloat(parts[1])
            let duration = parseFloat(parts[2])

            // Pause the scanner and hop to the target frequency
            Network.isInjecting = true;
            radio.setGroup(targetGroup)

            // Determine if this is a strict Name/Value pair or a raw String/JSON
            // A strict Name/Value pair from the UI will have exactly 5 parts, and parts[4] will be a valid number.
            let isNameValue = (parts.length === 5 && !isNaN(parseFloat(parts[4])))
            let name = parts[3]
            let numValue = isNameValue ? parseFloat(parts[4]) : 0

            // Re-stitch the message if it's a raw string or JSON containing multiple colons
            let msg = ""
            if (!isNameValue) {
                for (let i = 3; i < parts.length; i++) {
                    msg += parts[i]
                    if (i < parts.length - 1) {
                        msg += ":"
                    }
                }
            }

            // Fire the command
            let keepSending = true
            let sendStart = control.millis()

            while (keepSending) {
                // Route to the correct native MakeCode radio function
                if (isNameValue) {
                    radio.sendValue(name, numValue)
                } else {
                    radio.sendString(msg)
                }

                // Check duration conditions
                if (duration < 0) {
                    keepSending = false // Single fire
                } else if (control.millis() - sendStart >= duration * 1000) {
                    keepSending = false // Burst duration expired
                } else {
                    basic.pause(100) // 100ms gap between burst packets
                }
            }

            // Return to default group and allow the scanner to resume
            radio.setGroup(Global.radioGroup)
            Network.isInjecting = false;
        }
    } else if (line.includes("SET_GROUP:")) {
        let parts = line.split(":")
        if (parts.length >= 2) {
            let grp = parseFloat(parts[1])
            if (grp >= 0 && grp <= 255) {
                // Broadcast synchronization command on the current channel before hopping
                radio.sendValue("SET_GROUP", grp)
                radio.sendString("SET_GROUP:" + grp)
                basic.pause(100) // allow packet to transmit

                Global.radioGroup = grp
                radio.setGroup(grp)
                serial.writeLine("SET_GROUP_ACK:" + grp)
            }
        }
    } else if (line.includes("STOP_SCAN")) {
        Network.RadioSniffer.stopScan()
    } else if (line.includes("SCAN")) {
        let parts = line.split(":")
        let duration = 10000 // default 10s
        if (parts.length >= 2) {
            duration = parseFloat(parts[1]) * 1000 // convert seconds to ms
        }
        if (Global.deviceType === Global.DEVICE_TYPE.CONTRLLER) {
            radio.sendString("CMD:START_SCAN:" + duration)
            basic.pause(50) // wait for transmission
        }
        Network.RadioSniffer.startScan(duration)
    }
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (Global.deviceType === Global.DEVICE_TYPE.CONTRLLER) {
        let duration = 1000 // 1 second
        radio.sendString("CMD:START_SCAN:" + duration)
        basic.pause(50) // wait for transmission
        Network.RadioSniffer.startScan(duration)
    }
})