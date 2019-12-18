const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 지역 스키마
const regionSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  region_name:{type:String, unique:true},
  jp_name:{type:String}
});
module.exports = mongoose.model('Region', regionSchema);