const express = require('express');
const router = express.Router();
const User = require('../model/users');
const Work = require('../model/works');
const Region = require('../model/regions');
const WorkTitle = require('../model/work_titles');
const StartTime = require('../model/start_times');
const EndTime = require('../model/end_time');
const Remark = require('../model/remark');
const Business = require('../model/business');
const Closed = require('../model/closed');
const TempReport = require('../model/tempReport');
const Notice = require('../model/notice');
const Config = require('../model/config');
const middle = require('../routes/middlewares');
const moment = require('moment');
const mongoose = require('mongoose');
const func = require('../controller/functions');
const Excel = require('exceljs');

// 파일 업로드 관련 모듈
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 작업일지 화면(등록화면)
router.get('/', middle.isLoggedIn, async (req, res, next) => {
  const region = await Region.find({});
  const work_title = await WorkTitle.find({});
  const remark = await Remark.find({});
  const user_id = req.session.passport.user._id;
  const user = await User.findOne({_id: user_id});
  let last_work = await Work.findOne({user_id: user_id}).sort({'date': -1});
  const notice_list = await Notice.find({}).sort({created: -1}).limit(5);

  // 최근에 등록한 작업이 없는 경우 공란으로 넣어준다.
  if (!last_work) last_work = {'region': '', 'start_time': '', 'end_time': ''};

  // 해당월에 제출된 월간업무 보고서가 있는지 확인
  let isReportBusiness = false;
  let date = new Date();
  let business = await Business.findOne({user_id:mongoose.Types.ObjectId(user_id), month:date.getMonth() + 1});
  if(business){
    isReportBusiness = true;
  }

  res.render('work', {
    page_frame: 'login-page',
    title: '작업일지 등록',
    user: user,
    region: region,
    work_title: work_title,
    remark: remark,
    last_work: last_work,
    notice_list: notice_list,
    isReportBusiness:isReportBusiness
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
  let config = await Config.findOne({});
  let user_id = req.session.passport.user._id;
  let today = moment(), day = moment(today).format('DD'), start_date = config.report_start,
    end_date = config.report_end, month_start, month_end;
  let month = req.params.month || moment(today).format('MM');
  let search_year = moment(today).format('YYYY');
  let search_month = moment(today).format('MM');

  // 지정한 달이 있을 경우
  if (typeof req.params.month !== 'undefined') {
    search_year = month.split('-')[0];
    search_month = month.split('-')[1];
    month_start = moment(month).month(parseInt(moment(month).format('MM')) - 1).subtract(1, 'month').date(start_date).format('YYYY-MM-DD');
    month_end = moment(month).month(parseInt(moment(month).format('MM')) - 1).date(end_date).format('YYYY-MM-DD');
  }
  // 지정한 달이 없을 경우, 오늘을 기준으로 조회됨.
  else {
    // 오늘 날짜가 기준일보다 클 경우, 가동보고서 기준월은 다음달.
    if (day < start_date) {
      month_start = moment(today).subtract(1, 'month').date(start_date).format('YYYY-MM-DD');
      month_end = moment(today).date(start_date - 1).format('YYYY-MM-DD');
    } else {
      month_start = moment(today).date(start_date).format('YYYY-MM-DD');
      month_end = moment(today).add(1, 'month').date(end_date).format('YYYY-MM-DD');
    }
  }
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
      $match: {user_id: mongoose.Types.ObjectId(user_id)}
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
        as: 'works'
      }
    },
    {
      $unwind: {
        path: '$works',
        preserveNullAndEmptyArrays: true
      }
    }
  ]);

  // let query = {$and: []};
  // query['$and'].push({user_id: user_id});
  // query['$and'].push({work_date: {$gte: month_start}});
  // query['$and'].push({work_date: {$lte: month_end}});
  //
  // const list = await Work.find(query).populate('user_id').sort({date: 1});

  /*  작업관리 관련 정보 추출
  *   1. 지역
  *   2. 작업명
  *   3. 비고
  */
  let region_info = await Region.find({});
  let work_info = await WorkTitle.find({});
  let remark_info = await Remark.find({});

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
    search_year: search_year,
    region_info: region_info,
    work_info: work_info,
    remark_info: remark_info
  });
});
// 가동보고서 엑셀 다운로드
router.post('/report/excel', middle.isLoggedIn, async (req, res) => {
  let excel_data = req.body.excel_data || [];
  let doc_name = req.body.doc_name || '가동보고서';
  const workbook = new Excel.Workbook();
  let dir = './docs/' + req.session.passport.user._id;
  workbook.xlsx.readFile('./docs/operate_report.xlsx')  //Change file name here or give file path
    .then(function () {
      let worksheet = workbook.getWorksheet('sheet1');
      excel_data.forEach((v) => {
        worksheet.getCell(Object.keys(v)).value = v[Object.keys(v)];
      });
      // 스타일 입히기 및 비고란 입력
      for (let i = 4; i < 45; i++) {
        ['M' + i].forEach(function (cell) {
          worksheet.getCell(cell).border = {
            bottom: {style: 'dotted', color: {argb: '00000000'}},
            right: {style: 'thin', color: {argb: '00000000'}}
          }
        });
      }
      worksheet.getCell('L5').border = {bottom:{style:'thin'}, right:{style:'thin'}};
      worksheet.getCell('L44').border = {top:{style:'thin'}, right:{style:'thin'}};

      ['A47', 'B47', 'C47', 'D47', 'E47', 'F47', 'G47'].forEach(function (cell) {
        worksheet.getCell(cell).border = {
          left: {style: 'thin', color: {argb: '00000000'}},
          bottom: {style: 'thin', color: {argb: '00000000'}}
        };
      });
      ['I46', 'G5', 'G45'].forEach(function (cell) {
        worksheet.getCell(cell).border = {
          top: {style: 'thin', color: '000000'},
          bottom: {style: 'thin', color: '000000'},
          left: {style: 'thin', color: '000000'},
          right: {style: 'thin', color: '000000'}
        };
      });
      worksheet.getCell('I46').value = '現場責任者様承認印';
      worksheet.getCell('I46').font = {underline: true};
      // 스타일 입히기 및 비고란 입력 끝

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      let filePath = dir + '/' + doc_name + '.xlsx';
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      workbook.xlsx.writeFile(filePath).then(function () {
        res.json({download_path: filePath});
      });
    });
});

