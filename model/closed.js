const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 휴무계 스키마
const closedSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  closed_type:String,
  department:String,
  rank:String,
  user_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'},  // 사용자 아이디
  application_period:String,
  days:String,
  reason:String,
  licenserName:String,
  reportDate:String,
  licenserTel:String,
  closed_year:String,
  closed_month:String,
  closed_day:String
});
module.exports = mongoose.model('Closed', closedSchema);