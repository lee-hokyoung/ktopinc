const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 공지사항 스키마
const noticeSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  title:{type:String, required:true},     // 제목
  content:{type:String, required:true},   // 내용
  writer:{type:String, required:true},    // 작성자
  read_count:{type:Number, default:0},    // 읽은 횟수
  read_user:{type:Array},                 // 읽은 사람
  path:String,                            // 임시로 파일이 저장된 경로
  download_path:String,                   // 다운로드 경로
  originalname:String,                    // 원본 파일
  created:{type:Date, default:Date.now}   // 생성일
});
module.exports = mongoose.model('Notice', noticeSchema);