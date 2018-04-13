var SSD1306 = (function () {
    var C = {
        OLED_WIDTH: 128,
        OLED_CHAR: 0x40,
        OLED_CHUNK: 1024
        //OLED_CHUNK: 128
    };
    // commands sent when initialising the display
    var extVcc = false; // if true, don't start charge pump
    var initCmds = new Uint8Array([
        0xAe,
        0xD5,
        0x80,
        0xA8, 63,
        0xD3, 0x0,
        0x40,
        0x8D, extVcc ? 0x10 : 0x14,
        0x20, 0x0,
        0xA1,
        0xC8,
        0xDA, 0x12,
        0x81, extVcc ? 0x9F : 0xCF,
        0xD9, extVcc ? 0x22 : 0xF1,
        0xDb, 0x40,
        0xA4,
        0xA6,
        0xAf // 24 disp on
    ]);
    // commands sent when sending data to the display
    var flipCmds = [
        0x21,
        0, C.OLED_WIDTH - 1,
        0x22,
        0, 7 /* (height>>3)-1 */
    ];
    function update(options) {
        if (options) {
            if (options.height) {
                initCmds[4] = options.height - 1;
                initCmds[15] = options.height == 64 ? 0x12 : 0x02;
                flipCmds[5] = (options.height >> 3) - 1;
            }
            if (options.contrast !== undefined)
                initCmds[17] = options.contrast;
        }
    }
    function connect(i2c, callback, options) {
        update(options);
        var oled = Graphics.createArrayBuffer(C.OLED_WIDTH, initCmds[4] + 1, 1, { vertical_byte: true });
        oled.inverted = false;
        var addr = 0x3C;
        if (options) {
            if (options.address)
                addr = options.address;
            // reset display if 'rst' is part of options
            if (options.rst)
                digitalPulse(options.rst, false, 10);
        }
        setTimeout(function () {
            // configure the OLED
            initCmds.forEach(function (d) { i2c.writeTo(addr, [0, d]); });
        }, 50);
        // write to the screen
        oled.flip = function () {
            // set how the data is to be sent (whole screen)
            flipCmds.forEach(function (d) { i2c.writeTo(addr, [0, d]); });
            var chunk = new Uint8Array(C.OLED_CHUNK + 1);
            chunk[0] = C.OLED_CHAR;
            for (var p = 0; p < this.buffer.length; p += C.OLED_CHUNK) {
                chunk.set(new Uint8Array(this.buffer, p, C.OLED_CHUNK), 1);
                i2c.writeTo(addr, chunk);
            }
        };
        // set contrast, 0..255
        oled.setContrast = function (c) { i2c.writeTo(addr, 0, 0x81, c); };
        // set off
        oled.off = function () { i2c.writeTo(addr, 0, 0xAE); };
        // set on
        oled.on = function () { i2c.writeTo(addr, 0, 0xAF); };
        oled.invert = function () { var cmd = this.inverted ? 0xA6 : 0xA7; i2c.writeTo(addr, 0, cmd); this.inverted = !this.inverted; };
        // if there is a callback, call it now(ish)
        if (callback !== undefined)
            setTimeout(callback.bind(oled), 100);
        // return graphics
        return oled;
    }
    return {
        connect: connect
    };
})();

/**
 * StaticData class. Used to retrieve data from the Flash Storage using the Espruino Storage module.
 *
 */
var StaticData = /** @class */ (function () {
    function StaticData(dataDefs) {
        this.dataDefs = dataDefs;
    }
    StaticData.prototype.getImage = function (name) {
        var def = this.dataDefs[name];
        return {
            width: def.width,
            height: def.height,
            bpp: 1,
            transparent: 0,
            buffer: new Uint8Array(require('Storage').readArrayBuffer(name)).buffer
        };
    };
    return StaticData;
}());

/**
 * Images definitions. The actual images should be saved in the flash ram, e.g.:
 * require('Storage').write('wifi', E.toArrayBuffer(atob('B/gH/4PA8c/O7/33h7OecN/sBzgBtgAeAAeAAMAA')));
 *
 * Image name should be 8 chars max and image data can be generated using https://www.espruino.com/Image+Converter
 */
var images = { "wifi": { "width": 18, "height": 13 } };

/**
 * Function to draw an image to screen
 *
 * @param (SSD1306) display. An instance of the SSD1306 class
 * @param (GraphicsImage) image. An image in the format defined by the Espruino Graphics lib
 * @param (int) x. X position of the top-left pixel.
 * @param (int) y. Y position of the top-left pixel
 */
function drawImage(display, image, x, y) {
    if (!image)
        return;
    if (!x)
        x = 0;
    if (!y)
        y = 0;
    display.setColor(0); // Black
    display.fillRect(x, y, x + image.width, y + image.height);
    display.setColor(1); // white
    display.drawImage(image, x, y);
    display.flip();
}
function main() {
    // Create image store.
    var ImagesStore = new StaticData(images);
    // Create software I2C instance
    var i2c = new I2C();
    i2c.setup({ scl: NodeMCU.D0, sda: NodeMCU.D1, bitrate: 400000 });
    var display = SSD1306.connect(i2c, function () {
        display.clear();
        // Fetch image from flash storage and draw wifi icon
        var img = ImagesStore.getImage('wifi');
        var posX = display.getWidth() - img.width - 6;
        var posY = 6;
        drawImage(display, img, posX, posY);
    });
    // Print time every 1 sec
    setInterval(function () {
        // Calculate and format time
        var t = new Date();
        var time = t.getHours() + ":" + ("0" + t.getMinutes()).substr(-2) + ":" + ("0" + t.getSeconds()).substr(-2);
        var timeWidth = display.stringWidth(time);
        // Set fill color
        display.setColor(0); // Black
        //calculate position of the text (centered)
        var x = (display.getWidth() - timeWidth) / 2;
        var y = 40;
        // Clear the block behind the text
        display.fillRect(x, y, x + timeWidth, y + 6);
        // Set font color
        display.setColor(1); // white
        // Draw string to the buffer
        display.drawString(time, x, y);
        // 'Flip' buffer into the display
        display.flip();
    }, 1000);
}
E.on('init', main);
