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
      if(res.path) fnGenerateClosedAttach(res);
      else document.querySelector('#closedAttachedFile').innerHTML = '';
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
// 휴무계 창 띄울 때 내용 초기화
$('#closedWriteModal').on('show.bs.modal', function(){
  document.querySelectorAll('#closedWriteModal input[type="checkbox"]').forEach(function(inp){
    inp.checked = false;
  });
  document.querySelectorAll('#closedWriteModal input[type="text"]').forEach(function(inp){
    if(inp.name !== 'department' && inp.name !== 'user_nick' &&
      inp.name !== 'closed_year' && inp.name !== 'closed_month' && inp.name !== 'closed_day') inp.value = '';
  });
});

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
// 휴무계 첨부파일 생성 HTML
function fnGenerateClosedAttach(res){
  let html = '<div><strong class="">첨부파일</strong>';
  res.path.split(',').forEach(function(v, idx){
    html += `<div><a href="${v.replace('temp_closed_attach', '/docs_closed')}" target="_blank">${res.original ? res.original.split(',')[idx]:''}</a></div>`;
  });
  html += '</div>';
  document.querySelector('#closedAttachedFile').innerHTML = html;
}


/*  휴무계 체크박스 선택 이벤트 */
function fnSelectType(btn) {
  const checkBox = document.querySelectorAll('input[type="checkbox"]');
  checkBox.forEach(function (v) {
    v.checked = false;
  });
  btn.checked = true;
}

/*  휴무계 작성 완료 */
function fnCompleteWrite() {
  let formData = {};
  let closed_type = document.querySelector('input[name="closed_type"]:checked');
  if (!closed_type) {
    alert('신청구분을 선택해주세요.');
    return false;
  }
  formData['closed_type'] = closed_type.value;
  let department = document.querySelector('input[name="department"]');
  if (!department.value) {
    alert('부서를 입력해주세요.');
    department.focus();
    return false;
  }
  formData['department'] = department.value;
  let rank = document.querySelector('input[name="rank"]');
  if (!rank.value) {
    alert('직급을 입력해주세요.');
    rank.focus();
    return false;
  }
  formData['rank'] = rank.value;
  let application_period = document.querySelector('input[name="application_period"]');
  if (!application_period.value) {
    alert('신청 기간을 입력해주세요.');
    application_period.focus();
    return false;
  }
  formData['application_period'] = application_period.value;
  let days = document.querySelector('input[name="days"]');
  if (!days.value) {
    alert('신청 일수를 입력해주세요.');
    days.focus();
    return false;
  }
  formData['days'] = days.value;
  let reason = document.querySelector('input[name="reason"]');
  if (!reason.value) {
    alert('사유를 입력해주세요.');
    reason.focus();
    return false;
  }
  formData['reason'] = reason.value;
  let licenserName = document.querySelector('input[name="licenserName"]');
  if (!licenserName.value) {
    alert('허가자 성명을 입력해주세요.');
    licenserName.focus();
    return false;
  }
  formData['licenserName'] = licenserName.value;
  let reportDate = document.querySelector('input[name="reportDate"]');
  if (!reportDate.value) {
    alert('보고일시를 입력해주세요.');
    reportDate.focus();
    return false;
  }
  formData['reportDate'] = reportDate.value;
  let licenserTel = document.querySelector('input[name="licenserTel"]');
  if (!licenserTel.value) {
    alert('허가자 연락처를 입력해주세요');
    licenserTel.focus();
    return false;
  }
  formData['licenserTel'] = licenserTel.value;
  let closed_year = document.querySelector('input[name="closed_year"]');
  if (!closed_year.value) {
    alert('작성일시를 입력해주세요');
    closed_year.focus();
    return false;
  }
  formData['closed_year'] = closed_year.value;
  let closed_month = document.querySelector('input[name="closed_month"]');
  if (!closed_month.value) {
    alert('작성일시를 입력해주세요');
    closed_month.focus();
    return false;
  }
  formData['closed_month'] = closed_month.value;
  let closed_day = document.querySelector('input[name="closed_day"]');
  if (!closed_day.value) {
    alert('작성일시를 입력해주세요');
    closed_day.focus();
    return false;
  }
  formData['closed_day'] = closed_day.value;
  // file upload
  let original = document.querySelector('input[name="closedAttachOriginalFileName"]');
  let path = document.querySelector('input[name="closedAttachPath"]');
  formData['original'] = original.value;
  formData['path'] = path.value;
  // ajax post 전송
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/work/closed/write', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      alert('작성완료');
      document.querySelector('#closedCheck').checked = true;
      $('#closedModal').modal('hide');
    }
  };
  // console.log(formData);
  xhr.send(JSON.stringify(formData));
}

/*  휴무계 첨부 파일 업로드 */
let closedAttachInput = document.querySelector('#closedAttach');
if(closedAttachInput){
  closedAttachInput.addEventListener('change', function(e){
    const formData = new FormData();
    Object.keys(e.target.files).forEach(function(key){
      formData.append('closedAttach[]', e.target.files[key], e.target.files[key].name);
    });

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/work/closed/upload');
    xhr.onreadystatechange = function(){
      if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
        let res = JSON.parse(this.response);
        let original = res.map(function(v){return v.originalname});
        let path = res.map(function(v){return v.path});
        document.querySelector('input[name="closedAttachOriginalFileName"]').value = original;
        document.querySelector('input[name="closedAttachPath"]').value = path;
      }
    };
    xhr.send(formData);
  });
}
