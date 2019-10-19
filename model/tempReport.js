const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/*  임시작업일 스키마. 조회된 기간에 대해 해당 기간에 대한 작업일 스키마를 임시로 만든다 */
const tempReportSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,      // ID
  work_date:{type: Date, required:true, format:'YYYY-MM-DD'},  // 근무일
  user_id:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],  // 사용자 아이디
});
module.exports = mongoose.model('TempReport', tempReportSchema);