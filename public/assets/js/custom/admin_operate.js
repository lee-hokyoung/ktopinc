function fnSaveReportConfig() {
  let start = document.querySelector('input[name="start_date"]');
  let end = document.querySelector('input[name="end_date"]');
  if (start.value === '') {
    alert('시작일을 입력해주세요.');
    start.focus();
    return false;
  }
  if (end.value === '') {
    alert('종료일을 입력해주세요');
    start.focus();
    return false;
  }
  let formData = {};
  formData['report_start'] = start.value;
  formData['report_end'] = end.value;

  let xhr = new XMLHttpRequest();
  xhr.open('PUT', '/admin/operate');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      $.notify({
        message: res.message
      },{
        type:res.result === 1 ? 'success':'danger',
        placement:{from:'top', align:'right'},
        template:now_ui_template,
        delay:2000
      });
    }
  };
  xhr.send(JSON.stringify(formData));
}