window.I2CAttachments = {};

class I2C {
    static attach(address, component) {
        window.I2CAttachments[address] = component;
    }

    setup() {}

    writeTo(addr, ...data) {
        const component = I2CAttachments[addr];
        if(component) {
            component.writeTo.apply(component, data);
        }
    }
}

// Define Espruino I2C1 constant
I2C1 = new I2C();
