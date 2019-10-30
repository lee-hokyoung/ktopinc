function fnSearchBusiness(){
  let year = document.querySelector('select[name="year"]');
  let month = document.querySelector('select[name="month"]');
  location.href = '/admin/business/list/' + year.value + '/' + month.value;
}