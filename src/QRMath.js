/**
 * QRMath
 */
class QRMath {

    static #initialized = false;

    static #populate() {
        if (QRMath.#initialized) return;
        for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
        for (let i = 8; i < 256; i++) QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];
        for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
        QRMath.#initialized = true;
    }

    static EXP_TABLE = new Array(256);
    static LOG_TABLE = new Array(256);

    static glog(n) {
        if (n < 1) throw new Error("glog(" + n + ")");
        return QRMath.LOG_TABLE[n];
    }

    static gexp(n) {
        if (! QRMath.#initialized) QRMath.#populate();
        while (n < 0) { n += 255; }
        while (n >= 256) { n -= 255; }
        return QRMath.EXP_TABLE[n];
    }

}

export { QRMath };
