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
  closed_day:String,
  status:{type:Number, default:1}, // 정상 : 1, 삭제요청 중 :  2, 삭제상태 : 3
  path:String,              // 첨부파일 경로
  original:String,          // 첨부파일 이름
  improvePath:String,       // 증빙파일 경로
  improveOriginal:String,   // 증빙파일 이름
});
module.exports = mongoose.model('Closed', closedSchema);