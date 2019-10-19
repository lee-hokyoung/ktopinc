const bkdf2Password = require('pbkdf2-password');
const hasher = bkdf2Password();
const user = {
  "status" : true,
  "user_id" : "supereggsong",
  "user_nick" : "이호경",
  "user_email" : "supereggsong@gmail.com",
  "user_pw" : "nMbLVjHFyE2wWk80JKsXlMFTIAkQFTUEyk5BU8GCmd5yPGOiHfRluNKhELhJ1HC3oQSVfvytGnmSPIVf0VV4G3FIMh4pxmTIsgS30Lw6qn/ZTlFnsRscO+qhdhnIhWwa1dmUMYHZYyLrJJgLFrvokp5WPDpfiBNDlllMuRbnUok=",
  "salt" : "+7b9o0IU/DVvqnQOgzvVV8pjYQOsO2Jpd3OcDiOqqh/wZ8o9/25gr5J1dDKPQQow7TflmPNltwH7c1AdJ2BTzw==",
  "provider" : "local",
  "__v" : 0
};

const test = async () => {
  // const result = await hasher({password:'1234'}, (err, pass, salt, hash)=>{
  //   console.log('pass : ', pass);
  //   console.log('salt : ', salt);
  //   console.log('hash : ', hash);
  // });
  hasher({password:'12341212', salt:user.salt}, (err, pass, salt, hash)=>{
      console.log('pass : ', pass);
      console.log('salt : ', salt);
      console.log('hash : ', hash);
      if(user.user_pw === hash){
        console.log('비밀번호 맞음');
      }else{
        console.log('비밀번호 틀림');
      }
  });
};
test();