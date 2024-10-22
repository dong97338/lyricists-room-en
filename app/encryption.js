// encryption.js
import CryptoJS from 'crypto-js';

// AES를 사용하여 데이터 암호화
export function encrypt(data, key) {
    const ciphertext = CryptoJS.AES.encrypt(data, key).toString();
    return ciphertext;
}

// AES를 사용하여 암호화된 데이터 복호화
export function decrypt(ciphertext, key) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}
