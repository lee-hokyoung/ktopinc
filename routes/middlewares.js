exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    res.locals.user_lv = req.session.passport.user.lv;
    next();
  }else{
    res.redirect('/login');
  }
};
exports.isNotLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()){
    next();
  }else{
    req.redirect('/login');
  }
};
exports.isAdmin = (req, res, next) => {
  if(req.isAuthenticated()){
    if(req.session.passport.user.lv > 1){
      res.locals.user_lv = req.session.passport.user.lv;
      next();
    }else{
      let msg = '<script>alert("접근권한이 없습니다.");history.back();</script>'
      res.send(msg);
    }
  }else{
    res.redirect('/login');
  }
};