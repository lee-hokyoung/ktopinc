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
tinymce.init({
  selector:'#notice_textarea',
  height:500,
  resize:false,
  branding:false
});
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