/**
 * @fileoverview
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 *
 * @author davidshimjs
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 */
// QRCode for JavaScript
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html

const QRCodeLimitLength = [[17,14,11,7], [32,26,20,14], [53,42,32,24], [78,62,46,34], [106,84,60,44], [134,106,74,58], [154,122,86,64], [192,152,108,84], [230,180,130,98], [271,213,151,119], [321,251,177,137], [367,287,203,155], [425,331,241,177], [458,362,258,194], [520,412,292,220], [586,450,322,250], [644,504,364,280], [718,560,394,310], [792,624,442,338], [858,666,482,382], [929,711,509,403], [1003,779,565,439], [1091,857,611,461], [1171,911,661,511], [1273,997,715,535], [1367,1059,751,593], [1465,1125,805,625], [1528,1190,868,658], [1628,1264,908,698], [1732,1370,982,742], [1840,1452,1030,790], [1952,1538,1112,842], [2068,1628,1168,898], [2188,1722,1228,958], [2303,1809,1283,983], [2431,1911,1351,1051], [2563,1989,1423,1093], [2699,2099,1499,1139], [2809,2213,1579,1219], [2953,2331,1663,1273]];

/**
 * CanvasDrawing
 */
class CanvasDrawing {

    constructor(el, htOption) {
        const self = this;

        this._bIsPainted = false;

        this._htOption = htOption;
        this._elCanvas = document.createElement("canvas");
        this._elCanvas.width = htOption.width;
        this._elCanvas.height = htOption.height;
        el.appendChild(this._elCanvas);
        this._el = el;
        this._oContext = this._elCanvas.getContext("2d");
        this._bIsPainted = false;
        this._elImage = document.createElement("img");
        this._elImage.alt = "Scan me!";
        this._elImage.style.display = "none";
        this._el.appendChild(this._elImage);
        this._bSupportDataURI = null;

        function _onMakeImage() {
            self._elImage.src = self._elCanvas.toDataURL("image/png");
            self._elImage.style.display = "block";
            self._elCanvas.style.display = "none";
        }

        /**
         * Check whether the user's browser supports Data URI or not
         * @param {Function} fSuccess Occurs if it supports Data URI
         * @param {Function} fFail Occurs if it doesn't support Data URI
         */
        function _safeSetDataURI(fSuccess, fFail) {
            self._fFail = fFail;
            self._fSuccess = fSuccess;
            // Check it just once
            if (self._bSupportDataURI === null) {
                let el = document.createElement("img");
                let fOnError = function() {
                    self._bSupportDataURI = false;
                    if (self._fFail) self._fFail.call(self);
                };
                let fOnSuccess = function() {
                    self._bSupportDataURI = true;
                    if (self._fSuccess) self._fSuccess.call(self);
                };
                el.onabort = fOnError;
                el.onerror = fOnError;
                el.onload = fOnSuccess;
                el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
                return;
            } else if (self._bSupportDataURI === true && self._fSuccess) {
                self._fSuccess.call(self);
            } else if (self._bSupportDataURI === false && self._fFail) {
                self._fFail.call(self);
            }
        };

        /** Draw the QRCode */
        this.draw = function(oQRCode) {
            var _elImage = self._elImage;
            var _oContext = self._oContext;
            var _htOption = self._htOption;

            var nCount = oQRCode.getModuleCount();
            var nWidth = _htOption.width / nCount;
            var nHeight = _htOption.height / nCount;
            var nRoundedWidth = Math.round(nWidth);
            var nRoundedHeight = Math.round(nHeight);

            _elImage.style.display = "none";
            self.clear();

            for (var row = 0; row < nCount; row++) {
                for (var col = 0; col < nCount; col++) {
                    var bIsDark = oQRCode.isDark(row, col);
                    var nLeft = col * nWidth;
                    var nTop = row * nHeight;
                    _oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
                    _oContext.lineWidth = 1;
                    _oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
                    _oContext.fillRect(nLeft, nTop, nWidth, nHeight);

                    // 안티 앨리어싱 방지 처리
                    _oContext.strokeRect(
                        Math.floor(nLeft) + 0.5,
                        Math.floor(nTop) + 0.5,
                        nRoundedWidth,
                        nRoundedHeight
                    );

                    _oContext.strokeRect(
                        Math.ceil(nLeft) - 0.5,
                        Math.ceil(nTop) - 0.5,
                        nRoundedWidth,
                        nRoundedHeight
                    );
                }
            }

            self._bIsPainted = true;
        };

        /** Make the image from Canvas if the browser supports Data URI */
        this.makeImage = function() {
            if (self._bIsPainted) _safeSetDataURI.call(self, _onMakeImage);
        };

        /** Return whether the QRCode is painted or not */
        this.isPainted = function() { return self._bIsPainted; };

        /** Clear the QRCode */
        this.clear = function() {
            self._oContext.clearRect(0, 0, self._elCanvas.width, self._elCanvas.height);
            self._bIsPainted = false;
        };

        this.round = function(nNumber) {
            if (!nNumber) return nNumber;
            return Math.floor(nNumber * 1000) / 1000;
        };

    }
}





