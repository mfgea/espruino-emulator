window.BLACK = 0;
window.WHITE = 1;

class Graphics {
  constructor(width=128, height=64, bpp=1, options={}) {
    this.bpp = bpp;
    this.width = width;
    this.height = height;
    this.buffer = new Uint8Array(width * height * bpp / 8);

    this.bgColor = window.BLACK;
    this.color = window.WHITE;

    this.xPos = 0;
    this.yPos = 0;

    this.setFontBitmap();
  }

  setColor(color) {
    this.color = color;
  }

  drawImage(img, x, y) {
    // TODO: take care of bpp and transparent colors
    const a = new Uint8Array(img.buffer);
    const { width, height } = img;

    const bits = a.reduce((accum, b) => {
      const binstr = b.toString(2).padStart(8, '0');
      return accum.concat(binstr.split(''));
    }, []);

    for(let i = 0; i < width; i++) {
      for(let j = 0; j < height; j++) {
        const index = (j * width) + i;
        if(bits[index]==='1') {
          this.setPixel(x + i, y + j, this.color);
        }
      }
    }
  }

  clear() {
    this.buffer.fill(this.bgColor);
  }

  drawString(str, x, y) {
    const { bitmap, firstChar, width, height } = this.fontOptions;

    const allBits = Uint8ClampedArray.from(bitmap, c => c.charCodeAt(0)).reduce((accum, b) => {
      const binstr = b.toString(2).padStart(8, '0');
      return accum.concat(binstr.split(''));
    }, []);

    let allWidths;
    if (typeof width === 'string') {
      allWidths = Uint8ClampedArray.from(width, c => c.charCodeAt(0));
    }

    let lastOffset = 0;
    str = String(str);
    for(let n = 0; n < str.length; n++) {
      const c = str[n];
      const charIdx = c.charCodeAt(0) - firstChar;
      let charWidth;
      let bitsOffset;
      let bitsWidth;
      if(allWidths) {
        charWidth = allWidths[charIdx];
        bitsWidth = charWidth * height;
        bitsOffset = allWidths.slice(0, charIdx).reduce((a,b)=>a+(b*height), 0);
      } else {
        charWidth = width;
        bitsWidth = charWidth * height;
        bitsOffset = charIdx * bitsWidth;
      }

      const bits = allBits.slice(bitsOffset, bitsOffset + bitsWidth);

      this.drawGlyph(bits, x + lastOffset, y + 1, charWidth, height);
      lastOffset += charWidth;
    }
  }

  // Draw a font glyph (vertical first)
  drawGlyph(bits, x, y, width, height) {
    for(let i = 0; i < width; i++) {
      for(let j = 0; j < height; j++) {
        const index = (i * height) + j;
        if(bits[index]==='1') {
          this.setPixel(x + i, y + j, this.color);
        }
      }
    }
  }

  fillPoly(poly) {
    // TODO
  }

  getBgColor() {
    return this.bgColor;
  }

  getColor() {
    return this.color;
  }

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  getModified() {
    // TODO
    return { x1: 0, y1: 0, x2: 0, y2: 0 };
  }

  getPixel(x, y) {
    return 0;
  }

  lineTo(x, y) {
    this.drawLine(this.xPos, this.yPos, x, y);
  }

  moveTo(x, y) {
    this.xPos = x;
    this.yPos = y;
  }

  setBgColor(r, g=null, b=null) {
    if(g === null && b === null) {
      this.bgColor = r;
      return;
    }
    // TODO r,g,b parsing
  }

  setColor(r, g=null, b=null) {
    if(g === null && b === null) {
      this.color = r;
      return;
    }
    // TODO r,g,b parsing
  }

  setFontBitmap() {
    const font4x6 = atob('AA6AAwAwA+U+Aa/WAmIyA2+KAAwAAciAAAicAYwYAEOEABCAAEEEAACAAGIwAcicAS+CAmqSAiqUAck+A6qkAcqkAgm4AUqUAQqcAAKAABKAAEKAAKKKAAKEAgqQAcqaAekeA+qUAciUA+icA+qiA+ogAciuA+I+Ai+iAEC8A+YmA+CCA+e+A+c+AcicA+kYAcmeA+kaASqkAg+gA+C+A8G8A+M+A2I2A4O4AmqyA+iiAwIGAii+AQgQACCCAgQAAWWOA+SMAMSSAMS+AMaKAIeoAJVeA+QOAKuCAJuAA+IWAi+CAeeOAeQOAMSMAfSMAMSfAeIQAKaUAQ8SAcCeAcGcAeOeAWIWAZFeAWaSAI+iAA+AAi+IAQwgA///');
    this.setFontCustom(font4x6, 33, 4, 6);
  }

