import CryptoJS from "crypto-js";

const RAW_SECRET = '@9JXyZ3=xk&)_oqPZ.Yc(*96n^M0H%0YwR7LqE2UO#@e5Zx8c$1F4=!';
const SECRET_KEY = CryptoJS.SHA256(RAW_SECRET);

export function __listenEncryptData(data) {
    const iv = CryptoJS.lib.WordArray.random(16); // 128-bit IV

    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        SECRET_KEY,
        {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    // Store iv + cipher together
    return iv.toString(CryptoJS.enc.Hex) + ":" + encrypted.toString();
}

export function __listenDecryptData(cipherText) {
    if (!cipherText) return null;

    try {
        const [ivHex, encryptedData] = cipherText.split(":");
        if (!ivHex || !encryptedData) return null;

        const iv = CryptoJS.enc.Hex.parse(ivHex);

        const bytes = CryptoJS.AES.decrypt(
            encryptedData,
            SECRET_KEY,
            {
                iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }
        );

        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) return null;

        return JSON.parse(decrypted);
    } catch (e) {
        console.error("Decrypt error:", e);
        return null;
    }
}
