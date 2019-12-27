function fnSaveReportConfig(){
  let start = document.querySelector('input[name="start_date"]');
  let end = document.querySelector('input[name="end_date"]');
  if(start.value === ''){
    alert('시작일을 입력해주세요.');
    start.focus();
    return false;
  }
  if(end.value === ''){
    alert('종료일을 입력해주세요');
    start.focus();
    return false;
  }
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/admin/operate')
}