  setFontCustom(bitmap, firstChar, width, height) {
    this.font = 'bitmap';
    this.fontOptions = { bitmap, firstChar, width, height };
  }

  setFontVector(size) {
    this.font = 'vector';
    this.fontOptions = { size };
  }

  setPixel(x, y, color=null) {
    const replaceChar = (target, index, insert) => [...target.slice(0, index), insert, ...target.slice(index + 1)].join("");

    color = color || this.color;
    const arrPos = Math.floor((x + y * this.width) / 8);
    const bitPos = (x + y * this.width) % 8;
    if(arrPos < this.buffer.length) {
      let binStr = this.buffer[arrPos].toString(2).padStart(8,'0');
      this.buffer[arrPos] = parseInt(replaceChar(binStr, bitPos, color),2);
    }
  }

  setRotation(rotate, reflect) {
    // TODO
  }

  stringWidth(str) {
    const { bitmap, firstChar, width, height } = this.fontOptions;

    let allWidths;
    if (typeof width === 'string') {
      allWidths = Uint8ClampedArray.from(width, c => c.charCodeAt(0));
    }

    let lastOffset = 0;
    str = String(str);
    for(let n = 0; n < str.length; n++) {
      const charIdx = str[n].charCodeAt(0) - firstChar;
      let charWidth;
      if(allWidths) {
        charWidth = allWidths[charIdx];
      } else {
        charWidth = width;
      }

      lastOffset += charWidth;
    }
    return lastOffset;
    // TODO
  }

  drawCircle(x0, y0, r) {
    this._drawCircle.call(this, x0, y0, r, false);
  }

  fillCircle(x0, y0, r) {
    this._drawCircle.call(this, x0, y0, r, true);
  }

  _drawCircle(x0, y0, r, fill=false) {
    var f = 1 - r;
    var ddF_x = 1;
    var ddF_y = -2 * r;
    var x = 0;
    var y = r;

    let drawFn = this.setPixel.bind(this);
    if(fill) {
      drawFn = (function(x0, x, y) {
        this.drawLine(x0, y, x, y);
      }).bind(this, x0);
    }

    drawFn(x0  , y0+r);
    drawFn(x0  , y0-r);
    drawFn(x0+r, y0  );
    drawFn(x0-r, y0  );

    while (x<y) {
      if (f >= 0) {
        y--;
        ddF_y += 2;
        f += ddF_y;
      }
      x++;
      ddF_x += 2;
      f += ddF_x;

      drawFn(x0 + x, y0 + y);
      drawFn(x0 - x, y0 + y);
      drawFn(x0 + x, y0 - y);
      drawFn(x0 - x, y0 - y);
      drawFn(x0 + y, y0 + x);
      drawFn(x0 - y, y0 + x);
      drawFn(x0 + y, y0 - x);
      drawFn(x0 - y, y0 - x);
    }
  }

  drawLine(x0, y0, x1, y1) {
    var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    if (steep) {
      [ x0, y0 ] = [ y0, x0 ];
      [ x1, y1 ] = [ y1, x1 ];
    }

    if (x0 > x1) {
      [ x0, x1 ] = [ x1, x0 ];
      [ y0, y1 ] = [ y1, y0 ];
    }

    const dx = x1 - x0;
    const dy = Math.abs(y1 - y0);

    var err = dx / 2;
    var ystep;

    if (y0 < y1) {
      ystep = 1;
    } else {
      ystep = -1;
    }

    for (; x0<=x1; x0++) {
      if (steep) {
        this.setPixel(y0, x0);
      } else {
        this.setPixel(x0, y0);
      }
      err -= dy;
      if (err < 0) {
        y0 += ystep;
        err += dx;
      }
    }
  }

  drawRect(x, y, w, h) {
    this.drawLine(x, y, x+w, y);
    this.drawLine(x+w, y, x+w, y+h);
    this.drawLine(x+w, y+h, x, y+h);
    this.drawLine(x, y+h, x, y);
  }

  fillRect(x, y, w, h) {
    for(let i = y; i < h; i++) {
      this.drawLine(x, i, w - 1, i);
    }
  }

  setCursor(x, y) {
    this.xPos = x;
    this.yPos = y;
  }

  static createArrayBuffer(width, height, bpp, options) {
      return new Graphics(width, height, bpp, options);
  }
}

