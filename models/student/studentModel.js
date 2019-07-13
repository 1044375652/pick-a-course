const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    "school_no" : String,
    "name" : String,
    "sex" : Number,
    "pwd" : String,
    "init_pwd" : String,
    "is_modify" : Number,
    "grade" : Number
});

studentSchema.statics.addData = function (data) {
    const student = new Student(data);
    return student.save();
};

studentSchema.statics.deleteData = function () {
    this.deleteMany({},function () {

    });
};

const Student = mongoose.model("Student",studentSchema,"student");


module.exports = Student;
