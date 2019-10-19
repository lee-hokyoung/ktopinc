const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 비고란 스키마
const remarkSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  remark:{type:String, required:true, unique:true},
});
module.exports = mongoose.model('Remark', remarkSchema);