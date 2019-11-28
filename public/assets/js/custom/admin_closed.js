function fnSearchClosed(){
  let year = document.querySelector('select[name="year"]');
  let month = document.querySelector('select[name="month"]');
  location.href = '/admin/closed/list/' + year.value + '/' + month.value;
}
// 휴무계 읽기
function fnShowClosedModal(id) {
  let doc = list.filter(function(v){if(v._id === id) return v;})[0];
  console.log(doc);
  document.querySelectorAll('input[name="closed_type"]').forEach(function(v){
    v.checked = false;
  });
  document.querySelector('input[value="' + doc.closed_type + '"]').checked = true;
  document.querySelectorAll('input[type="text"]').forEach(function (v) {
    if (v.name === 'user_nick') v.value = doc.user_id.user_nick;
    else v.value = doc[v.name];
  });
  document.querySelector('input[name="doc_id"]').value = doc._id;
  if(doc.status === 2){
    document.querySelector('button[name="btnDelete"]').classList.remove('d-none');
  }
  $('#closedModal').modal('show');
}
// 휴무계 삭제 승인
function fnDeleteDoc(){
  if(!confirm('삭제승인 하시겠습니까?')) return false;
  let doc_id = document.querySelector('input[name="doc_id"]').value;
  let xhr = new XMLHttpRequest();
  xhr.open('PATCH', '/admin/closed/' + doc_id);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function(){
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
      let res = JSON.parse(this.response);
      console.log('res : ', res);
      if(res.ok === 1){
        alert('삭제 처리 되었습니다.');
        location.reload();
      }
    }
  };
  xhr.send();
}
// 휴무계 직원 조회
function fnSearchClosedEmployee(){
  let name = document.querySelector('input[name="searchEmployee"]');
  if(!name.value){
    alert('이름을 입력해주세요.');
    name.focus();
    return false;
  }
  let xhr = new XMLHttpRequest();
  xhr.open('GET', '/admin/closed/searchEmployee/' + name.value, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function(){
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
      let res = JSON.parse(this.response);
      fnGenerateEmployeeList(res);
    }
  };
  xhr.send();
}
// 휴무계 직원 리스트 생성 함수
function fnGenerateEmployeeList(res){
  let html = '<ul class="list-group list-group-flush">';
  html += '<li class="list-group-item list-group-item-primary">' +
    '<div class="row">' +
    '<div class="col-md-1">#</div>' +
    '<div class="col-md-3">신청일</div>' +
    '<div class="col-md-2">부서</div>' +
    '<div class="col-md-4">사유</div>' +
    '<div class="col-md-2">상태</div>' +
    '</div>' +
    '</li>';
  res.forEach(function(row, idx){
    let status = row.status === 1 ? '정상':row.status === 2?'삭제요청':'삭제';
    html += `<li class="list-group-item ${idx%2===1?'list-group-item-secondary':''}">`;
    html += '<div class="row">' +
      `<div class="col-md-1">${idx + 1}</div>` +
      `<div class="col-md-3">${row.reportDate}</div>` +
      `<div class="col-md-2">${row.department}</div>` +
      `<div class="col-md-4">${row.reason}</div>` +
      `<div class="col-md-2">${status}</div>` +
      '</div>' +
      '</li>';
    html += `</li>`;
  });
  html += '</ul>';
  document.querySelector('#closedList').innerHTML = html;
  $('#closedEmployeeList').modal('show');
}