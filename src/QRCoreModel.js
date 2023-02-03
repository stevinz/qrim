import { QRMode } from './QRUtils.js';
import { QRPolynomial } from './QRPolynominal.js';
import { QRUtil } from './QRUtils.js';

export const QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };

/**
 * QR8bitByte
 */
class QR8bitByte {
    constructor(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data;
        this.parsedData = [];
        // Added to support UTF-8 Characters
        for (let i = 0, l = this.data.length; i < l; i++) {
            let byteArray = [];
            let code = this.data.charCodeAt(i);
            if (code > 0x10000) {
                byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3F);
            } else if (code > 0x800) {
                byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3F);
            } else if (code > 0x80) {
                byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3F);
            } else {
                byteArray[0] = code;
            }
            this.parsedData.push(byteArray);
        }
        this.parsedData = Array.prototype.concat.apply([], this.parsedData);
        if (this.parsedData.length != this.data.length) {
            this.parsedData.unshift(191);
            this.parsedData.unshift(187);
            this.parsedData.unshift(239);
        }
    }
    getLength(buffer) { return this.parsedData.length; }
    write(buffer) { for (let i = 0, l = this.parsedData.length; i < l; i++) buffer.put(this.parsedData[i], 8); }
}

/**
 * QRBitBuffer
 */
class QRBitBuffer {
    constructor() {
        this.buffer = [];
        this.length = 0;
    }
    get(index) {
        let bufIndex = Math.floor(index / 8);
        return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
    }
    put(num, length) {
        for (let i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) == 1);
    }
    getLengthInBits() { return this.length; }
    putBit(bit) {
        let bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) this.buffer.push(0);
        if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
        this.length++;
    }
}

/**
 * Class QRRSBlock
 */
