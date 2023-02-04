/**
 * @description QRCode
 * @about       Generator for QR Code
 * @license     MIT
 * @author      kazuhikoarase           https://github.com/kazuhikoarase/qrcode-generator
 * @author      davidshimjs (bundle)    https://github.com/davidshimjs/qrcodejs
 * @author      19z (UTF-8)             https://github.com/19z/qrcodejs-fixUTF8
 * @author      stevinz (module)        https://github.com/stevinz/qrcodejs
 * @trademark   QR Code ® DENSO WAVE    https://www.qrcode.com
 */

import { QRCodeModel } from './QRCodeModel.js';
import { QRErrorCorrectLevel } from './QRRSBlock.js';

/**
 * QRCode
 */
class QRCode {

    static CorrectLevel = QRErrorCorrectLevel;
    static Styles = {
        Square: 0,
        Circle: 1,
        Rounded: 2,
    };

    #element;
    #options = {
        size: 1024,
        colorDark: "#000000",
        colorLight: "#ffffff",
        border: 1,
        padding: 1,
        opacity: 1,
        style: QRCode.Styles.Square,
        correctLevel: QRErrorCorrectLevel.H,
        typeNumber: 4,
    };
    #canvas;
    #context;
    #image;

    constructor(element, params) {
        if (! (element instanceof HTMLElement)) element = document.body;
        if (typeof params === 'string') params = { text: params };
        if (typeof params === 'object') Object.assign(this.#options, params);

        this.#element = element;

        this.#canvas = document.createElement('canvas');
        this.#canvas.width = this.#options.size;
        this.#canvas.height = this.#options.size;
        this.#canvas.style.display = 'none';
        this.#context = this.#canvas.getContext('2d');

        this.#image = document.createElement('img');
        this.#image.alt = 'Scan me!';
        this.#image.style.display = 'none';
        this.#image.style.opacity = this.#options.opacity;

        this.#element.appendChild(this.#canvas);
        this.#element.appendChild(this.#image);

        if (this.#options.text) this.makeCode(this.#options.text);
    }

    makeCode(sText) {
        this.#element.title = sText;
        this.draw(sText);
    }

    draw(sText) {
        const codeModel = new QRCodeModel(sText, this.#options.correctLevel);
        const count = codeModel.getModuleCount();

        // Sizes
        const border = this.#options.border;
        const padding = this.#options.padding;
        const size = this.#options.size;
        const blockSize = size / (count + (border * 2) + (padding * 2));
        const fatBlock = Math.ceil(blockSize);
        const innerStart = (border + padding) * blockSize;
        const borderRadius = border * fatBlock;
        this.#image.style.borderRadius = parseFloat((borderRadius / size) * 100).toFixed(3) + '%';

        // Clear dark
        const ctx = this.#context;
        const light = this.#options.colorLight;
        const dark =  this.#options.colorDark;
        ctx.fillStyle = dark;
        ctx.fillRect(0, 0, size, size);

        // Draw padding light
        ctx.fillStyle = light;
        const padSize = size - (borderRadius * 2);
        ctx.beginPath(); ctx.roundRect(borderRadius, borderRadius, padSize, padSize, [ borderRadius * 0.5 ]); ctx.fill();

        // Draw dark squares
        ctx.fillStyle = dark;
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                const isDark = codeModel.isDark(row, col);
                if (! isDark) continue;

                const left = (col * blockSize) + innerStart;
                const top = (row * blockSize) + innerStart;
                const fatLeft = Math.floor(left);
                const fatTop = Math.floor(top);

                switch (this.#options.style) {
                    case QRCode.Styles.Circle:
                        ctx.beginPath();
                        ctx.roundRect(left, top, blockSize, blockSize, [ blockSize ]);
                        ctx.fill();
                        break;

                    case QRCode.Styles.Rounded:
                        ctx.beginPath();
                        ctx.roundRect(fatLeft, fatTop, fatBlock, fatBlock, [ fatBlock ]);
                        ctx.fill();
                        break;

                    case QRCode.Styles.Square:
                    default:
                        ctx.fillRect(fatLeft, fatTop, fatBlock, fatBlock);
                }
            }
        }

        this.#image.src = this.#canvas.toDataURL('image/png');
        this.#image.style.display = '';
    }

}

export { QRCode };
