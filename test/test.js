const Work = require('../model/works');
const User = require('../model/users');
const TempWork = require('../model/tempWork');
let func = require('../controller/functions');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true}, (error)=>{
  if(error) console.log('몽고디비 연결 에러', error);
  else console.log('몽고디비 연결 성공');
});

let lastMonth = func.getLastMonth();
let today = func.getToday();
(async function main(){
    const page = 1;
    const size = 30;
    const limit = size;
    const skip = size * (page -1);
    let member_work = [];
    let start_period, end_period;
    start_period = func.getLastMonth();
    end_period = func.getToday();
    /*  기간을 만드는 Schema  */
    let allUser = await User.find({lv:1, status:1}, {_id:1});
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
    let match_users = {$match:{$and:[{}]}};
    let match_works = {$match:{$and:[{}]}};
    // if(req.body.user_nick) match_users.$match.$and.push({'users.user_nick':req.body.user_nick});
    // if(req.body.region) match_works.$match.$and.push({'works.region':req.body.region});
    // if(req.body.isDataOnly === '1') match_works.$match.$and.push({'works.region':{$exists:true}});
    let work_list = await TempWork.aggregate([
        {$project:{_id:0,user_id:1, work_date:'$work_date'}},
        {$unwind:{
                path:'$user_id'
            }},
        {$lookup:{
                from:'works',
                let:{
                    ref_date:'$work_date',
                    ref_id:'$user_id'
                },
                pipeline:[
                    {$match:{$expr:{
                                $and:[
                                    {$eq:[{$substr:['$work_date',0,10]}, {$substr:['$$ref_date',0,10]}]},
                                    {$eq:['$user_id', '$$ref_id']}
                                ]
                            }}}
                ],
                as:'works'
            }},
        {$unwind: {
                path:'$works',
                preserveNullAndEmptyArrays:true
            }},
        match_works,
        {$lookup:{
                from:'users',
                let:{ref_id:'$user_id'},
                pipeline: [
                    {$match:{$expr:{$eq:['$_id', '$$ref_id']}}},
                    {$project:{_id:0, user_nick:'$user_nick', han_id:'$han_id'}}
                ],
                as:'users'
            }},
        {$unwind:{
                path:'$users',
                preserveNullAndEmptyArrays:true
            }},
        match_users,
        {$sort:{'work_date':-1}},
        {$facet:{
                'metadata':[
                    {$count:'total'},
                    {$addFields:{page:page, limit:limit}}
                ],
                'data':[
                    {$skip:skip}, {$limit:limit}
                ]
            }}
    ]);
    let list = work_list[0].data;
    let header = [{text:'번호'}, {text:''}];
    let excel_data = [];
    list.forEach((v)=>{
        console.log('v : ', v);
    });
})();