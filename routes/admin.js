const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Work = require('../model/works');
const User = require('../model/users');
const Region = require('../model/regions');
const WorkTitle = require('../model/work_titles');
const StartTime = require('../model/start_times');
const EndTime = require('../model/end_time');
const TempWork = require('../model/tempWork');
const Remark = require('../model/remark');
const Notice = require('../model/notice');
const Business = require('../model/business');
const Closed = require('../model/closed');

// 파일 업로드 관련 모듈
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const moment = require('moment');
const middle = require('../routes/middlewares');
const func = require('../controller/functions');

// 관리자 화면. 처음 화면은 직원관리가 나옴
router.get('/', middle.isAdmin, async (req, res, next) => {
  const member = await User.find({lv: {$lt: 2}});
  const region = await Region.find({});
  res.render('admin_member', {
    page_frame: 'login-page',
    title: 'K-TOP 직원관리',
    side_active: 'member',
    member: member,
    region: region
  });
});
// 직원 상태 수정
router.put('/member/:id/:status', middle.isAdmin, async (req, res, next) => {
  const result = await User.update({_id: req.params.id}, {$set: {status: req.params.status}});
  res.json(result);
});
// 직원 프로필
router.get('/memberProfile/:id', middle.isAdmin, async (req, res) => {
  const user = await User.findOne({_id: req.params.id});
  res.json(user.toObject());
});
// 관리자 화면. 근태관리 화면
router.all('/attendance', middle.isAdmin, async (req, res, next) => {
  const page = req.body.page || 1;
  let size = parseInt(req.body.entries) || 30;
  if (req.method === 'PATCH') size = 65536;
  const limit = size;
  const skip = size * (page - 1);
  let member_work = [];
  let start_period, end_period;
  if (req.method === 'POST' || req.method === 'PATCH') {
    start_period = new Date(
      parseInt(req.body.attendance_start.substr(0, 4)),
      parseInt(req.body.attendance_start.substr(6, 2)) - 1,
      parseInt(req.body.attendance_start.substr(10, 2))
    );
    end_period = new Date(
      parseInt(req.body.attendance_end.substr(0, 4)),
      parseInt(req.body.attendance_end.substr(6, 2)) - 1,
      parseInt(req.body.attendance_end.substr(10, 2))
    );
  } else {
    start_period = func.getLastMonth();
    end_period = func.getToday();
  }
  /*  기간을 만드는 Schema  */
  let allUser = await User.find({lv: 1, status: 1}, {_id: 1});
  let arrPeriod = func.getDatesInPeriod(start_period, end_period);
  let query = [], obj = {};
  for (let day of arrPeriod.by('day')) {
    obj = {};
    obj['work_date'] = day.format('YYYY-MM-DD') + 'T00:00:00';
    obj['user_id'] = allUser;
    query.push(obj);
  }
  await TempWork.deleteMany({});
  await TempWork.insertMany(query);
  // let s_date = arrPeriod.start.format('YYYY-MM-DD');
  // let e_date = arrPeriod.end.format('YYYY-MM-DD');
  /*  이름, 부서, 입력된 작업만 보기 검색시 추가 쿼리 */
  let match_users = {$match: {$and: [{}]}};
  let match_works = {$match: {$and: [{}]}};
  if (req.body.user_nick) match_users.$match.$and.push({'users.user_nick': req.body.user_nick});
  if (req.body.region) match_works.$match.$and.push({'works.region': req.body.region});
  if (req.body.isDataOnly === '1') match_works.$match.$and.push({'works.region': {$exists: true}});
  let work_list = await TempWork.aggregate([
    {$project: {_id: 0, user_id: 1, work_date: '$work_date'}},
    {
      $unwind: {
        path: '$user_id'
      }
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
                  {$eq: ['$user_id', '$$ref_id']}
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
    match_works,
    {
      $lookup: {
        from: 'users',
        let: {ref_id: '$user_id'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$ref_id']}}},
          {$project: {_id: 0, user_nick: '$user_nick', han_id: '$han_id'}}
        ],
        as: 'users'
      }
    },
    {
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true
      }
    },
    match_users,
    {$sort: {'work_date': -1}},
    {
      $facet: {
        'metadata': [
          {$count: 'total'},
          {$addFields: {page: page, limit: limit}}
        ],
        'data': [
          {$skip: skip}, {$limit: limit}
        ]
      }
    }
  ]);
  const member = await User.find({lv: 1});
  // if(req.params.id) {
  //     total = await Work.find({user_id:id}).count();
  //     member_work = await Work.find({user_id:id}).limit(limit).skip(skip);
  // }
  if (req.method === 'PATCH') {
    res.json(work_list);
  } else {
    res.render('admin_attendance', {
      page_frame: 'login-page',
      title: 'K-TOP 근태관리',
      side_active: 'attendance',
      member: member,
      member_work: member_work,
      // member_id:id,
      // current_page:parseInt(page),
      page_info: work_list[0].metadata,
      work_list: work_list[0].data,
      start_period: start_period,
      end_period: end_period,
      user_nick: req.body.user_nick,
      region: req.body.region,
      isDataOnly: req.body.isDataOnly
    });
  }
});
// 근태관리 신규/확정 id 별로 수정
router.put('/attendance/:id/:confirm', middle.isAdmin, async (req, res, next) => {
  const id = req.params.id;
  const work_confirm = req.params.confirm;
  const member = await Work.findOne({_id: id});
  if (!member) res.json({result: 0, message: '해당 작업이 없습니다. 관리자에게 문의해주세요.'});
  else {
    const result = await Work.update({_id: id}, {$set: {work_confirm: work_confirm}});
    if (result.nModified === 1)
      res.json({result: 1, message: '수정성공'});
    else
      res.json({result: 2, message: '수정실패. 관리자에게 문의해주세요'});
  }
});
// 근태관리 신규/확정 일괄수정
router.put('/attendance/confirm', middle.isAdmin, async (req, res, next) => {
  const confirm_state = req.body.confirm_state;
  const data = req.body.data;
  let query = data.map((v) => {
    return {_id: v}
  });
  const result = await Work.updateMany({$or: query}, {$set: {work_confirm: confirm_state}});
  res.json(result);
});
// 근태관리 엑셀다운로드
router.post('/attendance/excelDownload', middle.isAdmin, async (req, res) => {
  const data = req.body.data;
});
// 근태관리 작업시간 수정
router.post('/attendance/time/:id', middle.isAdmin, async (req, res) => {
  let result = await Work.updateMany({_id: req.params.id}, {
    $set:
      {start_time: req.body.start_time, end_time: req.body.end_time}
  });
  if (result.ok === 1) result.message = '등록 성공';
  else result.message = '수정 실패';
  res.json(result);
});
// 근태관리 작업 읽어오기
router.get('/attendance/work/read/:id', middle.isAdmin, async (req, res) => {
  let work = await Work.findOne({_id: req.params.id}).populate('user_id');
  res.json(work);
});


