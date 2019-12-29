function fnSearchClosed(){
  let year = document.querySelector('select[name="year"]');
  let month = document.querySelector('select[name="month"]');
  location.href = '/admin/closed/list/' + year.value + '/' + month.value;
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
      if(res.code === 1) fnGenerateEmployeeList(res);
      else alert('검색된 내용이 업습니다.');
    }
  };
  xhr.send();
}
// 휴무계 직원 리스트 생성 함수
function fnGenerateEmployeeList(res){
  let html = '<ul class="list-group list-group-flush">';
  html += '<li class="list-group-item list-group-item-primary py-2">' +
    '<div class="row">' +
    '<div class="col-md-1">#</div>' +
    '<div class="col-md-3">신청일</div>' +
    '<div class="col-md-2">부서</div>' +
    '<div class="col-md-4">사유</div>' +
    '<div class="col-md-2">상태</div>' +
    '</div>' +
    '</li>';
  res.list.forEach(function(row, idx){
    let status = row.status === 1 ? '정상':row.status === 2?'삭제요청':'삭제';
    html += `<li class="list-group-item py-2 ${idx%2===1?'list-group-item-secondary':''}">`;
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
  document.querySelector('#employeeName').innerText = res.name;
  document.querySelector('#closed_count').innerText = res.list.length;
  $('#closedEmployeeList').modal('show');
}
// 휴무계 전체 체크/해제
function fnCheckAll(chk){
  let toggle = chk.dataset.toggle;
  document.querySelectorAll('input[data-check]').forEach(function(chk){
    chk.checked = toggle === 'false';
  });
  if(chk.dataset.toggle === 'false') chk.dataset.toggle = 'true';
  else chk.dataset.toggle = 'false';
}
// 휴무계 체크 항목 삭제
function fnDeleteChecked(){
  let checkedItems = document.querySelectorAll('input[data-check]:checked');
  if(checkedItems.length > 0){
    if(confirm('삭제하시면 복구할 수 없습니다. 삭제하시겠습니까?')){
      let ids = [];
      checkedItems.forEach(function(chk){
        ids.push(chk.value);
      });
      let xhr = new XMLHttpRequest();
      xhr.open('DELETE', '/admin/closed');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function(){
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
          let res = JSON.parse(this.response);
          if(res.result === 1){
            alert(res.message);
            location.reload();
          }else{
            alert(res.message);
          }
        }
      };
      xhr.send(JSON.stringify({delete_ids:ids}));
    }
  }else{
    alert('체크된 항목이 없습니다.');
  }
}