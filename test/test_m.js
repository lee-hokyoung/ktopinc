let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDate();
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

let start = new Date(year, month -1, day);
let end = new Date(year, month, day);
let period = moment.range(start, end);
console.log(start, end);
console.log(period);
console.log(period.start.format('YYYY-MM-DD'));
console.log('year : ', moment().format('YYYY'));
console.log('month : ', moment().format('MM'));