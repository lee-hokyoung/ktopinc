
document.getElementById('notice_file').addEventListener('change', function(e){
  let formData = new FormData();
  console.log(this, this.files);
  formData.append('notice_file', this.files[0]);
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/admin/notice/file_upload');
  xhr.onreadystatechange = function(){
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
      let res = JSON.parse(this.response);
      document.querySelector('input[name="path"]').value = res.path;
      document.querySelector('input[name="originalname"]').value = res.originalname;
      console.log('res : ', res);
    }
  };
  xhr.send(formData);
});
// tinymce.init({
//   selector:'#notice_textarea',
//   height:500,
//   resize:false,
//   branding:false
// });
function fnDeleteNotice(id){
  if(confirm('삭제하시면 복구가 불가능 합니다. 계속 진행하시겠습니까?')){
    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/admin/notice/delete/' + id, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        let res = JSON.parse(this.response);
        if (res.ok === 1) {
          alert('정상적으로 삭제되었습니다.');
          location.href = '/admin/notice/list';
        }
      }
    };
    xhr.send();
  }
}
// 공지사항 등록
function fnCreate(){
  let title = document.querySelector('input[name="title"]');
  let writer = document.querySelector('input[name="writer"]');
  let content = $('#notice_textarea').summernote('code');
  if(!title.value){
    alert('제목을 입력해주세요.');
    title.focus();
    return false;
  }
  if(!writer.value){
    alert('작성자를 입력해주세요.');
    writer.focus();
    return false;
  }
  if(!$(content).text()){
    alert('내용을 입력해주세요');
    return false;
  }

  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/admin/notice/create', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function(){
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
      alert('정상적으로 등록되었습니다.');
      location.href = '/admin/notice/list';
    }
  };
  xhr.send(JSON.stringify({
    title:title.value, writer:writer.value, content:content
  }));
}
// 공지사항 수정
function fnUpdate(){
  let title = document.querySelector('input[name="title"]');
  let writer = document.querySelector('input[name="writer"]');
  let content = $('#notice_content').summernote('code');
  if(!title.value){
    alert('제목을 입력해주세요.');
    title.focus();
    return false;
  }
  if(!writer.value){
    alert('작성자를 입력해주세요.');
    writer.focus();
    return false;
  }
  if(!$(content).text()){
    alert('내용을 입력해주세요');
    return false;
  }

  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/admin/notice/update', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function(){
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
      alert('수정했습니다.');
      location.href = '/admin/notice/list';
    }
  };
  xhr.send(JSON.stringify({
    _id:document.querySelector('input[name="_id"]').value,
    title:title.value, writer:writer.value, content:content
  }));
}