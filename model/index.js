// 몽고디비 연결
require('dotenv').config();
const mongoose = require('mongoose');
console.log('env : ', process.env.MONGO_URI);
module.exports = () => {
  const connect = () => {
    mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true}, (error)=>{
      if(error) console.log('몽고디비 연결 에러', error);
      else console.log('몽고디비 연결 성공');
    })
  };
  connect();
  mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결에러', error);
  });
  mongoose.connection.on('disconnected', ()=>{
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도 합니다.');
    // connect();
  });
  require('./users');
};