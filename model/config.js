const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 환경설정 스키마
const configSchema = new Schema({
  report_start:Number,
  report_end:Number
});
module.exports = mongoose.model('Config', configSchema);