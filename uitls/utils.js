const crypto = require("crypto");

function md5Crypto(plaintext) {
    let md5 = crypto.createHash("md5");
    md5.update(plaintext);
    let ciphertext = md5.digest("hex");
    return ciphertext.toLowerCase();
}

function returnErrorRes(msg,data = {}) {
    return {
        "code": -1,
        "msg": msg,
        "data" : data
    }
}

function returnSuccessRes(msg, data = {}) {
    return {
        "code": 200,
        "msg": msg,
        "data": data
    }
}

exports.md5Crypto = md5Crypto;
exports.returnErrorRes = returnErrorRes;
exports.returnSuccessRes = returnSuccessRes;
