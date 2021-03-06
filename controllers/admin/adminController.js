const Admin = require("../../models/admin/adminModel");
const {returnErrorRes} = require("../../uitls/utils");
const {returnSuccessRes} = require("../../uitls/utils");
const {studentSexMsgToCode} = require("../../uitls/utils");
const {studentSexCodeToMsg} = require("../../uitls/utils");
const {studentIsModifyCodeToMsg} = require("../../uitls/utils");
const {studentGradeCodeToMsg} = require("../../uitls/utils");
const {createInitPwd} = require("../../uitls/utils");
const {md5Crypto} = require("../../uitls/utils");
const {studentGradeMsgToCode} = require("../../uitls/utils");
const {returnLimitArr} = require("../../uitls/utils");
const {studentWeekCodeToMsg} = require("../../uitls/utils");
const formidable = require("formidable");
const xlsx = require("node-xlsx");
const fs = require('fs');
const Student = require("../../models/student/studentModel");
const Course = require("../../models/admin/adminCourseModel");
const CourseSelectionCondition = require("../../models/public/courseSelectionCondition");


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
    let limit = {};
    if (keyword.length > 0) {
        const reg = new RegExp(keyword, "gi");
        limit = {
            $or: [
                {
                    "school_no": {
                        $regex: reg
                    }
                },
                {
                    "name": {
                        $regex: reg
                    }
                }
            ]
        };
    }

    Student.selectData(limit).then(function (docs) {
        const count = Math.ceil(docs.length / size);
        const lastIndex = ((index * 10 + size) > docs.length) ? docs.length : (index * 10 + size);
        const studentArr = returnLimitArr(docs, index * 10, lastIndex);
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

function adminDeleteStudentBySchoolNo(req, res) {
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

function adminUpdateStudent(req, res) {
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

function exportStudentExcel(req, res) {
    Student.selectData()
        .then(function (docs) {
            if (docs.length < 1) {
                return res.json(returnErrorRes("老师未导入excel数据，请先导入"));
                return;
            }
            const arr = giveValue(docs);
            const buffer = xlsx.build(arr);
            fs.writeFile("./public/statics/student.xlsx", buffer, function () {
                res.redirect("/statics/student.xlsx");
                return;
            });
        });
}

//课程管理
function getAdminCoursePage(req, res) {
    if (!req.session.userName) {
        res.json(returnErrorRes("您还未登录，请登录", {
            "url": "/admin/login"
        }));
    } else {
        res.render("admin/course");
    }
}

function getAdminCourseJson(req, res) {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = './upload/';
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.json(returnErrorRes("上传失败"));
            return;
        }
        if (JSON.stringify(files) === "{}") {
            res.json(returnErrorRes("请选择文件"));
            return;
        }
        if (!files.hasOwnProperty("courseJson")) {
            res.json(returnErrorRes("上传失败"));
            return;
        }
        const reg = RegExp(/.json/);
        if (!reg.test(files.courseJson.name)) {
            fs.unlinkSync(files.courseJson.path);
            res.json(returnErrorRes("请上传json格式的文件"));
            return;
        }
        const courseJsonObj = JSON.parse(fs.readFileSync(files.courseJson.path).toString());
        for (let item of courseJsonObj.courses) {
            for (let i = 0; i < item.allow.length; i++) {
                item.allow[i] = studentGradeMsgToCode(item.allow[i]);
            }
        }
        Course.deleteData();
        Course.addData(courseJsonObj.courses).then(function () {
            res.json(returnSuccessRes("上传成功"));
            return;
        });
    });
}

function getAdminCourse(req, res) {
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
        console.log(docs);
        console.log(limit);
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


function adminAddOneCourse(req, res) {
    if (req.body.hasOwnProperty("cid") &&
        req.body.hasOwnProperty("name") &&
        req.body.hasOwnProperty("dayofweek") &&
        req.body.hasOwnProperty("number") &&
        req.body.hasOwnProperty("teacher") &&
        req.body.hasOwnProperty("briefintro") &&
        req.body.hasOwnProperty("allow")) {
        const cid = req.body.cid;
        const name = req.body.name;
        const dayOfWeek = req.body.dayofweek;
        const number = parseInt(req.body.number);
        const teacher = req.body.teacher;
        const briefIntro = req.body.briefintro;
        const allow = req.body.allow;
        const course = {
            "cid": cid,
            "name": name,
            "dayofweek": dayOfWeek,
            "number": number,
            "teacher": teacher,
            "briefintro": briefIntro,
            "allow": allow
        };
        console.log(course.allow);
        const limit = {
            $or: [
                {"cid": cid},
                {"name": name}
            ]
        };
        Course.selectData(limit).then(function (docs) {
            if (docs.length > 0) {
                res.json(returnErrorRes("当前已经拥有该课程或课程编号了"));
                return -1;
            }
            return 200;
        }).then(function (status) {
            if (status < 0) {
                return -1;
            }
            Course.addOneData(course);
            return 200;
        }).then(function (status) {
            if (status > 0) {
                return res.json(returnSuccessRes("添加成功"));
            }
            return;
        });
    } else {
        res.json(returnErrorRes("数据不全"));
        return;
    }
}

function adminDeleteCourseByCid(req, res) {
    if (req.params.hasOwnProperty("cid")) {
        const deleteCourse = {
            "cid": req.params.cid
        };
        Course.deleteDataByCid(deleteCourse).then(function (next) {
            if (next.ok == 1) {
                return res.json(returnSuccessRes("删除成功"));
            }
            return res.json(returnErrorRes("没有此课程！"));
        });
        return;
    }
    res.json(returnErrorRes("数据不全"));
    return;
}

function adminUpdateCourse(req, res) {
    if (req.params.hasOwnProperty("cid") &&
        req.body.hasOwnProperty("name") &&
        req.body.hasOwnProperty("dayofweek") &&
        req.body.hasOwnProperty("number") &&
        req.body.hasOwnProperty("teacher") &&
        req.body.hasOwnProperty("briefintro") &&
        req.body.hasOwnProperty("allow")) {
        const cid = req.params.cid;
        const obj = {
            "name": req.body.name,
            "dayofweek": req.body.dayofweek,
            "number": parseInt(req.body.number),
            "teacher": req.body.teacher,
            "briefintro": req.body.briefintro,
            "allow": req.body.allow
        };
        Course.updateOneData(cid, obj).then(function (next) {
            if (next.n == 1 && next.ok == 1) {
                return res.json(returnSuccessRes("更新成功"));
            } else {
                return res.json(returnErrorRes("更新失败"));
            }
        });
    } else {
        return res.json(returnErrorRes("数据不合法"));
    }
}

function exportCourseExcel(req, res) {
    Course.selectData()
        .then(function (docs) {
            if (docs.length < 1) {
                return res.json(returnErrorRes("老师未导入数据，请先导入"));
            }
            const data = [];
            for (let item of docs) {
                const d = [];
                d.push(item.allow);
                d.push(item.cid);
                d.push(item.name);
                d.push(item.dayofweek);
                d.push(item.number);
                d.push(item.teacher);
                d.push(item.briefintro);
                data.push(d);
            }
            const arr = [];
            arr.push({
                "name": "课程信息",
                "data": data
            });
            const buffer = xlsx.build(arr);
            fs.writeFile("./public/statics/course.xlsx", buffer, function () {
                return res.redirect("/statics/course.xlsx");
            });
        });
}

function adminGetCourseSelection(req, res) {
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
                },
                {
                    "school_no": {
                        $regex: reg
                    }
                }
            ]
        };
    }

    CourseSelectionCondition.selectData(limit).then(function (docs) {
        console.log(docs);
        console.log(limit);
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

function exportSelectionsMsgExcel(req, res) {
    CourseSelectionCondition.selectData()
        .then(function (docs) {
            if (docs.length < 1) {
                return res.json(returnErrorRes("导出错误"));
            }
            const data = [];
            data.push([
                "学生学号",
                "课程编号",
                "课程名称",
                "授课教师",
                "上课时间"
            ]);
            for (let item of docs) {
                const arr = [];
                arr.push(item.school_no);
                arr.push(item.cid);
                arr.push(item.course_name);
                arr.push(item.teacher);
                arr.push(studentWeekCodeToMsg(item.dayofweek));
                data.push(arr);
            }
            const buffer = xlsx.build([{
                "name": "学生 - 选课详情",
                "data": data
            }]);
            fs.writeFile("./public/statics/studentSelectionsMsg.xlsx", buffer, function () {
                return res.redirect("/statics/studentSelectionsMsg.xlsx");
            });
        });
}

exports.admin = admin;
exports.adminLogin = adminLogin;
exports.adminCondition = adminCondition;
// 学生管理
exports.getAdminStudentPage = getAdminStudentPage;
exports.getAdminStudentExcel = getAdminStudentExcel;
exports.getAdminStudent = getAdminStudent;
exports.exit = exit;
exports.adminAddOneStudent = adminAddOneStudent;
exports.adminDeleteStudentBySchoolNo = adminDeleteStudentBySchoolNo;
exports.adminUpdateStudent = adminUpdateStudent;
exports.exportStudentExcel = exportStudentExcel;
// 课程管理
exports.getAdminCoursePage = getAdminCoursePage;
exports.getAdminCourseJson = getAdminCourseJson;
exports.getAdminCourse = getAdminCourse;
exports.adminAddOneCourse = adminAddOneCourse;
exports.adminDeleteCourseByCid = adminDeleteCourseByCid;
exports.adminUpdateCourse = adminUpdateCourse;
exports.exportCourseExcel = exportCourseExcel;
exports.adminGetCourseSelection = adminGetCourseSelection;
exports.exportSelectionsMsgExcel = exportSelectionsMsgExcel;

function giveValue(docs) {
    const studentZero = [];
    const studentOne = [];
    const studentTwo = [];
    const studentThree = [];
    const studentFour = [];
    const studentFifth = [];
    const studentZeroObj = {
        name: "初一",
        data: studentZero
    };
    const studentOneObj = {
        name: "初二",
        data: studentOne
    };
    const studentTwoObj = {
        name: "初三",
        data: studentTwo
    };
    const studentThreeObj = {
        name: "高一",
        data: studentThree
    };
    const studentFourObj = {
        name: "高二",
        data: studentFour
    };
    const studentFifthObj = {
        name: "高三",
        data: studentFifth
    };
    const arr = [];
    arr.push(studentZeroObj);
    arr.push(studentOneObj);
    arr.push(studentTwoObj);
    arr.push(studentThreeObj);
    arr.push(studentFourObj);
    arr.push(studentFifthObj);
    studentZero.push([
        "学号",
        "姓名",
        "性别",
        "密码",
        "初始密码",
        "是否已经修改初始密码",
        "年级"
    ]);
    studentOne.push([
        "学号",
        "姓名",
        "性别",
        "密码",
        "初始密码",
        "是否已经修改初始密码",
        "年级"
    ]);
    studentTwo.push([
        "学号",
        "姓名",
        "性别",
        "密码",
        "初始密码",
        "是否已经修改初始密码",
        "年级"
    ]);
    studentThree.push([
        "学号",
        "姓名",
        "性别",
        "密码",
        "初始密码",
        "是否已经修改初始密码",
        "年级"
    ]);
    studentFour.push([
        "学号",
        "姓名",
        "性别",
        "密码",
        "初始密码",
        "是否已经修改初始密码",
        "年级"
    ]);
    studentFifth.push([
        "学号",
        "姓名",
        "性别",
        "密码",
        "初始密码",
        "是否已经修改初始密码",
        "年级"
    ]);
    for (let item of docs) {
        switch (item.grade) {
            case 0:
                studentZero.push([
                    item.school_no,
                    item.name,
                    studentSexCodeToMsg(item.sex),
                    item.pwd,
                    item.init_pwd,
                    studentIsModifyCodeToMsg(item.is_modify),
                    studentGradeCodeToMsg(item.grade)
                ]);
                break;
            case 1:
                studentOne.push([
                    item.school_no,
                    item.name,
                    studentSexCodeToMsg(item.sex),
                    item.pwd,
                    item.init_pwd,
                    studentIsModifyCodeToMsg(item.is_modify),
                    studentGradeCodeToMsg(item.grade)
                ]);
                break;
            case 2:
                studentTwo.push([
                    item.school_no,
                    item.name,
                    studentSexCodeToMsg(item.sex),
                    item.pwd,
                    item.init_pwd,
                    studentIsModifyCodeToMsg(item.is_modify),
                    studentGradeCodeToMsg(item.grade)
                ]);
                break;
            case 3:
                studentThree.push([
                    item.school_no,
                    item.name,
                    studentSexCodeToMsg(item.sex),
                    item.pwd,
                    item.init_pwd,
                    studentIsModifyCodeToMsg(item.is_modify),
                    studentGradeCodeToMsg(item.grade)
                ]);
                break;
            case 4:
                studentFour.push([
                    item.school_no,
                    item.name,
                    studentSexCodeToMsg(item.sex),
                    item.pwd,
                    item.init_pwd,
                    studentIsModifyCodeToMsg(item.is_modify),
                    studentGradeCodeToMsg(item.grade)
                ]);
                break;
            case 5:
                studentFifth.push([
                    item.school_no,
                    item.name,
                    studentSexCodeToMsg(item.sex),
                    item.pwd,
                    item.init_pwd,
                    studentIsModifyCodeToMsg(item.is_modify),
                    studentGradeCodeToMsg(item.grade)
                ]);
                break;
        }
    }
    return arr;
}
