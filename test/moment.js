const moment = require('moment');
const func = require('../controller/functions');

let today = '2019-10';
// today = moment();
let month = moment(today).format('MM');
let day = moment(today).format('DD');
let start_date = 26; // 매달의 시작일을 26일으로 설정함.

let month_start;
let month_end;

// 오늘 날짜가 기준일보다 작을 경우, 가동보고서 시작하는 달은 이전 달.
if (day < start_date) {
  month_start = moment(today).subtract(1, 'month').date(start_date).format('YYYY-MM-DD');
  month_end = moment(today).date(start_date - 1).format('YYYY-MM-DD');
} else {
  month_start = moment(today).date(start_date).format('YYYY-MM-DD');
  month_end = moment(today).add(1, 'month').date(start_date - 1).format('YYYY-MM-DD');
}
if (true) {
  month_start = moment(today).month(parseInt(month) - 1).subtract(1, 'month').date(start_date).format('YYYY-MM-DD');
  month_end = moment(today).month(parseInt(month) - 1).date(start_date - 1).format('YYYY-MM-DD');
}
let arrPeriod = func.getDatesInPeriod(month_start, month_end);
console.log('period : ', arrPeriod);
console.log('month_start : ', month_start, ', month_end : ', month_end);

const Work = require('../model/works');
const TempReport = require('../model/tempReport');
const User = require('../model/users');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true}, (error) => {
  if (error) console.log('몽고디비 연결 에러', error);
  else console.log('몽고디비 연결 성공');
});

(async function main() {
  let user_id = '5d5fb2b3f83ac94ee4f0124b'; // 김현성 user_id
  let query = {$and: []};
  query['$and'].push({user_id: user_id});
  query['$and'].push({work_date: {$gte: month_start}});
  query['$and'].push({work_date: {$lte: month_end}});
  let month_work = await Work.find(query);
  // console.log(month_work);

  let groupByMonth = await Work.aggregate([
    {$match: {user_id: mongoose.Types.ObjectId(user_id)}},
    {$group: {_id: {$substr: ['$work_date', 0, 7]}}}
  ]);
  // let groupByMonth = await Work.find({user_id:user_id});
  // console.log('group by month : ', groupByMonth);
  let report_list = await TempReport.aggregate([
    {
      $match:{user_id:mongoose.Types.ObjectId(user_id)}
    },
    {
      $lookup: {
        from: 'works',
        let: {
          ref_date: '$work_date',
          ref_id:'$user_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {$eq: [{$substr: ['$work_date', 0, 10]}, {$substr: ['$$ref_date', 0, 10]}]},
                  {$eq: ['$user_id', mongoose.Types.ObjectId(user_id)]}
                ]
              }
            }
          }
        ],
        as: 'works'
      }
    },
    {
      $unwind: {
        path: '$works',
        preserveNullAndEmptyArrays: true
      }
    },
  ]);
  console.log('report_list : ', report_list);
})();