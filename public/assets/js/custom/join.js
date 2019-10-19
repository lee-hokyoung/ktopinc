// 회원가입 유효성 검사
fnCheckSubmit = function(){
    let getMail = RegExp(/^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/);
    let getCheck= RegExp(/^[a-zA-Z0-9]{4,12}$/);
    let getName= RegExp(/^[가-힣]+$/);

    let user_id = document.querySelector('#user_id');
    let user_name = document.querySelector('#user_name');
    let user_email = document.querySelector('#user_email');
    let user_pw = document.querySelector('#user_pw');
    let pw_chk = document.querySelector('#pw_chk');
    
    //아이디 공백 확인
    if(user_id.value === ""){
        alert("아이디를 입력해주세요");
        user_id.focus();
        return false;
    }
    //아이디의 유효성 검사
    if(!getCheck.test(user_id.value)){
        alert("아이디는 영문, 숫자만 입력가능합니다.");
        user_id.value = '';
        user_id.focus();
        return false;
    }
    //비밀번호
    if(!getCheck.test(user_pw.value)) {
        alert("비밀번호는 4-12 자리의 영문, 숫자로 입력해주세요.");
        user_pw.value = '';
        user_pw.focus();
        return false;
    }
    //아이디랑 비밀번호랑 같은지
    if (user_id.value === user_pw.value) {
        alert("비밀번호와 아이디가 같을 수 없습니다.");
        user_pw.value = '';
        user_pw.focus();
    }
    //비밀번호 똑같은지
    if(user_pw.value !== pw_chk.value){
        alert("비밀번호를 다르게 입력하셨습니다.");
        user_pw.value = '';
        pw_chk.value = '';
        user_pw.focus();
        return false;
    }
    //이메일 공백 확인
    if(user_email.value === ""){
        alert("이메일을 입력해주세요");
        user_email.focus();
        return false;
    }
    //이메일 유효성 검사
    if(!getMail.test(user_email.value)){
        alert("정확한 이메일 주소를 입력해 주세요.");
        user_email.value = '';
        user_email.focus();
        return false;
    }
    //이름 유효성
    if (!getName.test(user_name.value)) {
        alert("이름은 한글로 입력해주세요.");
        user_name.value = '';
        user_name.focus();
        return false;
    }
    // 회원가입
    let formData = $('#joinForm').serialize();
    let xhr = new XMLHttpRequest();
    xhr.open("POST", '/users/join', true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    console.log(formData);
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            let res = JSON.parse(this.response);
            if(res.result === 1){
                alert(res.message);
                location.href = '/work/list';
            }else{
                alert(res.message);
            }
        }
    };
    xhr.send(formData);
};