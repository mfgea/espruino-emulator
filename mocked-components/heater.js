class FakeHeater {
    constructor(switchPin, heaterPin, heaterRelayId) {
        this.pins = {
            [switchPin]: 0,
            [heaterPin]: 0,
        }
        this.switchPin = switchPin;
        this.heaterPin = heaterPin;
        this.heaterRelayId = heaterRelayId;
    }

    changeState(ev) {
        const state = ev.target.checked ? 1 : 0;
        this.pins[this.heaterPin] = state;
    }

    readValue(pin) {
        if(pin === this.heaterPin) {
            return this.pins[pin];
        }
    }

    writeValue(pin, value) {
        if(pin === this.switchPin) {
            const className = value ? 'on' : 'off';
            document.getElementById(this.heaterRelayId).className = `heaterSwitch ${className}`;
        }
    }
}