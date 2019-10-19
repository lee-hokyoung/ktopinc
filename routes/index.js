const express = require('express');
const router = express.Router();
const passport = require('passport');
const middle = require('./middlewares');

/* GET home page. */
router.get('/', function(req, res, next) {
  let user_lv = 0;
  if(req.session.passport) user_lv = req.session.passport.user.lv;
  res.render('index', {
    page_frame:'landing-page',
    title: '케이탑아이앤씨 출결시스템',
    user_lv:user_lv
  });
});
router.get('/login', function(req, res, next) {
  res.render('login', {
    page_frame:'login-page',
    title: '케이탑아이앤씨 출결시스템'
  });
});
router.post('/login', middle.isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info)=>{
    if(info){
      return res.send('<script>alert("' + info.message + '"); location.href = "/login";</script>');
    }
    if(authError){
      console.error(authError);
      return next(authError);
    }
    if(!user){
      return res.redirect('/login');
    }
    return req.login(user, (loginError) => {
      if(loginError){
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/work');
    });
  })(req, res, next);
});
router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.render('index', {
    page_frame:'login-page',
    title: '케이탑아이앤씨 출결시스템'
  });
});

module.exports = router;
