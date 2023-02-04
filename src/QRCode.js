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
        Blob: 1,
        Dots: 2,
    };

    #element;
    #options = {
        text: '',
        size: 1024,
        colorDark: "#000000",
        colorLight: "#ffffff",
        border: 1,
        padding: 1,
        opacity: 1,
        style: QRCode.Styles.Square,
        correctLevel: QRErrorCorrectLevel.H,
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

    makeCode(params = {}) {
        if (typeof params === 'string') params = { text: params };
        if (typeof params === 'object') Object.assign(this.#options, params);

        this.#element.title = this.#options.text;
        this.#canvas.width = this.#options.size;
        this.#canvas.height = this.#options.size;
        this.#image.style.opacity = this.#options.opacity;

        const codeModel = new QRCodeModel(this.#options.text, this.#options.correctLevel);
        const count = codeModel.getModuleCount();

        // Sizes
        const border = this.#options.border;
        const padding = this.#options.padding;
        const size = this.#options.size;
        const blockSize = size / (count + (border * 2) + (padding * 2));
        const fatBlock = Math.ceil(blockSize);
        const innerStart = (border + padding) * blockSize;
        const borderWidth = border * fatBlock;
        const borderRadius = (this.#options.style === QRCode.Styles.Square) ? 0 : borderWidth;
        this.#image.style.borderRadius = parseFloat((borderRadius / size) * 100).toFixed(3) + '%';

        // Clear dark
        const ctx = this.#context;
        const light = this.#options.colorLight;
        const dark =  this.#options.colorDark;
        ctx.fillStyle = dark;
        ctx.fillRect(0, 0, size, size);

        // Draw padding light
        ctx.fillStyle = light;
        const padSize = size - (borderWidth * 2);
        ctx.beginPath(); ctx.roundRect(borderWidth, borderWidth, padSize, padSize, [ borderRadius * 0.5 ]); ctx.fill();

        // Draw squares
        for (let col = 0; col < count; col++) {
            for (let row = 0; row < count; row++) {
                const isDark = codeModel.isDark(row, col);
                const left = (col * blockSize) + innerStart;
                const top = (row * blockSize) + innerStart;
                const fatLeft = Math.floor(left);
                const fatTop = Math.floor(top);

                switch (this.#options.style) {
                    case QRCode.Styles.Dots:
                        if (! isDark) continue;
                        ctx.fillStyle = dark;
                        ctx.beginPath(); ctx.roundRect(left, top, blockSize, blockSize, [ blockSize ]); ctx.fill();
                        break;

                    case QRCode.Styles.Blob:
                        const checkT = ((row === 0) || ! codeModel.isDark(row - 1, col)) ? 1 : 0;
                        const checkL = ((col === 0) || ! codeModel.isDark(row, col - 1)) ? 1 : 0;
                        const checkB = ((row === count - 1) || ! codeModel.isDark(row + 1, col)) ? 1 : 0;
                        const checkR = ((col === count - 1) || ! codeModel.isDark(row, col + 1)) ? 1 : 0;
                        const checkTL = ((row === 0) || (col === 0) || ! codeModel.isDark(row - 1, col - 1)) ? 1 : 0;
                        const checkBR = ((row === count - 1) || (col === count - 1) || ! codeModel.isDark(row + 1, col + 1)) ? 1 : 0;
                        const checkTR = ((row === 0) || (col === count - 1) || ! codeModel.isDark(row - 1, col + 1)) ? 1 : 0;
                        const checkBL = ((row === count - 1) || (col === 0) || ! codeModel.isDark(row + 1, col - 1)) ? 1 : 0;
                        if (isDark) {
                            const TL = Math.min(checkT, checkL) * fatBlock * 1;
                            const TR = Math.min(checkT, checkR) * fatBlock * 1;
                            const BR = Math.min(checkB, checkR) * fatBlock * 1;
                            const BL = Math.min(checkB, checkL) * fatBlock * 1;
                            ctx.fillStyle = dark;
                            ctx.beginPath(); ctx.roundRect(fatLeft, fatTop, fatBlock, fatBlock, [ TL, TR, BR, BL ]); ctx.fill();
                        } else {
                            const TL = (checkT || checkL || checkTL) ? 0 : fatBlock * 0.4;
                            const TR = (checkT || checkR || checkTR) ? 0 : fatBlock * 0.4;
                            const BR = (checkB || checkR || checkBR) ? 0 : fatBlock * 0.4;
                            const BL = (checkB || checkL || checkBL) ? 0 : fatBlock * 0.4;
                            if (TL || TR || BR || BL) {
                                ctx.fillStyle = dark;
                                ctx.fillRect(fatLeft, fatTop, fatBlock, fatBlock);
                                ctx.fillStyle = light;// '#ffaaff';
                                ctx.beginPath();
                                ctx.roundRect(fatLeft, fatTop, fatBlock, fatBlock, [ TL, TR, BR, BL ]);
                                ctx.fill();
                            }
                        }
                        break;

                    case QRCode.Styles.Square:
                    default:
                        if (! isDark) continue;
                        ctx.fillStyle = dark;
                        ctx.fillRect(fatLeft, fatTop, fatBlock, fatBlock);
                }
            }
        }

        this.#image.src = this.#canvas.toDataURL('image/png');
        this.#image.style.display = '';
    }

}

export { QRCode };