// 월간업무보고서
router.get('/business', middle.isLoggedIn, async (req, res) => {
  let user_id = req.session.passport.user._id;
  const user_info = await User.findOne({_id: user_id});
  res.render('my_business_report', {
    user_info: user_info,
    title: '월간업무보고서'
  });
});
// 월간업무보고서 리스트
router.get('/business/list', middle.isLoggedIn, async (req, res) => {
  let user_id = req.session.passport.user._id;
  let list = await Business.find({user_id: user_id}).sort({year: -1, month: -1});
  // 해당월에 제출된 월간업무 보고서가 있는지 확인
  let isReportBusiness = false;
  let date = new Date();
  let business = await Business.findOne({user_id:mongoose.Types.ObjectId(user_id), month:date.getMonth() + 1});
  if(business){
    isReportBusiness = true;
  }
  res.render('my_business_report_list', {
    list: list,
    title: '월간업무보고서',
    isReportBusiness:isReportBusiness,
    business:business
  });
});
// 월간업무보고서 읽기
router.get('/business/:id/:year/:month', middle.isLoggedIn, async (req, res) => {
  let data = await Business
    .findOne({user_id: req.params.id, year: req.params.year, month: req.params.month})
    .populate('user_id');
  res.render('my_business_report_read', {
    data: data,
    title: '월간업무보고서'
  });
});
// 월간업무보고서 작성
router.post('/business', middle.isLoggedIn, async (req, res) => {
  // 해당월에 제출된 월간업무 보고서가 있는지 확인
  let user_id = req.session.passport.user._id;
  let business = await Business.findOne({user_id:mongoose.Types.ObjectId(user_id), month:req.body.month});
  if(business){
    res.json({code:0, message:'이미 등록되어 있는 월간업무보고서가 있습니다.'})
  }else{
    let data = req.body;
    data['user_id'] = user_id;
    await Business.create(data);
    res.json({code:1, message:'정상적으로 등록되었습니다.'});
  }
});
// 월간업무보고서 수정
router.put('/business/:_id', middle.isLoggedIn, async (req, res) => {
  let result = await Business.updateMany({_id: req.params._id}, req.body);
  res.json(result);
});

