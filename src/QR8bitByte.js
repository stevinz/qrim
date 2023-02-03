import { QRMode } from './QRUtils.js';
import { QRUtil } from './QRUtils.js';

/**
 * QR8bitByte
 */
class QR8bitByte {

    constructor(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data;
        this.parsedData = QRUtil.toUTF8(data)
    }

    getLength(buffer) {
        return this.parsedData.length;
    }

    write(buffer) {
        for (let i = 0, l = this.parsedData.length; i < l; i++) {
            buffer.put(this.parsedData[i], 8);
        }
    }

}

export { QR8bitByte };
