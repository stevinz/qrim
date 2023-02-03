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
    }

    #element;
    #options = {
        width: 256,
        height: 256,
        typeNumber: 4,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRErrorCorrectLevel.H,
        style: QRCode.Styles.Square,
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
        this.#canvas.width = params.width;
        this.#canvas.height = params.height;
        this.#canvas.style.display = 'none';
        this.#context = this.#canvas.getContext('2d');

        this.#image = document.createElement('img');
        this.#image.alt = 'Scan me!';
        this.#image.style.display = 'none';

        this.#element.appendChild(this.#canvas);
        this.#element.appendChild(this.#image);

        if (this.#options.text) this.makeCode(this.#options.text);
    }

    clear() {
        this.#context.fillStyle = this.#options.colorLight;
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    draw(sText) {
        const codeModel = new QRCodeModel(sText, this.#options.correctLevel);
        const nCount = codeModel.getModuleCount();
        const nWidth = this.#options.width / nCount;
        const nHeight = this.#options.height / nCount;
        const nRoundedWidth = Math.round(nWidth);
        const nRoundedHeight = Math.round(nHeight);

        this.clear();
        for (let row = 0; row < nCount; row++) {
            for (let col = 0; col < nCount; col++) {
                const isDark = codeModel.isDark(row, col);
                if (! isDark) continue;
                const nLeft = col * nWidth;
                const nTop = row * nHeight;
                this.#context.lineWidth = 1;
                this.#context.strokeStyle = this.#options.colorDark;
                this.#context.fillStyle = this.#options.colorDark;
                this.#context.fillRect(nLeft, nTop, nWidth, nHeight);
                // Stroke fills in half pixel canvas gaps
                this.#context.strokeRect(Math.floor(nLeft) + 0.5, Math.floor(nTop) + 0.5, nRoundedWidth, nRoundedHeight);
                this.#context.strokeRect(Math.ceil(nLeft) - 0.5, Math.ceil(nTop) - 0.5, nRoundedWidth, nRoundedHeight);
            }
        }

        this.#image.src = this.#canvas.toDataURL('image/png');
        this.#image.style.display = '';
    }

    makeCode(sText) {
        this.#element.title = sText;
        this.draw(sText);
    }

}

export { QRCode };
