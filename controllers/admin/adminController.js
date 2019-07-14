const Admin = require("../../models/admin/adminModel");
const {returnErrorRes} = require("../../uitls/utils");
const {returnSuccessRes} = require("../../uitls/utils");
const {studentSexMsgToCode} = require("../../uitls/utils");
const {createInitPwd} = require("../../uitls/utils");
const {md5Crypto} = require("../../uitls/utils");
const {studentGradeMsgToCode} = require("../../uitls/utils");
const formidable = require("formidable");
const xlsx = require("node-xlsx");
const fs = require('fs');
const Student = require("../../models/student/studentModel");


function admin(req, res) {
    res.render("admin/login");
}


function adminLogin(req, res) {
    if (req.body.hasOwnProperty("pwd") &&
        req.body.hasOwnProperty("userName") &&
        (req.body.userName.length > 0) &&
        (req.body.pwd.length > 0)) {
        let obj = {
            "userName": req.body.userName,
            "pwd": req.body.pwd,
        };
        Admin.selectData(obj).then(function (docs) {
            if (docs.length < 1) {
                res.json(returnErrorRes("用户不存在"));
            } else {
                req.session.userName = obj.userName;
                res.json(returnSuccessRes("登录成功", {
                    "url": "/admin/condition",//成功的页面
                    "userName": obj.userName
                }));
            }
        }).catch(function (err) {
            console.log("我报错了！！！！", err);
            return;
        });
    } else {
        res.json(returnErrorRes("数据错误！！"));
    }
}

function adminCondition(req, res) {
    if (!req.session.userName) {
        res.json(returnErrorRes("您还未登录，请登录", {
            "url": "/admin/login"
        }));
    } else {
        res.render("admin/condition");
    }

}

function getAdminStudentPage(req, res) {
    if (!req.session.userName) {
        res.json(returnErrorRes("您还未登录，请登录", {
            "url": "/admin/login"
        }));
    } else {
        res.render("admin/student");
    }

}

function getAdminStudentExcel(req, res) {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = './upload';
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.json(returnErrorRes("上传失败"));
            return;
        }
        if (JSON.stringify(files) === "{}") {
            res.json(returnErrorRes("请选择文件"));
            return;
        }
        if (files.hasOwnProperty("studentExcel")) {
            res.json(returnErrorRes("上传失败"));
            return;
        }
        const reg = RegExp(/.xlsx/);
        if (!reg.test(files.studentExcel.name)) {
            fs.unlinkSync(files.studentExcel.path);
            res.json(returnErrorRes("请上传Excel格式的文件"));
            return;
        }
        const studentExcelArr = xlsx.parse(files.studentExcel.path);
        Student.deleteData();
        for (let items of studentExcelArr) {
            for (let item of items.data) {
                const initPwd = createInitPwd();
                let student = {
                    "school_no": item[0],
                    "name": item[1],
                    "sex": studentSexMsgToCode(item[2]),
                    "pwd": md5Crypto(initPwd),
                    "init_pwd": initPwd,
                    "is_modify": 0,
                    "grade": studentGradeMsgToCode(items.name),
                };
                Student.addData(student);
            }
        }
        res.json(returnSuccessRes("上传成功"));

    });
}

exports.admin = admin;
exports.adminLogin = adminLogin;
exports.adminCondition = adminCondition;
exports.getAdminStudentPage = getAdminStudentPage;
exports.getAdminStudentExcel = getAdminStudentExcel;
