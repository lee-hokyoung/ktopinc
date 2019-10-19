const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 출근시간 스키마
const startTimeSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  start_time:{type:String, required:true, unique:true},
});
module.exports = mongoose.model('StartTime', startTimeSchema );