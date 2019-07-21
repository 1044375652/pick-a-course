const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    "cid": String,
    "name": String,
    "dayofweek": String,
    "number": Number,
    "allow": [String],
    "teacher": String,
    "briefintro": String
});

courseSchema.statics.addData = function (data) {
    return this.insertMany(data);
};

courseSchema.statics.addOneData = function (data) {
    const course = new Course(data);
    return course.save();
};

courseSchema.statics.selectData = function (limit) {
    return this.find(limit);
};

courseSchema.statics.deleteData = function () {
    this.deleteMany({}, function () {
    });
};

courseSchema.statics.deleteDataByCid = function (limit) {
    return this.deleteOne(limit);
};

courseSchema.statics.updateOneData = function (cid, limit) {
    return this.updateOne({"cid": cid}, limit);
};

courseSchema.statics.findAndModifyOneData = function (query, limit) {
    return this.updateOne(query, limit);
};


const Course = mongoose.model("Course", courseSchema, "course");


module.exports = Course;
