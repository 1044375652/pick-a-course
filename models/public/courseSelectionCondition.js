const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSelectionConditionSchema = new Schema({
    "cid": String,
    "course_name": String,
    "school_no": String,
    "teacher": String,
    "dayofweek": String,
});

courseSelectionConditionSchema.statics.selectData = function (query = {}) {
    return this.find(query);
};

courseSelectionConditionSchema.statics.addOneData = function (data) {
    const obj = new CourseSelectionCondition(data);
    return obj.save();
};

courseSelectionConditionSchema.statics.findOneDataAndDelete = function (query) {
    return this.findOneAndDelete(query);
};

const CourseSelectionCondition = mongoose.model("CourseSelectionCondition", courseSelectionConditionSchema, "courseSelectionCondition");

module.exports = CourseSelectionCondition;
