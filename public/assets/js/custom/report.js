//  가동보고서 pdf 다운로드
function fnDownPDF() {
  let target = document.querySelector('#table_report');
  let parent_top = target.parentElement.style.marginTop;
  target.parentElement.style.marginTop = '-' + target.scrollHeight + 'px';
  target.style.display = 'inline-block';
  target.style.width = '100%';

  html2canvas(target, {
    scale: 1.5
  }).then((canvas) => {
    onrendered:{
      let pageData = canvas.toDataURL('image/jpeg', 1.0);
      let pdf = new jsPDF('', 'pt', 'a4');
      pdf.addImage(pageData, 'JPEG', 0, 50, 595.28, 592.28 / canvas.width * canvas.height);
      pdf.save('work_report.pdf');
    }
    document.querySelector('#htmlToCanvas').innerHTML = '';
    document.querySelector('#htmlToCanvas').appendChild(canvas);
    target.parentElement.style.marginTop = parent_top;
  });
  $('#pdfModal').modal('show')
}

// 월별 조회기능
function fnSearchMonth() {
  location.href = '/work/report/' + document.querySelector('select').value;
}

// excel 다운로드
function exportExcel() {
  let list = [];
  // 년, 월 입력
  let ym = document.querySelector('h5[about="ym_search"]').innerText;
  let user_name = document.querySelector('td[about="user_name"]').innerText;
  let user_en_name = document.querySelector('td[data-cell="D2"]').innerText;
  let search_month = document.querySelector('input[name="search_month"]').value;
  let en_month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let doc_name = en_month[search_month - 1] + '_' + user_en_name;
  // let doc_name = [ym.split(' ')[0], ym.split(' ')[1], '가동보고서', user_name].join('_');
  list.push({A1: ym.split(' ')[0]});
  list.push({C1: ym.split(' ')[1]});
  document.querySelectorAll('td[data-cell]').forEach(function (v) {
    if(v.innerText !== ''){
      let obj = {};
      obj[v.dataset.cell] = v.innerHTML;
      list.push(obj);
    }
  });
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/work/report/excel', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      console.log('res : ', res);
      let a = document.createElement('a');
      a.href = location.origin + '/' + res.download_path;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  xhr.send(JSON.stringify({excel_data: list, doc_name: doc_name}));
}