let isClosed = false;
let inpStart = document.querySelector('input[name="start_time"]');
let inpEnd = document.querySelector('input[name="end_time"]');
/*  select box <-> input switch 부분  */
['work_title', 'remarks'].forEach(function (o) {
  $('#' + o).on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (o === 'remarks') {
      if (e.target.value === '휴무') {
        isClosed = true;
        inpStart.value = "";
        inpStart.disabled = true;
        inpEnd.value = "";
        inpEnd.disabled = true;
        $('#closedHiddenWrap').removeClass('d-none');
      } else {
        if (isClosed) {
          inpStart.value = document.querySelector('input[name="temp_start_time"]').value;
          inpStart.disabled = false;
          inpEnd.value = document.querySelector('input[name="temp_end_time"]').value;
          inpEnd.disabled = false;
        }
        $('#closedHiddenWrap').addClass('d-none');

      }
    }
    if (e.target.value === '직접입력') {
      e.target.parentNode.classList.add('d-none');
      document.querySelector('div[title="' + o + '"]').classList.remove('d-none');
      document.querySelector('div[title="' + o + '"]').classList.add('d-inline-block');
    }
  });
});

// 비고에서 휴무 선택시
function fnChangeSelect(obj) {
  let div = document.querySelector('div[title="' + obj + '"]');
  let select = document.querySelector('#' + obj);
  div.classList.remove('d-inline-block');
  div.classList.add('d-none');
  select.parentNode.classList.remove('d-none');
  $('#' + obj).selectpicker('val', $('#' + obj)[0][0].innerText);
}

/*  date time picker 부분 */
$('.datetimepicker').datetimepicker({
  icons: {
    time: "fa fa-clock-o",
    date: "fa fa-calendar",
    up: "fa fa-chevron-up",
    down: "fa fa-chevron-down",
    previous: 'fa fa-chevron-left',
    next: 'fa fa-chevron-right',
    today: 'fa fa-screenshot',
    clear: 'fa fa-trash',
    close: 'fa fa-remove'
  },
  locale: 'ko',
  format: 'L',
  // debug:true
});
$('#timepicker_start').datetimepicker({
  format: 'HH:mm',
  stepping: 15,
  icons: {
    up: 'fa fa-chevron-up',
    down: 'fa fa-chevron-down'
  }
});
$('#timepicker_end').datetimepicker({
  format: 'HH:mm',
  stepping: 15,
  icons: {
    up: 'fa fa-chevron-up',
    down: 'fa fa-chevron-down'
  }
});
// 보고일시 선택
$('#reportDate').on('click', function () {
  $('#selectCalendarModal').modal('show');
});
$('#selectCalendarModal').on('shown.bs.modal', function(){
  let current_date = document.querySelector('#reportDate');
  console.log('current date : ', current_date);
  if(current_date.value === ''){
    current_date.value = document.querySelector('#selectCalendarModal .table-condensed td.today').dataset.day;
  }
});
$('#datepicker-inline').datetimepicker({
  inline: true,
  format: 'YYYY-MM-DD',
  locale: 'ko'
}).on('dp.change', function (e) {
  let selected = document.querySelector('#selectCalendarModal .table-condensed td.active');
  document.querySelector('#reportDate').value = selected.dataset.day;
});
// 신청기간 선택
$('#application_period').on('click', function () {
  $('#selectedRangeModal').modal('show');
});
$('#datepickerStart').datetimepicker({
  inline:true,
  format: 'YYYY-MM-DD',
  locale:'ko',
  useCurrent:false
}).on('dp.change', function(){
  let start_date = document.querySelector('#datepickerStart td.day.active').dataset.day;
  $('#datepickerEnd').data('DateTimePicker').minDate(start_date);
  document.querySelector('input[name="selectedRange"]').value = '';
  document.querySelector('input[name="period"]').value = '';
});
$('#datepickerEnd').datetimepicker({
  inline:true,
  format: 'YYYY-MM-DD',
  locale:'ko',
  useCurrent: false
}).on('dp.change', function(){
  let end_date = document.querySelector('#datepickerEnd td.day.active').dataset.day;
  console.log('end : ', end_date);
  let p_start = document.querySelector('#datepickerStart td.day.active').dataset.day;
  let p_end = document.querySelector('#datepickerEnd td.day.active').dataset.day;
  let d_start = new Date(p_start.slice(0, p_start.length - 1).replace(/\./g, '-'));
  let d_end = new Date(p_end.slice(0, p_end.length - 1).replace(/\./g, '-'));
  console.log('start : ', d_start, ', end : ', d_end);
  let period = Math.abs(d_start - d_end) + 1;
  document.querySelector('input[name="selectedRange"]').value = p_start + '~' + p_end;
  document.querySelector('input[name="period"]').value =  Math.ceil(period / (1000 * 60 * 60 * 24));
});
function fnSelectedPeriod(){
  document.querySelector('#application_period').value = document.querySelector('input[name="selectedRange"]').value;
  document.querySelector('input[name="days"]').value = document.querySelector('input[name="period"]').value;
  $('#selectedRangeModal').modal('hide');
}

/*  form 전송하는 부분  */
function fnCheckSubmit(id) {
  // 근무일 입력 여부 확인
  let work_date = document.querySelector('#work_date');
  if (work_date.value === "") {
    alert('근무일을 입력해주세요.');
    work_date.focus();
    return false;
  }
  // 유효성 검증 및 작업, 비고 항목에 직접 입력시 처리
  let isDirectWork = document.querySelector('div[title="work_title"]').className.indexOf('d-none') > -1;
  let work_field = document.querySelector('input[name="work_title_etc"]');
  if (!isDirectWork) {
    if (work_field.value === "") {
      alert('작업내역을 입력해주세요.');
      work_field.focus();
      return false;
    }
  }

  let isDirectRemark = document.querySelector('div[title="remarks"]').className.indexOf('d-none') > -1;
  let remark_field = document.querySelector('inpfnCheckSubmitut[name="remarks_etc"]');
  if (!isDirectRemark) {
    if (remark_field.value === "") {
      alert('비고사항을 입력해주세요');
      remark_field.focus();
      return false;
    }
  }

  let formData = $('#workForm').serialize();
  let xhr = new XMLHttpRequest();
  if(id)
    xhr.open('POST', '/work/update/' + id, true);
  else
    xhr.open("POST", '/work/insert', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      if (res.result === 1) {
        alert('정상적으로 등록되었습니다.');
        location.href = '/work/list';
      } else if (res.result === 0 || res.result === 2) {
        alert('이미 동일한 날짜에 입력된 작업이 있습니다.');
      }
    }
  };
  xhr.send(formData);
}
