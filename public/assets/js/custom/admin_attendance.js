let current_work_id = '';
// 근무시간 및 작업사항 수정
function fnUpdateTime() {
  console.log('work id : ', current_work_id);
  let tds = document.querySelectorAll('tr[data-id="' + current_work_id + '"] td');
  let start_time = document.querySelector('#timepicker_start');
  let end_time = document.querySelector('#timepicker_end');
  let work_title = $('#work_title').selectpicker('val');
  tds[6].innerText = start_time.value;
  tds[7].innerText = end_time.value;
  tds[8].innerText = work_title;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", '/admin/attendance/time/' + current_work_id, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      $.notify({
        message: res.message
      }, {
        type: res.ok === 1 ? 'success' : 'danger',
        placement: {from: "top", align: "right"},
        template: now_ui_template,
        delay: 2000
      });
      closeModal();
      $('#setTimeModal').modal('hide');
    }
  };
  xhr.send(JSON.stringify({start_time: start_time.value, end_time: end_time.value, work_title: work_title}));
  // $('#setTimeModal').modal('hide');
}

// function closeModal() {
//   $('#setTimeModal').css('display', 'none').removeClass('show');
// }

// 근무시간 모달창 띄우기
function fnOpenSetTimeModal(work_id) {
  let ps_modal = new PerfectScrollbar('.modal-content');
  current_work_id = work_id;
  let xhr = new XMLHttpRequest();
  xhr.open("GET", '/admin/attendance/work/read/' + work_id, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      document.querySelector('#modal_nick').value = res.user_id.user_nick;
      document.querySelector('#timepicker_start').value = res.start_time || '';
      document.querySelector('#timepicker_end').value = res.end_time || '';
      $('#work_title').selectpicker('val', res.work_title);
      $('#remark').selectpicker('val', res.remarks);
      // 모달창 띄우기
      $('#timepicker_start').datetimepicker({
        format: 'HH:mm',
        stepping: 15,
        icons: {
          up: 'fa fa-chevron-up',
          down: 'fa fa-chevron-down'
        },
      });
      $('#timepicker_end').datetimepicker({
        format: 'HH:mm',
        stepping: 15,
        icons: {
          up: 'fa fa-chevron-up',
          down: 'fa fa-chevron-down'
        }
      });
      // perfect scroll 과 충돌이 생겨서 불가피하게 수동으로 모달창을 띄움........
      // $('#setTimeModal').css('display', 'block').addClass('show');
      $('#setTimeModal').modal('show');
    }
  };
  xhr.send();
}

// excel 다운로드
function fnExcelDownload() {
  let data = {};
  let start_date = document.querySelector('#timepicker_attendance_start').value;
  let end_date = document.querySelector('#timepicker_attendance_end').value;
  let user_nick = document.querySelector('#user_nick').value;
  let region = document.querySelector('#user_team').value;
  let isDataOnly = document.querySelector('input[name="isDataOnly"]').value;

  if (user_nick !== '') data['user_nick'] = user_nick;
  if (region !== '') data['region'] = region;
  data['isDataOnly'] = isDataOnly;
  data['attendance_start'] = start_date;
  data['attendance_end'] = end_date;
  let weeks = ['일', '월', '화', '수', '목', '금', '토'];
  let xhr = new XMLHttpRequest();
  // PATCH 를 사용한 이유 : 중복 코딩을 피하기 위함. /attendance (all 방식임. 현재 GET -> 첫 페이지 로딩시, POST -> 조건설정 후 조회시 각각 사용 중)
  xhr.open("PATCH", '/admin/attendance', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let data = JSON.parse(this.response)[0].data;
      let list = data.map(function (v) {
        let obj = {};
        let date = new Date(v.work_date);
        obj['부서명'] = v.works ? v.works.region : '';
        obj['날짜'] = date.toLocaleDateString();
        obj['요일'] = '(' + weeks[date.getDay()] + ')';
        obj['성명'] = v.users.user_nick;
        obj['출근시간'] = v.works ? v.works.start_time ? v.works.start_time : '' : '';
        obj['퇴근시간'] = v.works ? v.works.end_time ? v.works.end_time : '' : '';
        obj['비고'] = v.works ? v.works.remarks : '';
        obj['한비자ID'] = v.users.han_id || '';
        return obj;
      });
      if (list.length > 0) {
        let header = ['부서명', '날짜', '요일', '성명', '출근시간', '퇴근시간', '비고', '한비자ID'];
        fnJsonToExcel(list, header);
      }
    }
  };
  xhr.send(JSON.stringify(data));
}

