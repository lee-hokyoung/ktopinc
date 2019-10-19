const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// 회원 스키마
const userSchema = new Schema({
    id:mongoose.Schema.Types.ObjectId,
    user_id:{type:String, required:true, unique:true},
    user_nick:{type:String, required:true},
    user_email:{type:String, unique:true},
    profile_image:String,
    user_team:{type:String, default:'사업팀'},
    user_region:String,
    work_place:String,
    gender:String,
    age:Number,
    birthday:String,
    provider:String,
    user_pw:String,
    salt:String,
    lv:{type:Number, default:1},        // 1: 일반회원, 2:관리자, 3:최고관리자, 9:개발자
    status:{type:Number, default:1},    // 1: 정상, 2:휴직, 3:퇴사, 9:삭제처리
    date:{type: Date,default: Date.now },
    han_id:String   // 한비자 연동 아이디
});
// 인덱싱
userSchema.index({user_id:1, user_email:1});
// // 아이디 찾기
userSchema.methods.findUserId = (cb)=>{
    return this.model('Users').find({ user_email: this.user_email }, cb);
};
module.exports = mongoose.model('User', userSchema);