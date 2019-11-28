// 휴무계 읽기
function fnReadDoc(id) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', '/work/closed/' + id);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      console.log('res : ', res);
      document.querySelector('input[value="' + res.closed_type + '"]').checked = true;
      document.querySelectorAll('input[type="text"]').forEach(function (v) {
        if(v.name === 'user_nick') v.value = res.user_id.user_nick;
        else v.value = res[v.name];
      });
      document.querySelector('input[name="doc_id"]').value = res._id;
      let btnDelete = document.querySelector('button[name="btnDelete"]');
      if(res.status === 1){
        btnDelete.disabled = false;
      }else{
        btnDelete.disabled = true;
      }
      $('#closedModal').modal('show');
    }
  };
  xhr.send();
}
// 휴무계 삭제요청
function fnDeleteDoc(){
  if(!confirm('삭제요청 하시겠습니까?')) return false;
  let doc_id = document.querySelector('input[name="doc_id"]').value;
  let xhr = new XMLHttpRequest();
  xhr.open('PATCH', '/work/closed/' + doc_id);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function(){
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
      let res = JSON.parse(this.response);
      console.log('res : ', res);
      if(res.ok === 1){
        alert('삭제요청 했습니다.');
        location.reload();
      }
    }
  };
  xhr.send();
}