// json to excel function
function fnJsonToExcel(list, header) {
  let CSV = '';
  CSV += header.join(',') + '\r\n';
  list.forEach(function (row) {
    for (let key in row) {
      CSV += row[key] + ','
    }
    CSV += '\r\n';
  });
  let fileName = 'work_list';
  let blob = new Blob(["\ufeff" + CSV], {type: 'text/csv;charset=utf-8;'});
  let url = URL.createObjectURL(blob);
  // let uri = 'data:text/csv;charset=utf-8,' + CSV;
  let link = document.createElement('a');
  link.href = url;
  link.style = 'visibility:hidden';
  link.download = fileName + '.csv';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 헤더에 checkbox 클릭 => 전체선택/해제
function fnSelectAll(obj) {
  let allCheckBox = document.querySelectorAll('td input[type="checkbox"]:not([disabled])');
  let list = Array.prototype.slice.call(allCheckBox);
  if (obj.checked) list.forEach(function (v) {
    v.checked = true
  });
  else list.forEach(function (v) {
    v.checked = false
  });
}

// 체크항목 일괄 수정
function fnUpdateAll() {
  let checked_obj = document.querySelectorAll('td input[type="checkbox"]:checked');
  let list = Array.prototype.slice.call(checked_obj);
  let data = list.map(function (v) {
    return v.value
  });
  let title = $('button[data-id="select_confirm_all"]').text().trim();
  let xhr = new XMLHttpRequest();
  xhr.open("PUT", '/admin/attendance/confirm', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      $.notify({
        message: res.nModified + '개의 데이터가 수정되었습니다.'
      }, {
        type: res.ok === 1 ? 'success' : 'danger',
        placement: {from: "top", align: "right"},
        template: now_ui_template,
        delay: 2000
      });
      list.forEach(function (v) {
        let obj = document.querySelector('select[data-value="' + v.value + '"]').parentNode.querySelector('button');
        obj.title = title;
        obj.innerText = title;
      });
    }
  };
  xhr.send(JSON.stringify({data: data, confirm_state: document.querySelector('#select_confirm_all').value}));
}

//  table sort 기능 추가
$('#attendance-table').dataTable({
  paging: false,
  scrollY: 500,
  scrollX: true,
  searching: false,
  info: false,
  columnDefs: [{
    targets: [0, 3, 10, 12],
    orderable: false
  }],
  responsive: true,
  initComplete: function (settings, json) {
    settings.nTHead.querySelectorAll('th')[1].click();
    const ps_table = new PerfectScrollbar('.dataTables_scrollBody');
  }
});

//  기간 조회 + pagination
function fnSearchAttendance(page) {
  let start = document.querySelector('#timepicker_attendance_start');
  let end = document.querySelector('#timepicker_attendance_end');
  document.querySelector('input[name="attendance_start"]').value = start.value;
  document.querySelector('input[name="attendance_end"]').value = end.value;
  document.querySelector('input[name="page"]').value = page || 1;
  document.formSearch.submit();
}

$('#select_member').on('changed.bs.select', function (e) {
  location.href = '/admin/attendance/' + e.target.value + '/1';
});
$('.select_work_confirm').on('change.bs.select', function (e) {
  let _id = e.target.dataset.value;
  let confirm = e.target.value;
  let xhr = new XMLHttpRequest();
  xhr.open("PUT", '/admin/attendance/' + _id + '/' + confirm, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      $.notify({
        message: res.message
      }, {
        type: res.result === 1 ? 'success' : 'danger',
        placement: {from: "top", align: "right"},
        template: now_ui_template,
        delay: 2000
      });
    }
  };
  xhr.send();
});

/*  입력된 데이터만 보기 체크/언체크 */
function fnToggleIsDataOnly(chk) {
  let isDataOnly = document.querySelector('input[name="isDataOnly"]');
  if (chk.checked) isDataOnly.value = '1';
  else isDataOnly.value = '0';
}

fnDelete = function (_id, obj) {
  if (!confirm('삭제하시면 복구가 불가능합니다. 계속하시겠습니까?')) return false;
  let tr = obj.parentElement.parentElement;
  let xhr = new XMLHttpRequest();
  xhr.open('DELETE', '/admin/work/' + _id);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      if (res.ok === 1) {
        $.notify({
          message: '정상적으로 삭제되었습니다'
        }, {
          type: 'success',
          placement: {from: "top", align: "right"},
          template: now_ui_template,
          delay: 2000
        });
        tr.childNodes.forEach(function (v, i) {
          if (i > 3) v.innerText = ""
        });
      } else if (this.readyState === XMLHttpRequest.DONE && this.status === 301) {
        $.notify('삭제실패! 관리자에게 문의해 주세요.', {
          type: 'danger',
          placement: {from: "top", align: "right"},
          template: now_ui_template,
          delay: 2000
        });
      }
    }
  };
  xhr.send();
};