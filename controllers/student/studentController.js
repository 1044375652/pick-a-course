const {md5Crypto} = require("../../uitls/utils");
const Student = require("../../models/student/studentModel");
const {returnErrorRes} = require("../../uitls/utils");
const {returnSuccessRes} = require("../../uitls/utils");
const Course = require("../../models/admin/adminCourseModel");
const {returnLimitArr} = require("../../uitls/utils");



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
                req.session.grade = docs[0].grade;
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

function getStudentCourse(req, res) {
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
    let limit = {};
    if (keyword.length > 0) {
        const reg = new RegExp(keyword, "gi");
        limit = {
            $or: [
                {
                    "cid": {
                        $regex: reg
                    }
                },
                {
                    "teacher": {
                        $regex: reg
                    }
                }
            ]
        };
    }

    Course.selectData(limit).then(function (docs) {
        const count = Math.ceil(docs.length / size);
        const lastIndex = ((index * 10 + size) > docs.length) ? docs.length : (index * 10 + size);
        const courseArr = returnLimitArr(docs, index * 10, lastIndex);
        const newPage = page;
        return res.json(returnSuccessRes("请求数据成功", {
            "count": count,
            "page": newPage,
            "data": courseArr
        }));
    });
}

function exit(req, res) {
    req.session.destroy();
    res.json(returnSuccessRes("退出成功", {
        "url": "/login_page"
    }));
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
exports.getStudentCourse = getStudentCourse;
exports.exit = exit;
