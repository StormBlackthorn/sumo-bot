namespace Motors {

    export enum DIR {
        FORWARD, BACKWARD
    }

    export function calculateMotorMoveTime(distance: number, speed: number) {

    }

    export class Motor {
        private clockwisePin: DigitalPin;
        private speedPin: AnalogPin;

        constructor(args: { clockwisePin: DigitalPin, speedPin: AnalogPin }) {
            this.clockwisePin = args.clockwisePin;
            this.speedPin = args.speedPin;
        }

        public move(direction: DIR, distance: number, speed: number): void {

        }

        public stop(): void {

        }
    }


}