class QRRSBlock {
    constructor(totalCount, dataCount) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
    }
    static RS_BLOCK_TABLE = [[1,26,19], [1,26,16], [1,26,13], [1,26,9], [1,44,34], [1,44,28], [1,44,22], [1,44,16], [1,70,55], [1,70,44], [2,35,17], [2,35,13], [1,100,80], [2,50,32], [2,50,24], [4,25,9], [1,134,108], [2,67,43], [2,33,15,2,34,16], [2,33,11,2,34,12], [2,86,68], [4,43,27], [4,43,19], [4,43,15], [2,98,78], [4,49,31], [2,32,14,4,33,15], [4,39,13,1,40,14], [2,121,97], [2,60,38,2,61,39], [4,40,18,2,41,19], [4,40,14,2,41,15], [2,146,116], [3,58,36,2,59,37], [4,36,16,4,37,17], [4,36,12,4,37,13], [2,86,68,2,87,69], [4,69,43,1,70,44], [6,43,19,2,44,20], [6,43,15,2,44,16], [4,101,81], [1,80,50,4,81,51], [4,50,22,4,51,23], [3,36,12,8,37,13], [2,116,92,2,117,93], [6,58,36,2,59,37], [4,46,20,6,47,21], [7,42,14,4,43,15], [4,133,107], [8,59,37,1,60,38], [8,44,20,4,45,21], [12,33,11,4,34,12], [3,145,115,1,146,116], [4,64,40,5,65,41], [11,36,16,5,37,17], [11,36,12,5,37,13], [5,109,87,1,110,88], [5,65,41,5,66,42], [5,54,24,7,55,25], [11,36,12], [5,122,98,1,123,99], [7,73,45,3,74,46], [15,43,19,2,44,20], [3,45,15,13,46,16], [1,135,107,5,136,108], [10,74,46,1,75,47], [1,50,22,15,51,23], [2,42,14,17,43,15], [5,150,120,1,151,121], [9,69,43,4,70,44], [17,50,22,1,51,23], [2,42,14,19,43,15], [3,141,113,4,142,114], [3,70,44,11,71,45], [17,47,21,4,48,22], [9,39,13,16,40,14], [3,135,107,5,136,108], [3,67,41,13,68,42], [15,54,24,5,55,25], [15,43,15,10,44,16], [4,144,116,4,145,117], [17,68,42], [17,50,22,6,51,23], [19,46,16,6,47,17], [2,139,111,7,140,112], [17,74,46], [7,54,24,16,55,25], [34,37,13], [4,151,121,5,152,122], [4,75,47,14,76,48], [11,54,24,14,55,25], [16,45,15,14,46,16], [6,147,117,4,148,118], [6,73,45,14,74,46], [11,54,24,16,55,25], [30,46,16,2,47,17], [8,132,106,4,133,107], [8,75,47,13,76,48], [7,54,24,22,55,25], [22,45,15,13,46,16], [10,142,114,2,143,115], [19,74,46,4,75,47], [28,50,22,6,51,23], [33,46,16,4,47,17], [8,152,122,4,153,123], [22,73,45,3,74,46], [8,53,23,26,54,24], [12,45,15,28,46,16], [3,147,117,10,148,118], [3,73,45,23,74,46], [4,54,24,31,55,25], [11,45,15,31,46,16], [7,146,116,7,147,117], [21,73,45,7,74,46], [1,53,23,37,54,24], [19,45,15,26,46,16], [5,145,115,10,146,116], [19,75,47,10,76,48], [15,54,24,25,55,25], [23,45,15,25,46,16], [13,145,115,3,146,116], [2,74,46,29,75,47], [42,54,24,1,55,25], [23,45,15,28,46,16], [17,145,115], [10,74,46,23,75,47], [10,54,24,35,55,25], [19,45,15,35,46,16], [17,145,115,1,146,116], [14,74,46,21,75,47], [29,54,24,19,55,25], [11,45,15,46,46,16], [13,145,115,6,146,116], [14,74,46,23,75,47], [44,54,24,7,55,25], [59,46,16,1,47,17], [12,151,121,7,152,122], [12,75,47,26,76,48], [39,54,24,14,55,25], [22,45,15,41,46,16], [6,151,121,14,152,122], [6,75,47,34,76,48], [46,54,24,10,55,25], [2,45,15,64,46,16], [17,152,122,4,153,123], [29,74,46,14,75,47], [49,54,24,10,55,25], [24,45,15,46,46,16], [4,152,122,18,153,123], [13,74,46,32,75,47], [48,54,24,14,55,25], [42,45,15,32,46,16], [20,147,117,4,148,118], [40,75,47,7,76,48], [43,54,24,22,55,25], [10,45,15,67,46,16], [19,148,118,6,149,119], [18,75,47,31,76,48], [34,54,24,34,55,25], [20,45,15,61,46,16]];
    static getRSBlocks(typeNumber, errorCorrectLevel) {
        let rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
        if (rsBlock == undefined) throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
        let length = rsBlock.length / 3;
        let list = [];
        for (let i = 0; i < length; i++) {
            let count = rsBlock[i*3+0];
            let totalCount = rsBlock[i*3+1];
            let dataCount = rsBlock[i*3+2];
            for (let j = 0; j < count; j++) list.push(new QRRSBlock(totalCount, dataCount));
        }
        return list;
    }
    static getRsBlockTable(typeNumber, errorCorrectLevel) {
        switch(errorCorrectLevel) {
            case QRErrorCorrectLevel.L: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectLevel.M: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectLevel.Q: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectLevel.H: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default: return undefined;
        }
    }
}

/**
 * QRCodeModel
 */
class QRCodeModel {

    constructor(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
    }

    ddData(data) {
        const newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = null;
    }

