/**
 * QRMath
 */
class QRMath {

    static #initialized = false;
    static #expTable = new Array(256);
    static #logTable = new Array(256);

    static populate() {
        if (QRMath.#initialized) return;
        for (let i = 0; i < 8; i++) QRMath.#expTable[i] = 1 << i;
        for (let i = 8; i < 256; i++) QRMath.#expTable[i] = QRMath.#expTable[i - 4]^QRMath.#expTable[i - 5]^QRMath.#expTable[i - 6]^QRMath.#expTable[i - 8];
        for (let i = 0; i < 255; i++) QRMath.#logTable[QRMath.#expTable[i]] = i;
        QRMath.#initialized = true;
    }

    static glog(n) {
        if (n < 1) throw new Error("QRMath.glog(" + n + ")");
        return QRMath.#logTable[n];
    }

    static gexp(n) {
        while (n < 0) n += 255;
        while (n >= 256) n -= 255;
        return QRMath.#expTable[n];
    }

}

QRMath.populate();

export { QRMath };
