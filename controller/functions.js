const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

module.exports = {
  getLastMonth:()=>{
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    return new Date(year, (month - 1), day);
  },
  getToday:()=>{
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    return new Date(year, month, day);
  },
  getDatesInPeriod:(startDate, endDate)=>{
    return moment.range(startDate, endDate);
    /*  날짜 더하기  */
    // Date.prototype.addDays = function(days) {
    //   let date = new Date(this.valueOf());
    //   date.setDate(date.getDate() + days);
    //   return date;
    // };
    //
    // let dateArray = new Array();
    // let currentDate = startDate;
    // while (currentDate <= endDate) {
    //   dateArray.push(new Date (currentDate));
    //   currentDate = currentDate.addDays(1);
    // }
    // return dateArray;
  }
};