let useSVG = document.documentElement.tagName.toLowerCase() === "svg";


let Drawing;
if (useSVG) {
    Drawing = SvgDrawing;
} else if (! SUPPORTS_CANVAS_RENDERING) {
    Drawing = HtmlDrawing;
} else {
    Drawing = CanvasDrawing;
}





/**
 * @class QRCode
 *
 * @example
 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
 *
 * @example
 * const qrCode = new QRCode("test", { text : "http://naver.com", width : 128, height : 128 });
 * // Clear & re-create the QRCode
 * oQRCode.clear();
 * oQRCode.makeCode("http://map.naver.com");
 *
 * @param {HTMLElement|String} el target element or 'id' attribute of element
 * @param {Object|String} vOption
 * @param {String} vOption.text QRCode link data
 * @param {Number} [vOption.width=256]
 * @param {Number} [vOption.height=256]
 * @param {String} [vOption.colorDark="#000000"]
 * @param {String} [vOption.colorLight="#ffffff"]
 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
 */
class QRCode {

    constructor(el, vOption) {
        this._htOption = {
            width: 256,
            height: 256,
            typeNumber: 4,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRErrorCorrectLevel.H,
            useSVG: false,
        };

        if (typeof vOption === 'string') vOption = { text: vOption };
        if (vOption) for (let i in vOption) this._htOption[i] = vOption[i];
        if (typeof el == "string") el = document.getElementById(el);

        if (this._htOption.useSVG) Drawing = svgDrawer;

        this._el = el;
        this._oQRCode = null;
        this._oDrawing = new Drawing(this._el, this._htOption);

        if (this._htOption.text) {
            this.makeCode(this._htOption.text);
        }
    }

}

/**
 * Make the QRCode
 *
 * @param {String} sText link data
 */
QRCode.prototype.makeCode = function (sText) {
    this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
    this._oQRCode.addData(sText);
    this._oQRCode.make();
    this._el.title = sText;
    this._oDrawing.draw(this._oQRCode);
    this.makeImage();
};

/** Make the Image from Canvas element */
QRCode.prototype.makeImage = function () {
    if (typeof this._oDrawing.makeImage == "function") this._oDrawing.makeImage();
};

/**
 * Clear the QRCode
 */
QRCode.prototype.clear = function () {
    this._oDrawing.clear();
};

/**
 * @name QRCode.CorrectLevel
 */
QRCode.CorrectLevel = QRErrorCorrectLevel;

export { QRCode };

/*********** Internal **********/

/**
 * Get the type by string length
 *
 * @private
 * @param {String} sText
 * @param {Number} nCorrectLevel
 * @return {Number} type
 */
function _getTypeNumber(sText, nCorrectLevel) {
    function _getUTF8Length(sText) {
        var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
        return replacedText.length + (replacedText.length != sText ? 3 : 0);
    }

    var nType = 1;
    var length = _getUTF8Length(sText);

    for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
        var nLimit = 0;

        switch (nCorrectLevel) {
            case QRErrorCorrectLevel.L :
                nLimit = QRCodeLimitLength[i][0];
                break;
            case QRErrorCorrectLevel.M :
                nLimit = QRCodeLimitLength[i][1];
                break;
            case QRErrorCorrectLevel.Q :
                nLimit = QRCodeLimitLength[i][2];
                break;
            case QRErrorCorrectLevel.H :
                nLimit = QRCodeLimitLength[i][3];
                break;
        }

        if (length <= nLimit) {
            break;
        } else {
            nType++;
        }
    }

    if (nType > QRCodeLimitLength.length) {
        throw new Error("Too long data");
    }

    return nType;
}
