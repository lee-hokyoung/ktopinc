const path = require('path');
const fs = require('fs');
const filePath = path.join(__dirname, '../uploads/member.csv');
const User_test = require('../model/users_test');
const User = require('../model/users');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true}, (error)=>{
  if(error) console.log('몽고디비 연결 에러', error);
  else console.log('몽고디비 연결 성공');
});

(async function main(){
  let data = fs.readFileSync(filePath, {encoding:'utf8'});
  let rows = data.split('\n');
  for(let i = 0; i < rows.length; i++){
    let info = rows[i].split(',')[2];
    console.log('info : ' , info);
    if(info !== undefined){
      let query = {user_nick:rows[i].split(',')[0]};
      let result = await User.updateMany(query, {$set:{han_id:info.replace('\r', '')}});
      console.log('update result : ', result);
    }
  }
})();



