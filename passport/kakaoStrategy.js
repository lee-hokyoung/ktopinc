const kakao = require('passport-kakao').Strategy;
const User = require('../model/users');

module.exports = (passport) => {
  passport.use(new kakao({
    clientID:process.env.KAKAO_ID,
    callbackURL:'/auth/kakao/oauth'
  }, async (accessToken, refreshToken, profile, done) => {
    try{
      // 기존에 등록된 회원인지 확인
      const exUser = await User.findOne({user_id:profile.id, provider:'kakao'});
      if(exUser){
        done(null, exUser);
      }else{
        // 신규 등록
        const newUser = await User.create({
          user_id: profile.id,
          user_nick:profile.username,
          user_email:profile._json.kaccount_email,
          profile_image:profile._json.properties.profile_image,
          provider:profile.provider
        });
        done(null, newUser);
      }
    }catch(error){
      console.error(error);
      done(error);
    }
  }));
};