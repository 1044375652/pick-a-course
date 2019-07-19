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

courseSchema.statics.selectData = function (limit) {
    return this.find(limit);
};

courseSchema.statics.deleteData = function () {
    this.deleteMany({}, function () {
    });
};


const Course = mongoose.model("Course", courseSchema, "course");


module.exports = Course;
