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

        radio.onReceivedString(str => {
            if (!RadioSniffer.searching) Network.onRecieveCallback(JSON.parse(str))
            else {
                RadioSniffer.found();

                RadioSniffer.addInstruction(str);
            }
        })

        radio.onReceivedValue((name, value) => {
            if(!RadioSniffer.searching) throw "Unexpected onRecievedValue event when Radio Sniffer is not sniffing";
            RadioSniffer.found();
           
            //only add if its a unique instruction
            RadioSniffer.addInstruction(new RadioSniffer.Packet(name, value));
        })

    }


    export namespace RadioSniffer {

        export class Packet {
            constructor(public readonly name : string, public readonly value : number) {};
        }

               const waitTime     : number   = 30; //30ms wait
               const sniffPerCycle: number   = 67; // 2 second sniff time each time
        export let   currentIndex : number   = Global.deviceType === Global.DEVICE_TYPE.BOT ? -2 : -1; 
        export let   foundID      : number   = -1; //-1 -> not found
        export let   searching    : boolean  = false;
               let   delimeter    : string; 
        export const instructions : (string | RadioSniffer.Packet)[] = [];
        export const searchOrder  : number[] = [
            67, 69, 42, 1, 255, //auto generate fill
        ]

        export function sniff() : void {
            for (let i : number = 0; i < sniffPerCycle; i++) {
                currentIndex += 2;
                radio.setGroup(searchOrder[currentIndex]);
                basic.pause(waitTime);

                if(RadioSniffer.foundID != -1) {
                    music.ringTone(Note.C);
                    break; 
                }

           }
        }

        export function addInstruction(instruction : string | RadioSniffer.Packet) : void {
            if(typeof instruction === "string") {
                
            } else {

            }
        }

        export function printInstructions() : void {

        }

        export function runRemoteInstruction(index : number, value?: string) : void {

        }

        export function found() : void {
            RadioSniffer.foundID = RadioSniffer.searchOrder[RadioSniffer.currentIndex];
        }

        export function setStringInstructionDelimeter(delimeter: string) {

        }

    }

}
