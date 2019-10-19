const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 작업타이틀 스키마
const titleSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  work_title:{type:String, required:true, unique:true},
});
module.exports = mongoose.model('WorkTitle', titleSchema);