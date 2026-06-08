namespace Network {
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
            if (!RadioSniffer.searching) {
                if (Network.onRecieveCallback) Network.onRecieveCallback(JSON.parse(str));
            } else {
                RadioSniffer.found(str, radio.receivedSignalStrength());
            }
        });

        // Listen for name:value pairs (common in MakeCode protocols)
        radio.onReceivedValue((name, value) => {
            if(!RadioSniffer.searching) return;
            RadioSniffer.found(`${name}:${value}`, radio.receivedSignalStrength());
        });
    }

    export namespace RadioSniffer {
        export class Packet {
            constructor(public readonly name : string, public readonly value : number) {};
        }

        const waitTime     : number   = 30; // 30ms wait per channel
        const sniffPerCycle: number   = 67; // ~2 seconds total per cycle (67 * 30ms)
        
        export let currentIndex : number  = 0; 
        export let searching    : boolean = false;
        export const instructions : (string | RadioSniffer.Packet)[] = [];

        export function sniff() : void {
            searching = true;
            for (let i : number = 0; i < sniffPerCycle; i++) {
                radio.setGroup(currentIndex);
                basic.pause(waitTime);

                // Increment and loop back if we exceed 255
                currentIndex++;
                if (currentIndex > 255) {
                    currentIndex = 0; 
                }
            }
            searching = false;
            // Always restore the default group when the scan cycle ends
            radio.setGroup(Global.radioGroup); 
        }

        export function found(packetData: string, rssi: number) : void {
            // Format string to be parsed by the HTML file: CAP:{group}:{rssi}:{msg}
            serial.writeLine(`CAP:${currentIndex}:${rssi}:${packetData}`);
            
            // Play a ping noise every time a channel packet is captured
            music.playTone(880, music.beat(BeatFraction.Sixteenth));
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