// 관리자 화면. 작업관리 화면
router.get('/work', middle.isAdmin, async (req, res, next) => {
  const region = await Region.find({});
  const work_title = await WorkTitle.find({});
  const start_time = await StartTime.find({}).sort('start_time');
  const end_time = await EndTime.find({}).sort('end_time');
  const remark = await Remark.find({});
  res.render('admin_work', {
    page_frame: 'login-page',
    title: 'K-TOP 작업관리',
    side_active: 'work',
    region: region,
    work_title: work_title,
    start_time: start_time,
    end_time: end_time,
    remark: remark
  })
});
// 근태관리의 작업내역 삭제
router.delete('/work/:id', middle.isAdmin, async (req, res) => {
  const result = await Work.deleteOne({_id: req.params.id});
  res.json(result);
});
// 작업관리 화면, 부서 신규등록
router.post('/work/region', middle.isAdmin, async (req, res, next) => {
  let data = req.body.region;
  if (typeof req.body.region === 'string') data = [req.body.region];
  let query = data.filter((v) => {
    if (v) return v
  }).map((v) => {
    return {region_name: v}
  });
  const exData = await Region.find({$or: query});
  if (exData.length > 0) { // 이미 동일한 데이터가 있을 경우
    res.sendStatus(301);
  } else {
    const result = await Region.insertMany(query);
    res.json(result);
  }
});
// 작업관리 화면, 부서 수정
router.put('/work/region/:id/:name', middle.isAdmin, async (req, res, next) => {
  const result = await Region.update({_id: req.params.id}, {$set: {region_name: req.params.name}});
  res.json(result);
});
// 작업관리 화면, 부서 삭제
router.delete('/work/region/:id', middle.isAdmin, async (req, res, next) => {
  const result = await Region.deleteOne({_id: req.params.id});
  res.json(result);
});


// 작업관리 작업명 등록
router.post('/work/work_title', middle.isAdmin, async (req, res, next) => {
  let data = req.body.work_title;
  if (typeof req.body.work_title === 'string') data = [req.body.work_title];
  let query = data.filter((v) => {
    if (v) return v
  }).map((v) => {
    return {work_title: v}
  });
  const exData = await WorkTitle.find({$or: query});
  if (exData.length > 0) { // 이미 동일한 데이터가 있을 경우
    res.sendStatus(301);
  } else {
    const result = await WorkTitle.insertMany(query);
    res.json(result);
  }
});
// 작업관리 화면, 작업명 수정
router.put('/work/work_title/:id/:name', middle.isAdmin, async (req, res, next) => {
  const result = await WorkTitle.update({_id: req.params.id}, {$set: {work_title: req.params.name}});
  res.json(result);
});
// 작업관리 화면, 작업명 삭제
router.delete('/work/work_title/:id', middle.isAdmin, async (req, res, next) => {
  const result = await WorkTitle.deleteOne({_id: req.params.id});
  res.json(result);
});


