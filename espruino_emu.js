/**
 * Espruino class (constructor for E)
 *
 * Keeps track of pin attachments and events
 */
class EspruinoClass {
    constructor() {
        this.events = {};
        this.attachedPins = {};
    }

    /**
     * Attaches a pin to an eventBus/event
     * For use in conjunction with setWatch, readPin, writePin
     *
     * @param {*} pin. The espruino pin to attach
     * @param {*} eventBus. The mocked object used as event bus
     * @param {*} eventName. The event thrown by the eventBus, using 'eventBus.emit(eventName, value)'
     */
    attachInput(pin, eventBus, eventName) {
        this.attachedPins[pin] = {
            type: 'input',
            ctrl: eventBus,
            event: eventName
        };
    }

    setWatch(cb, pin, options) {
        const pinAttach = this.attachedPins[pin];
        if(pinAttach && pinAttach.type == 'input') {
            pinAttach.ctrl.on(pinAttach.event, cb);
        }
    }

    readPin(pin) {
        const pinCtrl = this.attachedPins[pin];
        if(pinCtrl && pinCtrl.ctrl && pinCtrl.ctrl.readValue) {
            return pinCtrl.ctrl.readValue(pin);
        }
        return 0;
    }

    writePin(pin, value) {
        const pinCtrl = this.attachedPins[pin];
        if(pinCtrl && pinCtrl.writeValue) {
            pinCtrl.writeValue(pin, value);
        }
    }

    powerOn() {
        this.emit('init');
    }

    clip(num, min, max) {
        if(num > max) return max;
        if(num < min) return min;
        return num;
    }
}

// Espruino global functions
function getTime() {
    return new Date().getTime();
}
function pinMode(pin, mode) {
    return;
}
function digitalRead(pin) {
    return E.readPin(pin);
}
function digitalWrite(pin, value) {
    E.writePin(pin, value);
}
function setWatch(cb, pin, options) {
    E.setWatch(cb, pin, options);
}

/**
 * Declare Pin constants: NodeMCU.D1-16 and D1-16
 */
const NodeMCU = {};
for(let i=0; i<=16; i++){
    NodeMCU[`D${i}`] = `NodeMCU.D${i}`;
    window[`D${i}`] = `D${i}`;
}

window.E = new EspruinoClass();

class Storage {
    constructor() {
        const store = {}
        StaticFiles.forEach(f => store[f.name] = f.data);
        this.store = store;
    }
    readArrayBuffer(name){
        const base64 = this.store[name];
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    }
}

const modules = {
    Storage: new Storage()
}

function require(module) {
    return modules[module];
}

Object.prototype.on = function(event, cb) {
    this.events = this.events || {};
    const evts = _.get(this, 'events.' + event, []);
    evts.push(cb);
    this.events[event] = evts;
}

Object.prototype.emit = function(event) {
    _.get(this, 'events.' + event, []).forEach(cb => cb());
}

const font4x6 = atob('AA6AAwAwA+U+Aa/WAmIyA2+KAAwAAciAAAicAYwYAEOEABCAAEEEAACAAGIwAcicAS+CAmqSAiqUAck+A6qkAcqkAgm4AUqUAQqcAAKAABKAAEKAAKKKAAKEAgqQAcqaAekeA+qUAciUA+icA+qiA+ogAciuA+I+Ai+iAEC8A+YmA+CCA+e+A+c+AcicA+kYAcmeA+kaASqkAg+gA+C+A8G8A+M+A2I2A4O4AmqyA+iiAwIGAii+AQgQACCCAgQAAWWOA+SMAMSSAMS+AMaKAIeoAJVeA+QOAKuCAJuAA+IWAi+CAeeOAeQOAMSMAfSMAMSfAeIQAKaUAQ8SAcCeAcGcAeOeAWIWAZFeAWaSAI+iAA+AAi+IAQwgA///');
Graphics.prototype.setStandardFont4x6 = function() {
    this.setFontCustom(font4x6, 33, 4, 6);
}

