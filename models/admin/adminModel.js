const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {md5Crypto} = require("../../uitls/utils");


const adminSchema = new Schema({
    "userName": String,
    "pwd": String
});

//增
adminSchema.statics.addData = function (obj) {
    let data = new Admin({
        "userName": obj.userName,
        "pwd": md5Crypto(obj.pwd),
    });
    data.save();
};
//删
//改
//查
adminSchema.statics.selectData = function (obj) {
    return this.find({
        "userName": obj.userName,
        "pwd": md5Crypto(obj.pwd),
    });
};

const Admin = mongoose.model("Admin", adminSchema, 'admin');


module.exports = Admin;
