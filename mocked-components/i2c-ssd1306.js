class I2CSSD1306 {
    constructor(id, width, height) {
        this.container = document.getElementById(id);
        this.canvas = document.createElement('canvas');

        this.container.appendChild(this.canvas);
        this.canvas.style.imageRendering = "pixelated";
        this.canvas.width = width;
        this.canvas.height = height;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;

        this.width = width;
        this.height = height;
    }

    /**
     * Needed method inside the component.
     * This will be the communication point with the I2C interface
     */
    writeTo(...data) {
        data.forEach(d => {
            const first = _.get(d, 0, 0);
            if(first === 0x40) {
                d = d.slice(1);
                this.renderData(d);
            }
        })
    }

    renderData(buffData) {
        const { width, height, ctx } = this;
        const data = new Uint8ClampedArray(4 * width * height);
        for (let i = 0; i < buffData.length; i++) {
            const bitStr = buffData[i].toString(2).padStart(8, '0');
            const bits = [...bitStr]
                .map(v => v === '1' ? 255 : 0)
                .reduce((accum, v) => accum.concat([v, v, v, 255]), []);
            data.set(bits, (i * 4 * 8));
        };
        const imgData = new ImageData(data, width, height);
        ctx.putImageData(imgData, 0, 0);
    }
}

