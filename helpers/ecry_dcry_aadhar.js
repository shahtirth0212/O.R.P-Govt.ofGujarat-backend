const CRYPTOJS = require("crypto-js");
require("dotenv/config");
exports.encrypt_aadhar = (aadhar) => {
    for (var field in aadhar) {
        if (field == 'aadharNumber') {
            continue;
        } else {
            aadhar[field] = CRYPTOJS.AES.encrypt(aadhar.field, process.env.CRYPTO_SECRET_KEY).toString();
        }
    }
    return aadhar;
}
exports.encrypt_string = (plaintext) => {
    return CRYPTOJS.AES.encrypt(plaintext, process.env.CRYPTO_SECRET_KEY).toString();
}

exports.decrypt_string = (cipher) => {
    return CRYPTOJS.AES.decrypt(cipher, process.env.CRYPTO_SECRET_KEY).toString(CRYPTOJS.enc.Utf8);
}