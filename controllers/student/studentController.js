const {md5Crypto} = require("../../uitls/utils");
const Student = require("../../models/student/studentModel");
const {returnErrorRes} = require("../../uitls/utils");
const {returnSuccessRes} = require("../../uitls/utils");

function index(req, res) {
    if (isLogin(req)) {
        res.render("student/index");
    } else {
        res.render("student/login");
    }
}

function getLoginPage(req, res) {
    res.render("student/login");
}

function login(req, res) {
    if (req.body.hasOwnProperty("pwd") &&
        req.body.hasOwnProperty("userName") &&
        (req.body.userName.length > 0) &&
        (req.body.pwd.length > 0)) {
        let obj = {
            "school_no": req.body.userName,
            "pwd": md5Crypto(req.body.pwd),
        };
        Student.selectData(obj).then(function (docs) {
            if (docs.length < 1) {
                return res.json(returnErrorRes("用户不存在"));
            } else {
                req.session.userName = obj.school_no;
                return res.json(returnSuccessRes("登录成功", {
                    "url": "/index",//成功的页面
                    "userName": obj.userName
                }));
            }
        }).catch(function (err) {
            console.log("我报错了！！！！", err);
            return;
        });
    } else {
        return res.json(returnErrorRes("数据错误！！"));
    }
}

function isLogin(req) {
    if (req.session.userName) {
        return true;
    } else {
        return false;
    }
}


exports.getLoginPage = getLoginPage;
exports.index = index;
exports.login = login;
