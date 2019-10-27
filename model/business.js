const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// business 월간 업무보고서
const businesskSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  user_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'},  // 사용자 아이디
  year:{type:Number, required:true},
  month:{type:Number, required:true},
  // 1. 현장업무 보고
  field:String,
  line:String,
  rank:String,
  align_group:String,
  field_role:String,
  field_name:String,
  field_problem:String,
  // 2. 앗차사고 및 현장사례
  accident_date:String,
  accident_location:String,
  accident_type:Array,
  accident_content:String,
  accident_problem:String,
  accident_manual:String,
  accident_example:String,
  // 3. 현장업무 skill 및 일본어 능력 자가 평가
  rail_year:Number,
  rail_month:Number,
  skill_rail_type:String,
  zcu_year:Number,
  zcu_month:Number,
  skill_zcu_type:String,
  teaching_year:Number,
  teaching_month:Number,
  skill_teaching_type:String,
  stb_year:Number,
  stb_month:Number,
  skill_stb_type:String,
  azfs_year:Number,
  azfs_month:Number,
  skill_azfs_type:String,
  vhl_year:Number,
  vhl_month:Number,
  skill_vhl_type:String,
  hid_year:Number,
  hid_month:Number,
  skill_hid_type:String,
  cls_year:Number,
  cls_month:Number,
  skill_cls_type:String,
  zt_year:Number,
  zt_month:Number,
  skill_zt_type:String,
  jp_year:Number,
  jp_month:Number,
  skill_jp_type:String,
  // 4. 기숙사 점검 내용 5. 기타 사항
  dormitory:String,
  etc:String
});
module.exports = mongoose.model('Business', businesskSchema);