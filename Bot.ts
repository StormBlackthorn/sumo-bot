class BotMotors {
    public readonly LEFT: Motors.Motor;
    public readonly RIGHT: Motors.Motor;

    constructor() {
        this.LEFT = new Motors.Motor({ clockwisePin: DigitalPin.P13, speedPin: AnalogPin.P12, isInverted: false });
        this.RIGHT = new Motors.Motor({ clockwisePin: DigitalPin.P15, speedPin: AnalogPin.P16, isInverted: true });
    }

    public spin(leftSpeed: number, rightSpeed: number): void {
        this.LEFT.spin(leftSpeed);
        this.RIGHT.spin(rightSpeed);
    }

    public move(speed: number, direction: Motors.DIR): void {
        if (direction === Motors.DIR.FORWARD) {
            this.spin(speed, speed);
        } else {
            this.spin(-speed, -speed);
        }
    }

    public tankTurnLeft(speed: number): void {
        this.spin(-speed, speed);
    }

    public tankTurnRight(speed: number): void {
        this.spin(speed, -speed);
    }

    public stop(): void {
        this.LEFT.stop();
        this.RIGHT.stop();
    }
}

class Bot {
    public readonly Motors: BotMotors;
    public readonly UltrasonicSensors = {};

    constructor() {
        this.Motors = new BotMotors();
    }
}