    isDark(row,col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) throw new Error(row + "," + col);
        return this.modules[row][col];
    }

    getModuleCount() {
        return this.moduleCount;
    }

    make() {
        this.makeImpl(false, this.getBestMaskPattern());
    }

    makeImpl(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);
        for (let row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
            for (let col = 0; col < this.moduleCount; col++) {
                this.modules[row][col] = null;
            }
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) this.setupTypeNumber(test);
        if (this.dataCache == null) this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        this.mapData(this.dataCache, maskPattern);
    }

    setupPositionProbePattern(row, col) {
        for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r) continue;
            for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || this.moduleCount <= col + c) continue;
                if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                    this.modules[row + r][col + c] = true;
                } else {
                    this.modules[row + r][col + c] = false;
                }
            }
        }
    }

    getBestMaskPattern() {
        let minLostPoint = 0;
        let pattern = 0;
        for (let i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            let lostPoint = QRUtil.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }
        return pattern;
    }

    setupTimingPattern() {
        for (let r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) continue;
            this.modules[r][6] = (r % 2 == 0);
        }
        for (let c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) continue;
            this.modules[6][c] = (c % 2 == 0);
        }
    }

    setupPositionAdjustPattern() {
        let pos = QRUtil.getPatternPosition(this.typeNumber);
        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos.length; j++) {
                let row = pos[i];
                let col = pos[j];
                if (this.modules[row][col] != null) continue;
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                            this.modules[row + r][col + c] = true;
                        } else {
                            this.modules[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    }

    setupTypeNumber(test) {
        let bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        for (let i = 0; i < 18; i++) {
            let mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
        }
        for (let i = 0; i < 18; i++) {
            let mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
        }
    }

    setupTypeInfo(test,maskPattern) {
        let data = (this.errorCorrectLevel << 3) | maskPattern;
        let bits = QRUtil.getBCHTypeInfo(data);
        for (let i = 0; i < 15; i++) {
            let mod=(!test && ((bits >> i) & 1) == 1);
            if (i < 6) {
                this.modules[i][8] = mod;
            } else if (i < 8) {
                this.modules[i + 1][8] = mod;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = mod;
            }
        }
        for (let i = 0; i < 15; i++) {
            let mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = mod;
            } else {
                this.modules[8][15 - i - 1] = mod;
            }
        }
        this.modules[this.moduleCount - 8][8] = (!test);
    }

    mapData(data, maskPattern) {
        let inc = -1;
        let row = this.moduleCount - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for (let col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col--;
            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (this.modules[row][col - c] == null) {
                        let dark = false;
                        if (byteIndex < data.length) dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                        let mask = QRUtil.getMask(maskPattern, row, col - c);
                        if (mask) dark = !dark;
                        this.modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc =- inc;
                    break;
                }
            }
        }
    }

    static PAD0 = 0xEC;
    static PAD1 = 0x11;

    static createData(typeNumber, errorCorrectLevel, dataList) {
        let rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
        let buffer = new QRBitBuffer();
        for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
            data.write(buffer);
        }
        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
        if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
        }
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4);
        while (buffer.getLengthInBits() % 8 != 0) buffer.putBit(false);
        while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) break;
            buffer.put(QRCodeModel.PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) break;
            buffer.put(QRCodeModel.PAD1, 8);
        }
        return QRCodeModel.createBytes(buffer,rsBlocks);
    };

    static createBytes = function(buffer, rsBlocks) {
        let offset = 0;
        let maxDcCount = 0;
        let maxEcCount = 0;
        let dcdata = new Array(rsBlocks.length);
        let ecdata = new Array(rsBlocks.length);
        for (let r = 0; r < rsBlocks.length; r++) {
            let dcCount = rsBlocks[r].dataCount;
            let ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (let i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xff & buffer.buffer[i + offset];
            offset += dcCount;
            let rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            let rawPoly = new QRPolynomial(dcdata[r],rsPoly.getLength() - 1);
            let modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (let i = 0; i < ecdata[r].length; i++) {
                let modIndex = i + modPoly.getLength() - ecdata[r].length;
                ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
            }
        }
        let totalCodeCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount;
        let data = new Array(totalCodeCount);
        let index = 0;
        for (let i = 0; i < maxDcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) data[index++]=dcdata[r][i];
            }
        }
        for (let i = 0; i < maxEcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) data[index++] = ecdata[r][i];
            }
        }
        return data;
    }

}

export { QRCodeModel };
