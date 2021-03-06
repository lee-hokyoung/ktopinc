const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../model/users');
module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
    // User.findOne({user_id:user_id})
    //   .then((user)=>{done(null, user)})
    //   .catch((err)=>{done(err)});
  });
  local(passport);
  kakao(passport);
};