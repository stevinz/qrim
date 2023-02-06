// Post Build Header
function header() {
	return {
		renderChunk(code) {
			return `/**
 * @description Qrim (QR Image Maker)
 * @about       Stylized JavaScript QR Code image generator with UTF8 support.
 * @license     MIT - Copyright (c) 2023 Stephens Nunnally
 * @source      https://github.com/stevinz/qrim
 * @version     v1.0.1
 * @author      stevinz (module)        https://github.com/stevinz/qrcodejs
 * @author      19z (UTF-8)             https://github.com/19z/qrcodejs-fixUTF8
 * @author      davidshimjs (bundle)    https://github.com/davidshimjs/qrcodejs
 * @author      kazuhikoarase           https://github.com/kazuhikoarase/qrcode-generator
 * @trademark   QR Code ® DENSO WAVE    https://www.qrcode.com
 */
${code}`;
        }
    };
}

export default [
	{
		input: './src/index.js',

		plugins: [
            header(),
        ],

		output: {
			format: 'esm',
			file: './build/qrim.module.js',
			sourcemap: false,
		},
	}
];