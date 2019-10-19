// Create Element.remove() function if not exist => IE 호환성 작업. remove() 가 안되는 IE
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}
// 새 줄 추가 parameter => tbody : 아이디, name : input 이름
fnNewRow = function(tbody_id, name){
  let tr = document.createElement('tr');
  let td = document.createElement('td');
  td.setAttribute('class', 'text-center');
  let div = document.createElement('div');
  div.setAttribute('class', 'form-group my-0');
  let input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('class', 'form-control');
  input.setAttribute('name', name);
  tr.appendChild(td);
  td = document.createElement('td');
  div.appendChild(input);
  td.appendChild(div);
  tr.appendChild(td);
  td = document.createElement('td');
  td.setAttribute('class', 'text-center');
  let a = document.createElement('a');
  a.setAttribute('class', 'btn btn-danger btn-sm px-2');
  let i = document.createElement('i');
  i.setAttribute('class', 'now-ui-icons ui-1_simple-delete text-white');
  i.setAttribute('style', 'font-size:9px;');
  a.appendChild(i);
  a.onclick = function(){console.log(this); this.parentElement.parentElement.remove()};
  td.appendChild(a);
  tr.appendChild(td);

  document.querySelector(tbody_id).appendChild(tr);
};
// 신규 저장  parameter => name : 입력값 input, form_name : 폼이름
fnCreate = function(name, form_name){
  let isEmpty = true;
  // IE 호환성 작업 querySelectorAll 은 NodeList 이므로 IE 에서는 forEach 문이 안 먹힌다... 그래서 array 형식으로 변환해줌.
  let allInputs = document.querySelectorAll('input[name="' + name + '"]');
  let list = Array.prototype.slice.call(allInputs);
  list.forEach(function(v){if(v.value) isEmpty = false;});
  if(isEmpty) {
    $.notify({
      message:'등록된 내용이 없습니다.'
    },{
      type:'danger',
      placement: {from: "top", align: "right"},
      template:now_ui_template,
      delay:2000
    });
    return;
  }
  let data = $(form_name).serialize();
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/admin/work/' + name);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      $.notify({
        message:'정상적으로 수정되었습니다'
      },{
        type:'success',
        placement: {from: "top", align: "right"},
        template:now_ui_template,
        delay:2000
      });
    }else if(this.readyState === XMLHttpRequest.DONE && this.status === 301){
      $.notify({
        message:'등록실패. 중복된 부서가 있습니다'
      },{
        type:'danger',
        placement: {from: "top", align: "right"},
        template:now_ui_template,
        delay:2000
      });
    }
  };
  xhr.send(data);
};
// 수정   parameter => _id : id, obj : 버튼 obj, name : 스키마 이름
fnUpdate = function(_id, obj, name){
  let newVal = obj.parentElement.parentElement.querySelector('input').value;
  let xhr = new XMLHttpRequest();
  xhr.open('PUT', '/admin/work/' + name + '/' + _id + '/' + newVal);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      if(res.ok===1){
        $.notify({
          message:'정상적으로 수정되었습니다'
        },{
          type:'success',
          placement: {from: "top", align: "right"},
          template:now_ui_template,
          delay:2000
        });
      }else if(this.readyState === XMLHttpRequest.DONE && this.status === 301){
        $.notify('수정실패! 관리자에게 문의해 주세요.',{
          type:'danger',
          placement: {from: "top", align: "right"},
          template:now_ui_template,
          delay:2000
        });
      }
    }
  };
  xhr.send();
};
// 부서관리 삭제  parameter => _id : id, obj : 버튼 obj, name : 스키마 이름
fnDelete = function(_id, obj, name){
  let tr = obj.parentElement.parentElement;
  let xhr = new XMLHttpRequest();
  xhr.open('DELETE', '/admin/work/' + name + '/' + _id);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      if(res.ok===1){
        $.notify({
          message:'정상적으로 삭제되었습니다'
        },{
          type:'success',
          placement: {from: "top", align: "right"},
          template:now_ui_template,
          delay:2000
        });
        tr.remove();
      }else if(this.readyState === XMLHttpRequest.DONE && this.status === 301){
        $.notify('삭제실패! 관리자에게 문의해 주세요.',{
          type:'danger',
          placement: {from: "top", align: "right"},
          template:now_ui_template,
          delay:2000
        });
      }
    }
  };
  xhr.send();
};