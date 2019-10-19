const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/users');
const pbkdf2 = require('pbkdf2-password');
const hasher = pbkdf2();

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField:'user_id',
    passwordField:'user_pw'
  }, async (user_id, password, done) => {
    try{
      const exUser = await User.findOne({user_id:user_id, provider:'local'});
      if(exUser){
        if(exUser.user_pw === password){
          done(null, exUser);
        }else{
          done(null, false, {result:0, message:'비밀번호가 일치하지 않습니다'});
        }
        // hasher({password:password, salt:exUser.salt}, (err, pass, salt, hash)=>{
        //   if(exUser.user_pw === hash){
        //     done(null, exUser);
        //   }else{
        //     done(null, false, {result:0, message:'비밀번호가 일치하지 않습니다'});
        //   }
        // });
      }else{
        done(null, false, {result:2, message:'가입되지 않은 회원입니다'});
      }
    }catch(error){
      console.error(error);
      done(error);
    }
  }));
};