// 작업관리 비고 등록
router.post('/work/remark', middle.isAdmin, async (req, res, next) => {
  let data = req.body.remark;
  if (typeof req.body.remark === 'string') data = [req.body.remark];
  let query = data.filter((v) => {
    if (v) return v
  }).map((v) => {
    return {remark: v}
  });
  const exData = await Remark.find({$or: query});
  if (exData.length > 0) { // 이미 동일한 데이터가 있을 경우
    res.sendStatus(301);
  } else {
    const result = await Remark.insertMany(query);
    res.json(result);
  }
});
// 작업관리 화면, 비고 수정
router.put('/work/remark/:id/:name', middle.isAdmin, async (req, res, next) => {
  const result = await Remark.update({_id: req.params.id}, {$set: {remark: req.params.name}});
  res.json(result);
});
// 작업관리 화면, 비고 삭제
router.delete('/work/remark/:id', middle.isAdmin, async (req, res, next) => {
  const result = await Remark.deleteOne({_id: req.params.id});
  res.json(result);
});


// 작업관리 화면, 출근시간 등록
router.post('/work/start_time', middle.isAdmin, async (req, res, next) => {
  let data = req.body.start_time;
  if (typeof req.body.start_time === 'string') data = [req.body.start_time];
  let query = data.filter((v) => {
    if (v) return v
  }).map((v) => {
    return {start_time: v}
  });
  const exData = await StartTime.find({$or: query});
  if (exData.length > 0) { // 이미 동일한 데이터가 있을 경우
    res.sendStatus(301);
  } else {
    const result = await StartTime.insertMany(query);
    res.json(result);
  }
});
// 작업관리 화면, 출근시간 수정
router.put('/work/start_time/:id/:name', middle.isAdmin, async (req, res, next) => {
  const result = await StartTime.update({_id: req.params.id}, {$set: {start_time: req.params.name}});
  res.json(result);
});
// 작업관리 화면, 출근시간 삭제
router.delete('/work/start_time/:id', middle.isAdmin, async (req, res, next) => {
  const result = await StartTime.deleteOne({_id: req.params.id});
  res.json(result);
});
// 작업관리 화면, 퇴근시간 등록
router.post('/work/end_time', middle.isAdmin, async (req, res, next) => {
  let data = req.body.end_time;
  if (typeof req.body.end_time === 'string') data = [req.body.end_time];
  let query = data.filter((v) => {
    if (v) return v
  }).map((v) => {
    return {end_time: v}
  });
  const exData = await EndTime.find({$or: query});
  if (exData.length > 0) { // 이미 동일한 데이터가 있을 경우
    res.sendStatus(301);
  } else {
    const result = await EndTime.insertMany(query);
    res.json(result);
  }
});
// 작업관리 화면, 퇴근시간  수정
router.put('/work/end_time/:id/:name', middle.isAdmin, async (req, res, next) => {
  const result = await EndTime.update({_id: req.params.id}, {$set: {end_time: req.params.name}});
  res.json(result);
});
// 작업관리 화면, 퇴근시간  삭제
router.delete('/work/end_time/:id', middle.isAdmin, async (req, res, next) => {
  const result = await EndTime.deleteOne({_id: req.params.id});
  res.json(result);
});


//  최고관리자 화면
router.get('/superAdmin', middle.isAdmin, async (req, res, next) => {
  const users = await User.find({lv: {$lt: 9}});
  res.render('admin_super', {
    users: users,
    side_active: 'superAdmin',
    title: 'K-TOP 전체회원관리',
  });
});
// 전체회원관리 레벨 수정
router.put('/superAdmin/:id/:lv', middle.isAdmin, async (req, res, next) => {
  const result = await User.updateOne({_id: req.params.id}, {$set: {lv: req.params.lv}});
  res.json(result);
});
// 회원 영구 삭제
router.delete('/superAdmin/:id', async (req, res) => {
  const result = await User.remove({_id: req.params.id});
  res.json(result);
});

