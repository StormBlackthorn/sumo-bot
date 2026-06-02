namespace Network {
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

    export function setRadioGroup(groupNum: number) {
        radio.setGroup(groupNum);
    }

    export function send(packet: NetworkPacket<NetworkPacketTypes.SentPacket>): void {
        radio.sendString(JSON.stringify(packet));
    }

    export function onRecieve(lambda: (obj: object) => void): void {
        radio.onReceivedString(str => lambda(JSON.parse(str)))
    }

}
