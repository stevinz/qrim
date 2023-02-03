import { QR8bitByte } from './QR8bitByte.js';
import { QRBitBuffer } from './QRBitBuffer.js';
import { QRPolynomial } from './QRPolynominal.js';
import { QRErrorCorrectLevel, QRRSBlock } from './QRRSBlock.js';
import { QRUtil } from './QRUtils.js';

export const QRCodeLimitLength = [
    [  17,   14,   11,    7], [  32,   26,   20,   14], [  53,   42,   32,   24], [  78,   62,   46,   34],
    [ 106,   84,   60,   44], [ 134,  106,   74,   58], [ 154,  122,   86,   64], [ 192,  152,  108,   84],
    [ 230,  180,  130,   98], [ 271,  213,  151,  119], [ 321,  251,  177,  137], [ 367,  287,  203,  155],
    [ 425,  331,  241,  177], [ 458,  362,  258,  194], [ 520,  412,  292,  220], [ 586,  450,  322,  250],
    [ 644,  504,  364,  280], [ 718,  560,  394,  310], [ 792,  624,  442,  338], [ 858,  666,  482,  382],
    [ 929,  711,  509,  403], [1003,  779,  565,  439], [1091,  857,  611,  461], [1171,  911,  661,  511],
    [1273,  997,  715,  535], [1367, 1059,  751,  593], [1465, 1125,  805,  625], [1528, 1190,  868,  658],
    [1628, 1264,  908,  698], [1732, 1370,  982,  742], [1840, 1452, 1030,  790], [1952, 1538, 1112,  842],
    [2068, 1628, 1168,  898], [2188, 1722, 1228,  958], [2303, 1809, 1283,  983], [2431, 1911, 1351, 1051],
    [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273],
];

/**
 * QRCodeModel
 */
class QRCodeModel {

    constructor(sText, errorCorrectLevel) {
        // Get type number
        let nType = 1;
        let length = QRUtil.toUTF8(sText).length;
        for (let i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
            let nLimit = 0;
            switch (errorCorrectLevel) {
                case QRErrorCorrectLevel.L: nLimit = QRCodeLimitLength[i][0]; break;
                case QRErrorCorrectLevel.M: nLimit = QRCodeLimitLength[i][1]; break;
                case QRErrorCorrectLevel.Q: nLimit = QRCodeLimitLength[i][2]; break;
                case QRErrorCorrectLevel.H: nLimit = QRCodeLimitLength[i][3]; break;
            }
            if (length <= nLimit) break;
            nType++;
        }
        if (nType > QRCodeLimitLength.length) throw new Error("QRCode.makeCode: Data too long");

        this.typeNumber = nType;
        this.errorCorrectLevel = errorCorrectLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];

        // Add data
        this.dataList.push(new QR8bitByte(sText));

        // Make
        this.dataCache = null;
        this.makeImpl(false, this.getBestMaskPattern());
    }

    isDark(row,col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) throw new Error(row + "," + col);
        return this.modules[row][col];
    }

    getModuleCount() {
        return this.moduleCount;
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
