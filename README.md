# Qrim
Qrim (QR Image Maker), a JavaScript library for generating QR Code images.

Origianly forked from [qrcode.js](https://github.com/davidshimjs/qrcodejs). Removed legacy code, refactored to support ES modules, included UTF8 character support, and added stylization options.

## Usage
```javascript
<div id="qrcode"></div>

<script type='module'>

import { QRCode } from 'qrim';

// Call options:
// = new QRCode(HTMLElement, String);
// = new QRCode(HTMLElement, Params Object);
const qr = new QRCode(document.getElementById("qrcode"), "http://www.code.com");

</script>
```

## Options
Parameters object, all properties are optional
```javascript
import { QRCode } from 'qrim';

const qr = new QRCode(document.getElementById("qrcode"), {
    text: "http://www.domain.com",          // text to generate
    size: 1024,                             // image dimensions
    colorDark : "#000000",                  // block color
    colorLight : "#ffffff",                 // background color
    border: 1,                              // border size, in # of blocks
    padding: 1,                             // padding size, in # of blocks
    opacity: 1,                             // image opacity
    style: QRCode.Styles.Square,            // Square | Blob | Dots
    correctLevel: QRErrorCorrectLevel.H,    // L | M | Q | H
});
```

## Methods
```javascript
// Generate a code from new text
qr.makeCode("http://www.newcode.com");

// ...or generate a code from updated parameters
const params = {
    text: "http://www.newcode.com",
    size: 2048,
    opacity: 0.5,
};
qr.makeCode(params);
```
