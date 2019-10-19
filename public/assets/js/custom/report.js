function fnDownPDF(){
  let target = document.querySelector('#table_report');
  let parent_top = target.parentElement.style.marginTop;
  target.parentElement.style.marginTop = '-' + target.scrollHeight + 'px';
  target.style.display = 'inline-block';
  target.style.width = '100%';

  html2canvas(target, {
    scale:1.5
  }).then((canvas)=>{
    onrendered:{
      let pageData = canvas.toDataURL('image/jpeg', 1.0);
      let pdf = new jsPDF('', 'pt', 'a4');
      pdf.addImage(pageData, 'JPEG', 0, 50, 595.28, 592.28/canvas.width * canvas.height );
      pdf.save('work_report.pdf');
    }
    document.querySelector('#htmlToCanvas').innerHTML = '';
    document.querySelector('#htmlToCanvas').appendChild(canvas);
    target.parentElement.style.marginTop = parent_top;
  });
  $('#pdfModal').modal('show')
}
function fnSearchMonth() {
  location.href = '/work/report/' + document.querySelector('select').value;
}