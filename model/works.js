const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 작업일지 스키마
const workSchema = new Schema({
    id:mongoose.Schema.Types.ObjectId,
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'},  // 사용자 아이디
    work_date:{type: Date, required:true},      // 근무일
    start_time:String,                          // 출근시간
    end_time:String,                            // 퇴근시간
    work_team:String,                           // 작업팀
    work_place:String,                          // 현장명
    work_title:{type:String, required:true},    // 작업사항
    work_title_etc:String,                      // 작업사항 직접입력
    region:{type:String, required:true},        // 부서(작업지)
    work_confirm:{type:Number, default:2},      // 1:확정, 2:신규
    remarks:String,         // 비고
    remarks_etc:String,     // 비고 직접입력
    date:{type: Date,default: Date.now }    // 생성일
});
// 인덱싱
workSchema.index({user_id:1, work_date:1});
module.exports = mongoose.model('Work', workSchema);