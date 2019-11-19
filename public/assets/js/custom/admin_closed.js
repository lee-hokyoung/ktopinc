function fnSearchClosed(){
  let year = document.querySelector('select[name="year"]');
  let month = document.querySelector('select[name="month"]');
  location.href = '/admin/closed/list/' + year.value + '/' + month.value;
}