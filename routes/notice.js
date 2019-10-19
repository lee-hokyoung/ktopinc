const express = require('express');
const router = express.Router();
const middle = require('../routes/middlewares');
const Notice = require('../model/notice');

// 공지사항 리스트
router.get('/', (req, res) => {
  let list = Notice.find({});
  res.render('notice', {
    list:list
  });
});
module.exports = router;