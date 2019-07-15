const Admin = require("../../models/admin/adminModel");
const {returnErrorRes} = require("../../uitls/utils");
const {returnSuccessRes} = require("../../uitls/utils");
const {studentSexMsgToCode} = require("../../uitls/utils");
const {createInitPwd} = require("../../uitls/utils");
const {md5Crypto} = require("../../uitls/utils");
const {studentGradeMsgToCode} = require("../../uitls/utils");
const {returnLimitArr} = require("../../uitls/utils");
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
        if (!files.hasOwnProperty("studentExcel")) {
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
            for (let i = 1; i < items.data.length; i++) {
                const initPwd = createInitPwd();
                const student = {
                    "school_no": items.data[i][0],
                    "name": items.data[i][1],
                    "sex": studentSexMsgToCode(items.data[i][2]),
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

function getAdminStudent(req, res) {
    const page = parseInt(req.query.page);
    const count = parseInt(req.query.count);
    if (page < 1) {
        res.json(returnErrorRes("page不能小于1"));
        return;
    }
    if (count > 1 && page > count) {
        res.json(returnErrorRes("page太大了"));
        return;
    }
    const index = page - 1;
    const size = 10;
    const keyword = req.query.keyword;
    const limit = (keyword.length < 1) ? {} : {
        $or: [
            {"school_no": keyword},
            {"name": keyword},
            {"sex": keyword},
            {"grade": keyword},
        ]
    };

    Student.selectData(limit).then(function (docs) {
        const count = Math.ceil(docs.length / size);
        const studentArr = returnLimitArr(docs, index * 10, (index * 10 + size));
        const newPage = page;
        return res.json(returnSuccessRes("请求数据成功", {
            "count": count,
            "page": newPage,
            "data": studentArr
        }));
    });

}

function exit(req, res) {
    req.session.destroy();
    res.json(returnSuccessRes("退出成功", {
        "url": "/admin"
    }));
}

function adminAddOneStudent(req, res) {
    if (req.body.hasOwnProperty("userName") &&
        req.body.hasOwnProperty("schoolNo") &&
        req.body.hasOwnProperty("grade") &&
        req.body.hasOwnProperty("sex") &&
        req.body.hasOwnProperty("initPwd")) {
        const userName = req.body.userName;
        const schoolNo = req.body.schoolNo;
        const grade = req.body.grade;
        const sex = req.body.sex;
        const initPwd = req.body.initPwd;
        const student = {
            "school_no": schoolNo,
            "userName": userName,
            "grade": grade,
            "sex": sex,
            "init_pwd": initPwd,
            "pwd": md5Crypto(initPwd),
            "is_modify": 0
        };
        Student.addData(student).then(function () {
            res.json(returnSuccessRes("添加学生成功"));
            return;
        });
    } else {
        res.json(returnErrorRes("数据不全"));
        return;
    }
}

function addminDeleteStudentBySchoolNo(req, res) {
    if (req.params.hasOwnProperty("school_no")) {
        const deletePeople = {
            "school_no": req.params.school_no
        };
        Student.deleteDataBySchoolNo(deletePeople);
        res.json(returnSuccessRes("删除成功"));
        return;
    }
    res.json(returnErrorRes("数据不全"));
    return;
}

function addminUpdateStudent(req, res) {
    if (req.params.hasOwnProperty("school_no") &&
        req.body.hasOwnProperty("userName") &&
        req.body.hasOwnProperty("grade") &&
        req.body.hasOwnProperty("sex") &&
        req.body.hasOwnProperty("initPwd")) {
        const schoolNo = req.params.school_no;
        const obj = {
            "name": req.body.userName,
            "grade": req.body.grade,
            "sex": req.body.sex,
            "init_pwd": req.body.initPwd,
        };
        Student.updateStudentMsg(schoolNo, obj);
        res.json(returnSuccessRes("更新成功"));
        return;
    }
    res.json(returnErrorRes("数据不合法"));
    return;
}

exports.admin = admin;
exports.adminLogin = adminLogin;
exports.adminCondition = adminCondition;
exports.getAdminStudentPage = getAdminStudentPage;
exports.getAdminStudentExcel = getAdminStudentExcel;
exports.getAdminStudent = getAdminStudent;
exports.exit = exit;
exports.adminAddOneStudent = adminAddOneStudent;
exports.addminDeleteStudentBySchoolNo = addminDeleteStudentBySchoolNo;
exports.addminUpdateStudent = addminUpdateStudent;
