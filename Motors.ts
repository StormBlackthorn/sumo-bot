namespace Motors {

    export enum DIR {
        FORWARD, BACKWARD
    }

    export function calculateMotorMoveTime(distance: number, speed: number): number {
        if (speed === 0) return 0;
        return Math.abs(distance / speed) * 1000;
    }

    export class Motor {
        private clockwisePin: DigitalPin;
        private speedPin: AnalogPin;
        private isInverted: boolean;

        constructor(args: { clockwisePin: DigitalPin, speedPin: AnalogPin, isInverted?: boolean }) {
            this.clockwisePin = args.clockwisePin;
            this.speedPin = args.speedPin;
            this.isInverted = args.isInverted || false;
        }

        public spin(speed: number): void {
            if (speed > 0) {
                pins.digitalWritePin(this.clockwisePin, this.isInverted ? 0 : 1);
                pins.analogWritePin(this.speedPin, Math.min(1023, speed));
            } else if (speed < 0) {
                pins.digitalWritePin(this.clockwisePin, this.isInverted ? 1 : 0);
                pins.analogWritePin(this.speedPin, Math.min(1023, Math.abs(speed)));
            } else {
                this.stop();
            }
        }

        public move(direction: DIR, distance: number, speed: number): void {
            const signedSpeed = direction === DIR.FORWARD ? speed : -speed;
            this.spin(signedSpeed);
            if (distance > 0) {
                const time = calculateMotorMoveTime(distance, speed);
                basic.pause(time);
                this.stop();
            }
        }

        public stop(): void {
            pins.digitalWritePin(this.clockwisePin, 0);
            pins.analogWritePin(this.speedPin, 0);
        }
    }
}
