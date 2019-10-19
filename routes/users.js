const express = require('express');
const router = express.Router();
const User = require('../model/users');
const Region = require('../model/regions');
const pbkdf2 = require('pbkdf2-password');
const hasher = pbkdf2();
const passport = require('passport');
const middle = require('../routes/middlewares');

/* GET users listing. */
router.get('/join', function(req, res, next) {
  res.render('join', {
    page_frame:'login-page',
    title: '케이탑아이앤씨 출결시스템'
  });
});
router.post('/join', middle.isNotLoggedIn, async (req, res, next) => {
  try{
    const exUser = await User.findOne({user_id:req.body.user_id});
    const exEmail = await User.findOne({user_email:req.body.user_email});
    if(exUser){
      res.json({result:2,message:'중복된 아이디 입니다.'});
    }else if(exEmail){
      res.json({result:3,message:'중복된 이메일 입니다.'});
    }else{
      await User.create({
        user_id:req.body.user_id,
        user_nick:req.body.user_name,
        user_email:req.body.user_email,
        user_pw:req.body.user_pw,
        provider:'local'
      });
      // await hasher({password:req.body.user_pw}, (err, pass, salt, hash)=>{
      //   User.create({
      //     user_id:req.body.user_id,
      //     user_nick:req.body.user_name,
      //     user_email:req.body.user_email,
      //     user_pw:hash,
      //     salt:salt,
      //     provider:'local'
      //   })
      // });
      res.json({result:1,message:'가입 성공'});
    }
  }catch(error){
    console.error(error);
    return next(error);
  }
});
router.get('/profile', middle.isLoggedIn, async(req, res, next) => {
  const user = await User.findOne({_id:req.session.passport.user._id});
  const region = await Region.find({});
  res.render('profile', {
    page_frame:'login-page',
    title: 'K-TOP Inc. 내 정보 관리',
    user:user,
    region:region
  });
});
router.put('/profile/:id', middle.isLoggedIn, async(req, res, next) => {
  const result = await User.update({_id:req.params.id}, {$set:req.body});
  res.json(result);
});
module.exports = router;
