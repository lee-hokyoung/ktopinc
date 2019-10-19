const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 퇴근시간 스키마
const endTimeSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  end_time:{type:String, required:true, unique:true},
});
module.exports = mongoose.model('EndTime', endTimeSchema );