const font3x5 = atob('B0EAQV9TPmmTPp/BAAHRi4FXVI4gRAIQgAgGTH4/T8M65rVXCf7W/63hfH6/7X4FACoBFRUpUVERFjqvfR/6qdGP4u/WP6UdG/yfj+MY++Tfwh+z/4PdH36IdF/6LTWUPw8H3B8+b+ybwfE65B+OCDj8CIICEMEAfR/6qdGP4u/WP6UdG/yfj+MY++Tfwh+z/4PdH36IdF/6LTWUPw8HxgmeJ6TJ6X5TlI6IPgi4mEM//wE=');
Graphics.prototype.setStandardFont3x5 = function() {
    this.setFontCustom(font3x5, 33, 3, 5);
}

/**
 * The following is a modified verision of the 3x5 standard font. It adds a pixel of spaces between characters, giving a 4x5 font
 */
//const font4x5 = atob('B0AIAgBX1AZ8wJkyD0/gBAAAOiCLgAq6oCOIAIgAIQgABAAZMA/H4E/CCdcgrVQOE+Dtbg/W4IXwD9fg7X4AKAAKgAIqIFKUCKiARFgHVeB9Hg/VQHRiD8XA/WIP0oB0bg+T4I/iCMfA+TYPhCD7Pg/B4HR8D9EAdF4P0WBNZAh+APB8Dg+A+b4Nk2DB8AnXIAfiDBBgj8AEQQAIQgggAH0eD9VAdGIPxcD9Yg/SgHRuD5Pgj+IIx8D5Ng+EIPs+D8HgdHwP0QB0Xg/RYE1kCH4A8HwDBMB4ngSZIOl+ApygI6IAfACLiAwhgP/+AA==');
//Graphics.prototype.setFontStd4x5 = function() {
//    this.setFontCustom(font4x5, 33, 4, 5);
//}


/**
 * Code to convert the C code font into the js, vertical-first, packed version
 */
