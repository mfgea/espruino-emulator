class Wifi {
    static connect(ssid, options, cb) {
        console.info("Connecting to wifi: ", ssid, options);
        if(typeof cb === 'function') {
            cb(Wifi.getDetails());
        }
    }
    static getDetails() {
        return {};
    }
}
