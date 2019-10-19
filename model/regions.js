const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 부서 스키마
const regionSchema = new Schema({
  id:mongoose.Schema.Types.ObjectId,
  region_name:{type:String, required:true, unique:true}
});
module.exports = mongoose.model('Region', regionSchema);