const Admin = require("../../models/admin/adminModel.js");
const {returnErrorRes} = require("../../uitls/utils");
const {returnSuccessRes} = require("../../uitls/utils");
const session = require("express-session");

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
            if(docs.length < 1){
                res.json(returnErrorRes("用户不存在"));
            }else{
                req.session.userName = obj.userName;
                res.json(returnSuccessRes("登录成功",{
                    "url" : "/admin/condition",//成功的页面
                    "userName" : obj.userName
                }));
            }
        }).catch(function (err) {
            console.log("我报错了！！！！",err);
            return;
        });
    } else {
        res.json(returnErrorRes("数据错误！！"));
    }
}

function adminCondition(req,res){
    if(!req.session.userName){
        res.json(returnErrorRes("您还未登录，请登录",{
            "url" : "/admin/login"
        }));
    }else{
        res.render("admin/condition");
    }

}

function getAdminStudentPage(req,res){
    if(!req.session.userName){
        res.json(returnErrorRes("您还未登录，请登录",{
            "url" : "/admin/login"
        }));
    }else{
        res.render("admin/student");
    }

}

exports.admin = admin;
exports.adminLogin = adminLogin;
exports.adminCondition = adminCondition;
exports.getAdminStudentPage = getAdminStudentPage;
