const express = require('express');
const router = express.Router();
const User = require('../model/users');
const Work = require('../model/works');
const Region = require('../model/regions');
const WorkTitle = require('../model/work_titles');
const StartTime = require('../model/start_times');
const EndTime = require('../model/end_time');
const Remark = require('../model/remark');
const TempReport = require('../model/tempReport');
const middle = require('../routes/middlewares');
const moment = require('moment');
const mongoose = require('mongoose');
const func = require('../controller/functions');

// 작업일지 화면(등록화면)
router.get('/', middle.isLoggedIn, async (req, res, next) => {
  const region = await Region.find({});
  const work_title = await WorkTitle.find({});
  const remark = await Remark.find({});
  const user = await User.findOne({_id: req.session.passport.user._id});
  let last_work = await Work.findOne({user_id: req.session.passport.user._id}).sort({'date': -1});
  // 최근에 등록한 작업이 없는 경우 공란으로 넣어준다.
  if (!last_work) last_work = {'region': '', 'start_time': '', 'end_time': ''};
  res.render('work', {
    page_frame: 'login-page',
    title: '작업일지 등록',
    user: user,
    region: region,
    work_title: work_title,
    remark: remark,
    last_work: last_work
  });
});
// 작업일지 리스트
router.get('/list', middle.isLoggedIn, async (req, res, next) => {
  const list = await Work.find({user_id: req.session.passport.user._id}).populate('user_id');
  await res.render('my_works', {
    page_frame: 'login-page',
    title: '작업일지내역',
    list: list
  })
});
// 작업일지 수정 화면
router.get('/update/:id', middle.isLoggedIn, async (req, res, next) => {
  let query = {user_id: req.session.passport.user._id, _id: req.params.id};
  const data = await Work.findOne(query);
  const region = await Region.find({});
  const work_title = await WorkTitle.find({});
  const start_time = await StartTime.find({}).sort('start_time');
  const end_time = await EndTime.find({}).sort('end_time');
  const remark = await Remark.find({});
  res.render('work_update', {
    page_frame: 'login-page',
    title: '작업일지수정',
    data: data,
    region: region,
    work_title: work_title,
    start_time: start_time,
    end_time: end_time,
    remark: remark
  })
});
// 작업일지 수정
router.post('/update/:id', middle.isLoggedIn, async (req, res, next) => {
  const exWork = await Work.findOne({
    user_id: req.session.passport.user._id, work_date: req.body.work_date,
    _id: {$ne: req.params.id}
  });
  if (exWork) res.json({result: 2, message: 'already exist same date'});
  else {
    Work.update({user_id: req.session.passport.user._id, _id: req.params.id}, {$set: req.body}, (err, output) => {
      if (err) return res.status(500).json({result: 9, message: 'db error'});
      if (!output.n) return res.status(404).json({result: 0, error: 'data not found'});
      res.json({result: 1, message: 'update success'});
    });
  }
});
// 작업일지 입력
router.post('/insert', async (req, res, next) => {
  // 기존에 등록된 작업인지 확인
  const exWork = await Work.findOne({user_id: req.session.passport.user._id, work_date: req.body.work_date});
  if (exWork) {
    res.json({result: 0})
  } else {
    // 신규 등록
    const newWork = await Work.create({
      // user_id:req.session.passport.user.user_id,
      user_id: req.session.passport.user._id,
      work_date: req.body.work_date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      work_team: req.body.work_team,
      work_place: req.body.work_place,
      work_title: req.body.work_title,
      work_title_etc: req.body.work_title_etc,
      region: req.body.region_name,
      remarks: req.body.remarks,
      remarks_etc: req.body.remarks_etc
    });
    res.json({result: 1, insert: newWork});
  }
});

// 가동보고서
router.get('/report/:month?', middle.isLoggedIn, async (req, res) => {
  let user_id = req.session.passport.user._id;
  let today = moment(), day = moment(today).format('DD'), start_date = 26, month_start, month_end;
  let month = req.params.month || moment(today).format('MM');
  let search_year = moment(today).format('YYYY');
  let search_month = moment(today).format('MM');

  // 지정한 달이 있을 경우
  if (typeof req.params.month !== 'undefined') {
    search_year = month.split('-')[0];
    search_month = month.split('-')[1];
    month_start = moment(month).month(parseInt(moment(month).format('MM')) - 1).subtract(1, 'month').date(start_date).format('YYYY-MM-DD');
    month_end = moment(month).month(parseInt(moment(month).format('MM')) - 1).date(start_date - 1).format('YYYY-MM-DD');
  }
  // 지정한 달이 없을 경우, 오늘을 기준으로 조회됨.
  else {
    // 오늘 날짜가 기준일보다 클 경우, 가동보고서 기준월은 다음달.
    if (day < start_date) {
      month_start = moment(today).subtract(1, 'month').date(start_date).format('YYYY-MM-DD');
      month_end = moment(today).date(start_date - 1).format('YYYY-MM-DD');
    } else {
      month_start = moment(today).date(start_date).format('YYYY-MM-DD');
      month_end = moment(today).add(1, 'month').date(start_date - 1).format('YYYY-MM-DD');
    }
  }
  console.log('start : ', month_start, ', end : ', month_end);
  // 시작일 종료일 기준으로 임시 데이터를 TempReport Collection 에 저장한다.
  let arrPeriod = func.getDatesInPeriod(month_start, month_end);
  let period_query = [], obj = {};
  for (let day of arrPeriod.by('day')) {
    obj = {};
    obj['work_date'] = day.format('YYYY-MM-DD') + 'T00:00:00';
    obj['user_id'] = user_id;
    period_query.push(obj);
  }
  await TempReport.deleteMany({user_id: user_id});
  await TempReport.insertMany(period_query);

  let report_list = await TempReport.aggregate([
    {
      $match:{user_id:mongoose.Types.ObjectId(user_id)}
    },
    {
      $lookup: {
        from: 'works',
        let: {
          ref_date: '$work_date',
          ref_id: '$user_id'
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
        as:'works'
      }
    },
    {
      $unwind:{
        path:'$works',
        preserveNullAndEmptyArrays:true
      }
    }
  ]);

  // let query = {$and: []};
  // query['$and'].push({user_id: user_id});
  // query['$and'].push({work_date: {$gte: month_start}});
  // query['$and'].push({work_date: {$lte: month_end}});
  //
  // const list = await Work.find(query).populate('user_id').sort({date: 1});

  // 유저 정보 추출
  const user_info = await User.findOne({_id: user_id});
  // 근무한 월 추출
  const groupByMonth = await Work.aggregate([
    {$match: {user_id: mongoose.Types.ObjectId(user_id)}},
    {$group: {_id: {$substr: ['$work_date', 0, 7]}}}
  ]);
  await res.render('my_works_report', {
    page_frame: 'login-page',
    title: '작업일지내역',
    report_list: report_list,
    user_info: user_info,
    groupByMonth: groupByMonth,
    search_month: search_month,
    search_year: search_year
  })
});
module.exports = router;