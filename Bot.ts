class Bot {
    public readonly Motors = {
        LEFT:  new Motors.Motor({ clockwisePin: DigitalPin.P13, speedPin: AnalogPin.P12 }),
        RIGHT: new Motors.Motor({ clockwisePin: DigitalPin.P15, speedPin: AnalogPin.P16 }),
        move(speed : number, direction : Motors.DIR) : void {
            this.Motors.LEFT.move(speed, direction);
            this.Motors.RIGHT.move(speed, direction);
        },
        stop() : void {
            this.Motors.LEFT.stop();
            this.Motors.RIGHT.stop();
        }
    };

    public readonly UltrasonicSensors = {

    }
}