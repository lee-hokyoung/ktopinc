const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 비고란 스키마
const bigoSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  bigo:{type:String, required:true, unique:true},
});
module.exports = mongoose.model('Bigo', bigoSchema);