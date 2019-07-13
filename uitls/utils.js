const crypto = require("crypto");

function md5Crypto(plaintext) {
    let md5 = crypto.createHash("md5");
    md5.update(plaintext);
    let ciphertext = md5.digest("hex");
    return ciphertext.toLowerCase();
}

function returnErrorRes(msg, data = {}) {
    return {
        "code": -1,
        "msg": msg,
        "data": data
    }
}

function returnSuccessRes(msg, data = {}) {
    return {
        "code": 200,
        "msg": msg,
        "data": data
    }
}

function studentGradeCodeToMsg(code) {
    let msg = "";
    switch (code) {
        case 0 :
            msg = "初一";
            break;
        case 1 :
            msg = "初二";
            break;
        case 2 :
            msg = "初三";
            break;
        case 3 :
            msg = "高一";
            break;
        case 4 :
            msg = "高二";
            break;
        case 5 :
            msg = "高三";
            break;
    }
    return msg;
}


function studentGradeMsgToCode(msg) {
    let code = 0;
    switch (msg) {
        case "初一" :
            code = 0;
            break;
        case "初二" :
            code = "1";
            break;
        case "初三" :
            code = 2;
            break;
        case "高一" :
            code = 3;
            break;
        case "高二" :
            code = 4;
            break;
        case "高三" :
            code = 5;
            break;
    }
    return code;
}


function studentSexCodeToMsg(code) {
    let msg = "";
    switch (code) {
        case 0 :
            msg = "男";
            break;
        case 1 :
            msg = "女";
            break;
    }
    return msg;
}

function studentSexMsgToCode(msg) {
    let code = 0;
    switch (msg) {
        case  "男":
            code = 0;
            break;
        case "女" :
            code = 1;
            break;
    }
    return code;
}

function createInitPwd() {
    const salt = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pwd = "";
    while (!isSimplePwd(pwd)) {
        pwd = "";
        for (let i = 0; i < 6; i++) {
            pwd += salt.charAt(Math.random() * salt.length);
        }
    }
    return pwd;

}

function isSimplePwd(pwd) {
    let lv = 0;
    if (pwd.match(/[0-9]/g)) {
        lv++;
    }
    if (pwd.match(/[a-z]/g)) {
        lv++;
    }
    if (pwd.match(/[A-Z]/g)) {
        lv++;
    }
    return lv >= 3;
}

exports.md5Crypto = md5Crypto;
exports.returnErrorRes = returnErrorRes;
exports.returnSuccessRes = returnSuccessRes;
exports.studentGradeCodeToMsg = studentGradeCodeToMsg;
exports.studentGradeMsgToCode = studentGradeMsgToCode;
exports.studentSexCodeToMsg = studentSexCodeToMsg;
exports.studentSexMsgToCode = studentSexMsgToCode;
exports.createInitPwd = createInitPwd;