/*
const ___ = 0;
const __X = 1;
const _X_ = 2;
const _XX = 3;
const X__ = 4;
const X_X = 5;
const XX_ = 6;
const XXX = 7;
const PACK_5_TO_16 = (A,B,C,D,E) => [A, B, C, D, E];

let fontbits = [ // from 33 up to 127
        PACK_5_TO_16( _X_ , X_X , _X_ , _X_ , X_X ), // !"#$%
        PACK_5_TO_16( _X_ , ___ , XXX , XX_ , __X ),
        PACK_5_TO_16( _X_ , ___ , _X_ , XXX , _X_ ),
        PACK_5_TO_16( ___ , ___ , XXX , _XX , X__ ),
        PACK_5_TO_16( _X_ , ___ , _X_ , _X_ , X_X ),

        PACK_5_TO_16( XXX , _X_ , __X , X__ , X_X ), // &'()*
        PACK_5_TO_16( X_X , ___ , _X_ , _X_ , _X_ ),
        PACK_5_TO_16( X_X , ___ , _X_ , _X_ , XXX ),
        PACK_5_TO_16( XXX , ___ , _X_ , _X_ , _X_ ),
        PACK_5_TO_16( _XX , ___ , __X , X__ , X_X ),

        PACK_5_TO_16( ___ , ___ , ___ , ___ , __X ), // +,-./
        PACK_5_TO_16( _X_ , ___ , ___ , ___ , __X ),
        PACK_5_TO_16( XXX , ___ , XXX , ___ , _X_ ),
        PACK_5_TO_16( _X_ , _X_ , ___ , ___ , X__ ),
        PACK_5_TO_16( ___ , X__ , ___ , _X_ , X__ ),

        PACK_5_TO_16( XXX , _X_ , XXX , XX_ , X_X ), // 01234
        PACK_5_TO_16( X_X , XX_ , __X , __X , X_X ),
        PACK_5_TO_16( X_X , _X_ , _X_ , XX_ , XXX ),
        PACK_5_TO_16( X_X , _X_ , X__ , __X , __X ),
        PACK_5_TO_16( XXX , XXX , XXX , XX_ , __X ),

        PACK_5_TO_16( XXX , XXX , XXX , XXX , XXX ), // 56789
        PACK_5_TO_16( X__ , X__ , __X , X_X , X_X ),
        PACK_5_TO_16( XXX , XXX , _X_ , XXX , XXX ),
        PACK_5_TO_16( __X , X_X , _X_ , X_X , __X ),
        PACK_5_TO_16( XXX , XXX , _X_ , XXX , XXX ),

        PACK_5_TO_16( ___ , ___ , __X , ___ , X__ ), // :;<=>
        PACK_5_TO_16( _X_ , _X_ , _X_ , XXX , _X_ ),
        PACK_5_TO_16( ___ , ___ , X__ , ___ , __X ),
        PACK_5_TO_16( _X_ , _X_ , _X_ , XXX , _X_ ),
        PACK_5_TO_16( ___ , X__ , __X , ___ , X__ ),

        PACK_5_TO_16( _X_ , _X_ , _X_ , XX_ , _XX ), // ?@ABC
        PACK_5_TO_16( X_X , X_X , X_X , X_X , X__ ),
        PACK_5_TO_16( __X , XXX , XXX , XX_ , X__ ),
        PACK_5_TO_16( ___ , X_X , X_X , X_X , X__ ),
        PACK_5_TO_16( _X_ , _XX , X_X , XX_ , _XX ),

        PACK_5_TO_16( XX_ , XXX , XXX , _XX , X_X ), // DEFGH
        PACK_5_TO_16( X_X , X__ , X__ , X__ , X_X ),
        PACK_5_TO_16( X_X , XX_ , XXX , X_X , XXX ),
        PACK_5_TO_16( X_X , X__ , X__ , X_X , X_X ),
        PACK_5_TO_16( XX_ , XXX , X__ , _XX , X_X ),

        PACK_5_TO_16( XXX , XXX , X_X , X__ , X_X ), // IJKLM
        PACK_5_TO_16( _X_ , __X , X_X , X__ , XXX ),
        PACK_5_TO_16( _X_ , __X , XX_ , X__ , XXX ),
        PACK_5_TO_16( _X_ , __X , X_X , X__ , X_X ),
        PACK_5_TO_16( XXX , XX_ , X_X , XXX , X_X ),

        PACK_5_TO_16( XX_ , _XX , XX_ , _X_ , XX_ ), // NOPQR
        PACK_5_TO_16( X_X , X_X , X_X , X_X , X_X ),
        PACK_5_TO_16( X_X , X_X , XX_ , X_X , XX_ ),
        PACK_5_TO_16( X_X , X_X , X__ , X_X , X_X ),
        PACK_5_TO_16( X_X , _X_ , X__ , _XX , X_X ),

        PACK_5_TO_16( _XX , XXX , X_X , X_X , X_X ), // STUVW
        PACK_5_TO_16( X__ , _X_ , X_X , X_X , X_X ),
        PACK_5_TO_16( _X_ , _X_ , X_X , X_X , XXX ),
        PACK_5_TO_16( __X , _X_ , X_X , _X_ , XXX ),
        PACK_5_TO_16( XX_ , _X_ , _X_ , _X_ , X_X ),

        PACK_5_TO_16( X_X , X_X , XXX , _XX , X__ ), // XYZ[
        PACK_5_TO_16( X_X , X_X , __X , _X_ , X__ ),
        PACK_5_TO_16( _X_ , _X_ , _X_ , _X_ , _X_ ),
        PACK_5_TO_16( X_X , _X_ , X__ , _X_ , __X ),
        PACK_5_TO_16( X_X , _X_ , XXX , _XX , __X ),

        PACK_5_TO_16( XX_ , _X_ , ___ , X__ , _X_ ), // ]^_`a
        PACK_5_TO_16( _X_ , X_X , ___ , _X_ , X_X ),
        PACK_5_TO_16( _X_ , ___ , ___ , ___ , XXX ),
        PACK_5_TO_16( _X_ , ___ , ___ , ___ , X_X ),
        PACK_5_TO_16( XX_ , ___ , XXX , ___ , X_X ),

        PACK_5_TO_16( XX_ , _XX , XX_ , XXX , XXX ), // bcdef
        PACK_5_TO_16( X_X , X__ , X_X , X__ , X__ ),
        PACK_5_TO_16( XX_ , X__ , X_X , XX_ , XXX ),
        PACK_5_TO_16( X_X , X__ , X_X , X__ , X__ ),
        PACK_5_TO_16( XX_ , _XX , XX_ , XXX , X__ ),

        PACK_5_TO_16( _XX , X_X , XXX , XXX , X_X ), // ghijk
        PACK_5_TO_16( X__ , X_X , _X_ , __X , X_X ),
        PACK_5_TO_16( X_X , XXX , _X_ , __X , XX_ ),
        PACK_5_TO_16( X_X , X_X , _X_ , __X , X_X ),
        PACK_5_TO_16( _XX , X_X , XXX , XX_ , X_X ),

        PACK_5_TO_16( X__ , X_X , XX_ , _XX , XX_ ), // lmnop
        PACK_5_TO_16( X__ , XXX , X_X , X_X , X_X ),
        PACK_5_TO_16( X__ , XXX , X_X , X_X , XX_ ),
        PACK_5_TO_16( X__ , X_X , X_X , X_X , X__ ),
        PACK_5_TO_16( XXX , X_X , X_X , _X_ , X__ ),

        PACK_5_TO_16( _X_ , XX_ , _XX , XXX , X_X ), // qrstu
        PACK_5_TO_16( X_X , X_X , X__ , _X_ , X_X ),
        PACK_5_TO_16( X_X , XX_ , _X_ , _X_ , X_X ),
        PACK_5_TO_16( X_X , X_X , __X , _X_ , X_X ),
        PACK_5_TO_16( _XX , X_X , XX_ , _X_ , _X_ ),

        PACK_5_TO_16( ___ , ___ , ___ , X_X , ___ ), // vwxyz
        PACK_5_TO_16( ___ , X_X , X_X , X_X , ___ ),
        PACK_5_TO_16( X_X , X_X , _X_ , XXX , XXX ),
        PACK_5_TO_16( X_X , XXX , _X_ , __X , _X_ ),
        PACK_5_TO_16( _X_ , X_X , X_X , XXX , XXX ),

        PACK_5_TO_16( __X , _X_ , X__ , X__ , XXX ), // {|}~ del
        PACK_5_TO_16( _X_ , _X_ , _X_ , XXX , XXX ),
        PACK_5_TO_16( XX_ , _X_ , _XX , __X , XXX ),
        PACK_5_TO_16( _X_ , _X_ , _X_ , ___ , XXX ),
        PACK_5_TO_16( __X , _X_ , X__ , ___ , XXX ),
]

let chars = [];
let font_width = 3;
let font_height = 5;
while(fontbits.length) {
    const fiveChars = fontbits
        .slice(0, font_height)
        .map(a => a.map(n => n.toString(2).padStart(font_width, '0') + '0')
            .reduce((accum, s) => accum + s, '')
        );

    let char='';
    const charactersCount = fiveChars[0].length;
    for(let i=0; i < charactersCount; i++) {
        for (let k = 0; k < font_height; k++) {
            char += fiveChars[k][i];
        }
    }

    chars = chars.concat(char);
    fontbits = fontbits.slice(font_height);
}

chars = new Uint8ClampedArray(
    chars
        .join("")
        .match(/.{1,8}/g)
        .map( a => parseInt(a,2) )
    )
    .reduce((str, code) => {
        return str + String.fromCharCode(code);
    }, '');

console.log(btoa(chars));
*/