namespace Network {
    export let isInjecting = false;
    export let onRecieveCallback: ((packet: Network.NetworkPacket<Network.NetworkPacketTypes.RecievedPacket>) => void);

    export class NetworkPacket<T extends NetworkPacketTypes.RecievedPacket | NetworkPacketTypes.SentPacket> {
        public readonly name : T;
        public readonly data: object;

        constructor(name: T, data: object) {
            this.name = name;
            this.data = data;
        }
    }

    export namespace NetworkPacketTypes {
        //reversed for bot and controller 
        export enum RecievedPacket {
            RED_BUTTON_PRESSED, RED_BUTTON_RELEASED
        }

        export enum SentPacket {

        }
    }

    export function send(packet: NetworkPacket<NetworkPacketTypes.SentPacket>): void {
        radio.sendString(JSON.stringify(packet));
    }

    export function init() : void {
        // Listen for simple strings
        radio.onReceivedString(str => {
            if (str.indexOf("SET_GROUP:") === 0) {
                let parts = str.split(":")
                if (parts.length >= 2) {
                    let grp = parseFloat(parts[1])
                    if (grp >= 0 && grp <= 255) {
                        Global.radioGroup = grp
                        radio.setGroup(grp)
                        serial.writeLine(`SET_GROUP_RX:${grp}`)
                    }
                }
                return;
            }

            if (str.indexOf("CMD:START_SCAN:") === 0) {
                if (Global.deviceType === Global.DEVICE_TYPE.BOT) {
                    let parts = str.split(":")
                    if (parts.length >= 3) {
                        let duration = parseFloat(parts[2])
                        if (!isNaN(duration)) {
                            RadioSniffer.startScan(duration)
                        }
                    }
                }
                return;
            }

            if (str.indexOf("CMD:BOT_FOUND:") === 0) {
                if (Global.deviceType === Global.DEVICE_TYPE.CONTRLLER) {
                    let parts = str.split(":")
                    if (parts.length >= 3) {
                        let ch = parseFloat(parts[2])
                        if (!isNaN(ch)) {
                            serial.writeLine(`CAP:${ch}:-50:BOT`)
                        }
                    }
                }
                return;
            }

            if (!RadioSniffer.searching) {
                if (Network.onRecieveCallback) {
                    try {
                        let parsed = JSON.parse(str);
                        Network.onRecieveCallback(parsed);
                    } catch (e) {
                        // Suppress parse errors for raw packets
                    }
                }
            } else {
                RadioSniffer.found(str, radio.receivedSignalStrength());
            }
        });

        // Listen for name:value pairs (common in MakeCode protocols)
        radio.onReceivedValue((name, value) => {
            if (name === "SET_GROUP") {
                if (value >= 0 && value <= 255) {
                    Global.radioGroup = value
                    radio.setGroup(value)
                    serial.writeLine(`SET_GROUP_RX:${value}`)
                }
                return;
            }

            if(!RadioSniffer.searching) return;
            RadioSniffer.found(`${name}:${value}`, radio.receivedSignalStrength());
        });
    }

    export namespace RadioSniffer {
        export class Packet {
            constructor(public readonly name : string, public readonly value : number) {};
        }

        const waitTime     : number   = 30; // 30ms wait per channel
        
        export let currentIndex : number  = 0; 
        export let activeSniffGroup : number = 0;
        export let searching    : boolean = false;
        export const instructions : (string | RadioSniffer.Packet)[] = [];
        export const botDetectedChannels: number[] = [];

        let scanStartMs = 0;
        let scanDurationMs = 0;

        export function startScan(durationMs: number) : void {
            if (searching) {
                scanStartMs = control.millis();
                scanDurationMs = durationMs;
                return;
            }

            searching = true;
            scanStartMs = control.millis();
            scanDurationMs = durationMs;

            if (Global.deviceType === Global.DEVICE_TYPE.BOT) {
                currentIndex = 255;
                while (botDetectedChannels.length > 0) {
                    botDetectedChannels.pop();
                }
            } else {
                currentIndex = 0;
            }

            control.inBackground(() => {
                while (searching && (control.millis() - scanStartMs < scanDurationMs)) {
                    if (Network.isInjecting) {
                        basic.pause(50);
                        continue;
                    }

                    activeSniffGroup = currentIndex;
                    radio.setGroup(currentIndex);
                    basic.pause(waitTime);

                    // Allow event handler to run with the correct activeSniffGroup before index changes
                    basic.pause(2);

                    if (Global.deviceType === Global.DEVICE_TYPE.BOT) {
                        currentIndex--;
                        if (currentIndex < 0) {
                            currentIndex = 255;
                        }
                    } else {
                        // Increment and loop back if we exceed 255
                        currentIndex++;
                        if (currentIndex > 255) {
                            currentIndex = 0; 
                        }
                    }
                }
                
                searching = false;
                // Always restore the default group when the scan cycle ends
                radio.setGroup(Global.radioGroup); 
                
                if (Global.deviceType === Global.DEVICE_TYPE.BOT) {
                    basic.pause(100);
                    for (let ch of botDetectedChannels) {
                        radio.sendString("CMD:BOT_FOUND:" + ch);
                        basic.pause(50);
                    }
                    while (botDetectedChannels.length > 0) {
                        botDetectedChannels.pop();
                    }
                } else {
                    serial.writeLine("SCAN_FINISHED");
                }
            });
        }

        export function stopScan() : void {
            searching = false;
        }

        export function found(packetData: string, rssi: number) : void {
            if (Global.deviceType === Global.DEVICE_TYPE.BOT) {
                if (botDetectedChannels.indexOf(activeSniffGroup) === -1) {
                    botDetectedChannels.push(activeSniffGroup);
                }
            } else {
                // Format string to be parsed by the HTML file: CAP:{group}:{rssi}:{msg}
                serial.writeLine(`CAP:${activeSniffGroup}:${rssi}:${packetData}`);
            }
        }

        export function addInstruction(instruction : string | RadioSniffer.Packet) : void {
            instructions.push(instruction);
        }

        export function printInstructions() : void {
            // Stub for logging if needed
        }

        export function runRemoteInstruction(index : number, value?: string) : void {
            // Stub for remote execution
        }

        export function setStringInstructionDelimeter(delimeter: string) {
            // Stub for delimiter setup
        }
    }
}