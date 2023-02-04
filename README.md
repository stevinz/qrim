# QRCode.js
JavaScript library for generating QR Codes with stylization options, UTF8 support and no dependencies. Available as an ES6 import.

## Usage
Html file
```javascript
<div id="qrcode"></div>
```
Js file
```javascript
import { QRCode } from '@stevinz/qrcode';

const qrcode = new QRCode(document.getElementById("qrcode"), "http://www.code.com");
```

## Options
Parameters object, all properties are optional
```javascript
import { QRCode } from '@stevinz/qrcode';

const qrcode = new QRCode(document.getElementById("qrcode"), {
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
qrcode.makeCode("http://www.newcode.com");

// ...or generate a code from updated parameters
const params = {
    text: "http://www.newcode.com",
    size: 2048,
    opacity: 0.5,
};
qrcode.makeCode(params);
```
