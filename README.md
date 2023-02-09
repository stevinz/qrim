# Qrim
Qrim (QR Image Maker), a JavaScript library for generating QR Code images.

Originally forked from [qrcode.js](https://github.com/davidshimjs/qrcodejs). Removed legacy code, refactored to support ES modules, included UTF8 character support, and added stylization options.

## Install

- Option 1: Copy file `qrim.module.js`, import from file...

```javascript
import { QRCode } from 'qrim.module.js';
```

- Option 2: Install from [npm](https://www.npmjs.com/package/qrim), import from 'qrim'...
```
npm install qrim
```
```javascript
import { QRCode } from 'qrim';
```

- Option 3: Import directly from CDN...
```javascript
import { QRCode } from 'https://unpkg.com/qrim/build/qrim.module.js';
```

## Usage
```javascript
<div id="qrcode"></div>

<script type='module'>

import { QRCode } from 'qrim';

const el = document.getElementById("qrcode");
const qr = new QRCode(el, "http://www.code.com");

</script>
```

## Options
Parameters object, all properties are optional
```javascript
const qr = new QRCode(el, {
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
// make new code from new text
qr.makeCode("http://www.newcode.com");

// ...or make new code from updated parameters
const params = {
    text: "http://www.newcode.com",
    size: 2048,
    opacity: 0.5,
};
qr.makeCode(params);
```
