const {md5Crypto} = require("../../uitls/utils");
const Student = require("../../models/student/studentModel");
const {returnErrorRes} = require("../../uitls/utils");
const {returnSuccessRes} = require("../../uitls/utils");
const Course = require("../../models/admin/adminCourseModel");
const CourseSelectionCondition = require("../../models/public/courseSelectionCondition");
const {returnLimitArr} = require("../../uitls/utils");


function index(req, res) {
    if (isLogin(req)) {
        res.render("student/index");
        return;
    } else {
        res.render("student/login");
        return;
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
            "pwd": md5Crypto(req.body.pwd)
        };
        Student.selectData(obj).then(function (docs) {
            if (docs.length < 1) {
                return res.json(returnErrorRes("用户不存在"));
            } else {
                req.session.userName = obj.school_no;
                req.session.isModify = docs[0].is_modify;
                req.session.grade = docs[0].grade;
                return res.json(returnSuccessRes("登录成功", {
                    "url": "/index",//成功的页面
                    "userName": obj.school_no,
                    "isModify": docs[0].is_modify
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
    if (!isLogin(req)) {
        res.render("student/login");
        return;
    } else {
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
        let limit = {
            "allow": req.session.grade
        };
        if (keyword.length > 0) {
            const reg = new RegExp(keyword, "gi");
            limit = {
                "allow": req.session.grade,
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

}

function exit(req, res) {
    req.session.destroy();
    res.json(returnSuccessRes("退出成功", {
        "url": "/login_page"
    }));
}

function modifyPwdBySchoolNo(req, res) {
    if (!isLogin(req)) {
        res.render("student/login");
        return;
    } else {
        if (req.params.hasOwnProperty("school_no") &&
            req.body.hasOwnProperty("oldPwd") &&
            req.body.hasOwnProperty("newPwd")) {
            const schoolNo = req.params.school_no;
            const oldPwd = req.body.oldPwd;
            const newPwd = req.body.newPwd;
            const query = {
                "school_no": schoolNo,
                "pwd": md5Crypto(oldPwd)
            };
            const update = {
                "pwd": md5Crypto(newPwd),
                "is_modify": 1,
            };
            Student.selectOneAndUpdate(query, update).then(function (docs) {
                if (docs) {
                    return res.json(returnSuccessRes("修改成功"));
                }
                return res.json(returnErrorRes("修改失败"));
            });
        } else {
            return res.json(returnErrorRes("数据不全"));
        }
    }
}

function studentCourseSelection(req, res) {
    if (!isLogin(req)) {
        return res.redirect("/login_page");
    }
    if (req.params.hasOwnProperty("school_no") &&
        req.body.hasOwnProperty("cid") &&
        req.body.hasOwnProperty("name") &&
        req.body.hasOwnProperty("teacher") &&
        req.body.hasOwnProperty("dayofweek") &&
        (req.params.school_no.length > 0) &&
        (req.body.cid.toString().length > 0) &&
        (req.body.teacher.length > 0) &&
        (req.body.dayofweek.length > 0) &&
        (req.body.name.length > 0)) {
        const schoolNo = req.params.school_no;
        const cid = req.body.cid;
        const course_name = req.body.name;
        const teacher = req.body.teacher;
        const dayofweek = req.body.dayofweek;
        const query = {
            "school_no": schoolNo
        };
        CourseSelectionCondition.selectData(query)
            .then(function (docs) {
                if (docs.length >= 2) {
                    throw "您已选课程已达上限";
                }
                query.cid = cid;
                return CourseSelectionCondition.selectData(query);
            })
            .then(function (docs) {
                if (docs.length > 0) {
                    throw "您已经选了这门课程了";
                }
                const courseQuery = {
                    "cid": cid,
                    "number": {
                        $gt: 0
                    }
                };
                const exec = {
                    $inc: {
                        "number": -1
                    }
                };
                return Course.findAndModifyOneData(courseQuery, exec);
            })
            .then(function (docs) {
                if (!docs) {
                    throw "您选的这门课数量已经满了";
                }
                query.course_name = course_name;
                query.teacher = teacher;
                query.dayofweek = dayofweek;
                return CourseSelectionCondition.addOneData(query);
            })
            .then(function (docs) {
                if (docs) {
                    return res.json(returnSuccessRes("选课成功"));
                } else {
                    return res.json(returnErrorRes("选课失败"));
                }
            })
            .catch(function (e) {
                return res.json(returnErrorRes(e))
            });
    } else {
        return res.json(returnErrorRes("数据不全"));
    }
}

function studentGetCourseSelection(req, res) {
    if (!isLogin(req)) {
        return res.redirect("login_page");
    }
    if (req.params.hasOwnProperty("school_no") &&
        (req.params.school_no.length > 0)) {
        const school_no = req.params.school_no;
        const query = {
            "school_no": school_no
        };
        CourseSelectionCondition.selectData(query)
            .then(function (docs) {
                if (!docs) {
                    return res.json(returnErrorRes("请求数据失败"));
                }
                return res.json(returnSuccessRes("请求数据成功", docs));
            });
    } else {
        return res.json(returnErrorRes("数据不全"));
    }
}

function studentDeleteCourse(req, res) {
    if (!isLogin(req)) {
        return res.redirect("/login_page");
    }
    if (req.params.hasOwnProperty("cid") &&
        req.params.cid.toString().length > 0) {
        const cid = req.params.cid;
        const query = {
            "cid": cid
        };
        Course.selectData(query)
            .then(function (docs) {
                if (!docs) {
                    throw "并没有这门课程";
                }
            })
            .then(function () {
                return Course.findAndModifyOneData(query, {$inc: {"number": 1}});
            })
            .then(function (docs) {
                if (!docs) {
                    throw "更新数据库失败";
                }
                query.school_no = req.session.userName;
                return CourseSelectionCondition.findOneDataAndDelete(query);
            })
            .then(function (docs) {
                if (!docs) {
                    throw "您并没有选择这么课程";
                }
                return res.json(returnSuccessRes("退课成功!"));
            })
            .catch(function (e) {
                return res.json(returnErrorRes(e));
            });
    } else {
        return res.json(returnErrorRes("数据不全"));
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
exports.getStudentCourse = getStudentCourse;
exports.exit = exit;
exports.modifyPwdBySchoolNo = modifyPwdBySchoolNo;
exports.studentCourseSelection = studentCourseSelection;
exports.studentGetCourseSelection = studentGetCourseSelection;
exports.studentDeleteCourse = studentDeleteCourse;
