const express = require('express');
const router = express.Router();
const middle = require('../routes/middlewares');
const Notice = require('../model/notice');

// 공지사항 리스트
router.get('/', middle.isLoggedIn, async (req, res) => {
  let list = await Notice.find({}).sort({created:-1});
  res.render('notice', {
    list:list,
    user_id:req.session.passport.user._id
  });
});
// 공지사항 읽기
router.get('/read/:id', middle.isLoggedIn, async (req, res) => {
  let user_id = req.session.passport.user._id;
  // 조회수 카운트 1
  await Notice.update({_id:req.params.id}, {$inc:{read_count:1}});
  // 읽은 글인지 확인
  let already_read = await Notice.findOne({_id:req.params.id, read_user:user_id});
  if(!already_read){
    await Notice.update({_id:req.params.id}, {$push:{read_user:user_id}});
  }
  let article = await Notice.findOne({_id:req.params.id});

  res.render('notice_article', {
    article:article.toObject()
  });
});
module.exports = router;