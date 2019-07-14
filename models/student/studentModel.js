const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    "school_no": String,
    "name": String,
    "sex": Number,
    "pwd": String,
    "init_pwd": String,
    "is_modify": Number,
    "grade": Number
});

studentSchema.statics.addData = function (data) {
    const student = new Student(data);
    student.save();
};

studentSchema.statics.deleteData = function () {
    this.deleteMany({}, function () {

    });
};

studentSchema.statics.selectData = function (limit = {}) {
    return this.find(limit, {"_id": 0, "_v": 0});
};

const Student = mongoose.model("Student", studentSchema, "student");


module.exports = Student;
