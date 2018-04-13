class RotaryEncoder {
    constructor(pinA, pinB, pinClick) {
        this.pins = {
            [pinA]: 0,
            [pinB]: 0,
            [pinClick]: 0
        }
        this.pinA = pinA;
        this.pinB = pinB;
    }
    readValue(pinName) {
        return this.pins[pinName];
    }

    step(values, event){
        this.pins[this.pinA] = values[0];
        this.pins[this.pinB] = values[1];
        this.emit(event);
    }

    down() {
        const steps = [
            [0,0],
            [0,1],
            [1,1],
            [1,0]
        ];
        steps.forEach(s => {
            this.step(s, 'down');
        });
    }
    up() {
        const steps = [
            [1,0],
            [1,1],
            [0,1],
            [0,0],
        ];
        steps.forEach(s => {
            this.step(s, 'up');
        });
    }
    click() {
        this.emit('click');
    }
}