const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const adminController = require("./controllers/admin/adminController");
const studentController = require("./controllers/student/studentController");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");

mongoose.connect("mongodb://localhost:27017/pick-course", {useNewUrlParser: true, useFindAndModify: false});

let app = express();


app.engine("html", ejs.__express);
app.set("view engine", "html");

app.use(cookieParser("salt"));
app.use(session({
    secret: "salt",
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/", function (req, res) {
    res.send("Welcome");
});

app.get("/admin", adminController.admin);
app.post("/admin/login", adminController.adminLogin);
app.get("/admin/condition", adminController.adminCondition);
// 老师  - 学生管理
app.get("/admin/student", adminController.getAdminStudentPage);
app.post("/admin/student/excel", adminController.getAdminStudentExcel);
app.get("/admin/student/detail", adminController.getAdminStudent);
app.put("/admin/exit", adminController.exit);
app.post("/admin/student/addition", adminController.adminAddOneStudent);
app.delete("/admin/student/deletion/:school_no", adminController.adminDeleteStudentBySchoolNo);
app.put("/admin/student/renewal/:school_no", adminController.adminUpdateStudent);
app.get("/admin/student/export", adminController.exportStudentExcel);
// 老师 - 课程管理
app.get("/admin/course", adminController.getAdminCoursePage);
app.post("/admin/course/json", adminController.getAdminCourseJson);
app.get("/admin/course/detail", adminController.getAdminCourse);
app.post("/admin/course/addition", adminController.adminAddOneCourse);
app.delete("/admin/course/deletion/:cid", adminController.adminDeleteCourseByCid);
app.put("/admin/course/renewal/:cid", adminController.adminUpdateCourse);
app.get("/admin/course/export", adminController.exportCourseExcel);
app.get("/admin/course_condition/detail", adminController.adminGetCourseSelection);
app.get("/admin/course_condition/export", adminController.exportSelectionsMsgExcel);


// 学生
app.get("/login_page", studentController.getLoginPage);
app.post("/student/login", studentController.login);
app.get("/index", studentController.index);
app.get("/student/course/detail", studentController.getStudentCourse);
app.put("/student/exit", studentController.exit);
app.put("/student/course/renewal/:school_no", studentController.modifyPwdBySchoolNo);
app.post("/student/course/selection/:school_no", studentController.studentCourseSelection);
app.get("/student/course_condition/detail/:school_no", studentController.studentGetCourseSelection);
app.delete("/student/course_condition/deletiion/:cid", studentController.studentDeleteCourse);

app.get("/student", function (req, res) {
    res.send("学生登录");
});

app.get("/test", function (req, res) {
    console.log(req.session);
});


app.use(express.static("public"));

app.get("/*", function (req, res) {
    res.send("喔哦，页面不存在");
});

app.listen(3000);
console.log("服务已经运行在3000端口");