// 휴무계 작성
router.post('/closed/write', middle.isLoggedIn, async (req, res) => {
  let data = req.body;
  if (data.path) {
    let paths = data.path.split(',');
    paths.forEach(function (v) {
      fs.createReadStream('./' + v)
        .pipe(fs.createWriteStream('./docs_closed' + v.replace('temp_closed_attach', '')));
    });
  }
  let user_id = req.session.passport.user._id;
  data['user_id'] = user_id;
  let result = await Closed.create(data);
  res.json(result);
});
// 휴무계 리스트
router.get('/closed/list', middle.isLoggedIn, async (req, res) => {
  const user = await User.findOne({_id: req.session.passport.user._id});
  let user_id = req.session.passport.user._id;
  let list = await Closed.find({user_id: user_id});
  list.sort(function (a, b) {
    let date_a = new Date(a.closed_year, a.closed_month, a.closed_day);
    let date_b = new Date(b.closed_year, b.closed_month, b.closed_day);
    return (date_a < date_b ? 1 : -1);
  });
  res.render('my_closed_list', {
    list: list,
    user: user,
    title:'휴무계'
  });
});
// 휴무계 읽기
router.get('/closed/:id', middle.isLoggedIn, async (req, res) => {
  let doc = await Closed.findOne({_id: mongoose.Types.ObjectId(req.params.id)}).populate('user_id');
  res.json(doc);
});
// 휴무계 삭제 -> 삭제요청으로 변경
router.patch('/closed/:id', middle.isLoggedIn, async (req, res) => {
  let result = await Closed.updateOne(
    {_id: mongoose.Types.ObjectId(req.params.id)},
    {$set: {status: 2}}
  );
  res.json(result);
});
// 휴무계 파일 업로드
const uploadClosedAttach = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './temp_closed_attach');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    }
  }),
  limit: {fileSize: 2 * 1024 * 1024}
});
router.post('/closed/upload', middle.isLoggedIn, uploadClosedAttach.array('closedAttach[]', 10), async (req, res) => {
  let dir = './temp_closed_attach';
  fs.readdir(dir, (err, files) => {
    if (!err) {
      let upload_files = req.files.map((v) => {
        return v.filename
      });
      for (let file of files) {
        if (upload_files.indexOf(file) === -1)
          fs.unlink(path.join(dir, file), err => {
            if (err) throw err;
          });
      }
    }
  });
  let files = await req.files;
  res.json(files);
});

// 증빙파일 제출
const uploadImprove = multer({
  storage:multer.diskStorage({
    destination(req, file, cb){
      cb(null, './temp_closed_improve');
    },
    filename(req, file, cb){
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    }
  }),
  limit:{fileSize:2 * 1024 * 1024}
});
router.post('/closed/uploadImprove/:doc_id', middle.isLoggedIn, uploadImprove.single('fileImprove'), async(req, res) => {
  let dir = './temp_closed_improve';
  try{
    // temp_closed_improve 폴더 내에 있는 파일 중 현재 올라온 파일 외에 모두 삭제
    let filename = req.file.filename;
    fs.readdir(dir, (err, files) => {
      if (!err) {
        for (let file of files) {
          if (file !== filename)
            fs.unlink(path.join(dir, file), err => {
              if (err) throw err;
            });
        }
      }
    });
    // docs/user_id 폴더로 복사
    let doc_dir = './docs/' + req.session.passport.user._id;
    if(req.file.path){
      fs.createReadStream('./' + req.file.path)
        .pipe(fs.createWriteStream(doc_dir + '/' + filename));
    }
    // 휴무계 데이터 값에 경로와 파일 이름 업데이트
    let result = await Closed.updateOne({_id:req.params.doc_id}, {$set:{improvePath:doc_dir + '/' + req.file.filename, improveOriginal:req.file.originalname}})
    res.json({code:1, message:'등록성공', result:result});
  }catch(e){
    console.error(e);
    res.json({code:0, message:'등록실패', errorMsg:e});
  }
});
module.exports = router;
