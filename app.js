const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const adminController = require("./controllers/admin/adminController");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");

mongoose.connect("mongodb://localhost:27017/pick-course", {useNewUrlParser: true});

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
app.get("/admin/student",adminController.getAdminStudentPage);
app.post("/admin/student/excel",adminController.getAdminStudentExcel);
app.get("/admin/student/detail",adminController.getAdminStudent);
app.put("/admin/exit",adminController.exit);


app.get("/student", function (req, res) {
    res.send("学生登录");
});

app.get("/test",function (req,res) {
   console.log(req.session);
});



app.use(express.static("public"));

app.get("/*", function (req, res) {
    res.send("喔哦，页面不存在");
});

app.listen(3000);
console.log("服务已经运行在3000端口");
