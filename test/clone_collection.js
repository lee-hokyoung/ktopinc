const User = require('../model/users');
const User_test = require('../model/users_test');
let func = require('../controller/functions');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true}, (error)=>{
  if(error) console.log('몽고디비 연결 에러', error);
  else console.log('몽고디비 연결 성공');
});

(async function main(){
  let users= await User.find({});
  let result = await User_test.insertMany(users);
  console.log(users);
  console.log('result : ', result);
})();