// 공지사항 글 리스트
router.get('/notice/list', middle.isAdmin, async (req, res) => {
  const list = await Notice.find({});
  res.render('admin_notice', {
    list: list,
    side_active:'notice'
  });
});
// 공지사항 글 쓰기 화면
router.get('/notice/create', middle.isAdmin, async (req, res) => {
  res.render('admin_notice_create', {
    title: '공지사항 등록'
  });
});
// 공지사항 글 읽기
router.get('/notice/read/:id', middle.isAdmin, async (req, res) => {
  let data = await Notice.findOne({_id: req.params.id});
  let query = data.read_user.map((v) => {
    return {_id: mongoose.Types.ObjectId(v)};
  });
  let user_list;
  if (query.length > 0) {
    user_list = await User.aggregate([
      {$match: {$or: query}}
    ]);
  } else {
    user_list = null;
  }
  res.render('admin_notice_read', {
    title: '공지사항 수정',
    data: data,
    user_list: user_list
  });
});
// 공지사항 글 등록
router.post('/notice/create', middle.isAdmin, async (req, res) => {
  // 업로드한 파일이 있다면, temp 폴더에서 uploads 폴더로 복사
  if(req.body.path){
    let paths = req.body.path.split(',');
    paths.forEach(function(v){
      fs.createReadStream('./' + v)
        .pipe(fs.createWriteStream('./docs' + v.replace('temps','')));
    });
  }
  let result = await Notice.create(req.body);
  res.json(result);
  // res.redirect('/admin/notice/list');
});
// 공지사항 글 수정
router.post('/notice/update', middle.isAdmin, async (req, res) => {
  let result = await Notice.update(
    {_id: req.body._id},
    {
      $set: {
        title: req.body.title,
        content: req.body.content,
        writer: req.body.writer
      }
    });
  res.json(result);
  // res.redirect('/admin/notice/list');
});
// 공지사항 글 삭제
router.delete('/notice/delete/:id', middle.isAdmin, async (req, res) => {
  let result = await Notice.remove({_id: req.params.id});
  res.json(result);
});
// 공지시항 파일 업로드
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      // console.log('file : ', file);
      cb(null, './temps');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    }
  }),
  limits:{fileSize:2*1024*1024}
});
router.post('/notice/file_upload',middle.isAdmin, upload.array('notice_file[]', 10), async(req, res) => {
  // temp 폴더 내에 모든 파일을 삭제
  let directory = './temps';
  fs.readdir(directory, (err, files) => {
    if(!err){
      let uploaded_files = req.files.map((v) => {return v.filename});
      for(let file of files){
        if(uploaded_files.indexOf(file) === -1)
          fs.unlink(path.join(directory, file), err => {
            if(err) throw err;
          });
      }
    }
  });
  let files = await req.files;
  res.json(files);
});

// 가동보고서 화면
router.get('/operate/report', middle.isAdmin, async (req, res) => {
  let list = await Work.find({});
  res.render('admin_operate_report', {
    side_active: 'operate_report',
  })
});

// 월간업무보고서
router.get('/business/list/:year?/:month?', middle.isAdmin, async (req, res) => {
  let year = req.params.year || moment().format('YYYY');
  let month = req.params.month || moment().format('MM');
  let list = await User.aggregate([
    {
      $match: {$and: [{status: 1}, {lv: 1}]}
    },
    {
      $sort: {user_nick: 1}
    },
    {
      $lookup: {
        from: 'businesses',
        let: {
          ref_id: '$_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {$eq: ['$user_id', '$$ref_id']},
                  {$eq: ['$month', parseInt(month)]},
                  {$eq: ['$year', parseInt(year)]}
                ]
              }
            }
          }
        ],
        as: 'business'
      }
    }
  ]);
  res.render('admin_business_list', {
    list: list,
    side_active: 'business',
    year: year,
    month: month
  });
});
// 월간업무 보고서 읽기
router.get('/business/read/:id', middle.isAdmin, async (req, res) => {
  let doc = await Business.findOne({_id: req.params.id}).populate('user_id');
  res.render('admin_business_read', {
    doc: doc,
    side_active: 'business'
  });
});

// 휴무계 리스트
router.get('/closed/list/:year?/:month?', middle.isAdmin, async(req, res) => {
  let now = new Date();
  let month = req.params.month || now.getMonth() + 1;
  let year = req.params.year || now.getFullYear();
  let list = await Closed.find({closed_month: month, closed_year: year}).populate('user_id');
  res.render('admin_closed_list', {
    side_active:'closed',
    list:list,
    month:month
  });
});
// 휴무계 삭제요청 승인
router.patch('/closed/:id', middle.isAdmin, async(req, res) => {
  let result = await Closed.updateOne(
    {_id: mongoose.Types.ObjectId(req.params.id)},
    {$set: {status: 3}}
  );
  res.json(result);
});
// 휴무계 직원이름 조회
router.get('/closed/searchEmployee/:name', middle.isAdmin, async(req, res) => {
  let name = req.params.name;
  let user_id = await User.findOne({user_nick:name});
  if(user_id){
    let list = await Closed.find({user_id:mongoose.Types.ObjectId(user_id._id)}).sort({reportDate:-1});
    res.json({list:list, name:name, code:1});
  }else{
    res.json({code:-1})
  }
});


module.exports = router;
