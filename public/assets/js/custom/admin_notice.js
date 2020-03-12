//  file upload 파일을 선택하면 발생함. 멀티 파일 업로드 기능 추가
let fileInput = document.getElementById("notice_file");
fileInput.addEventListener("change", function(e) {
  const formData = new FormData();
  console.log("e : ", e);
  Object.keys(e.target.files).forEach(function(key) {
    formData.append(
      "notice_file[]",
      e.target.files[key],
      e.target.files[key].name
    );
  });

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/admin/notice/file_upload");
  xhr.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let res = JSON.parse(this.response);
      document.querySelector('input[name="path"]').value = res.map(function(v) {
        return v.path;
      });
      document.querySelector('input[name="originalname"]').value = res.map(
        function(v) {
          return v.originalname;
        }
      );
    }
  };
  xhr.send(formData);
});

function fnDeleteNotice(id) {
  if (confirm("삭제하시면 복구가 불가능 합니다. 계속 진행하시겠습니까?")) {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/admin/notice/delete/" + id, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        let res = JSON.parse(this.response);
        if (res.ok === 1) {
          alert("정상적으로 삭제되었습니다.");
          location.href = "/admin/notice/list";
        }
      }
    };
    xhr.send();
  }
}
// 공지사항 등록
function fnCreate() {
  let title = document.querySelector('input[name="title"]');
  let writer = document.querySelector('input[name="writer"]');
  let content = $("#notice_textarea").summernote("code");
  if (!title.value) {
    alert("제목을 입력해주세요.");
    title.focus();
    return false;
  }
  if (!writer.value) {
    alert("작성자를 입력해주세요.");
    writer.focus();
    return false;
  }
  if (!$(content).text()) {
    alert("내용을 입력해주세요");
    return false;
  }
  let path = document.querySelector('input[name="path"]');
  let originalname = document.querySelector('input[name="originalname"]');

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/admin/notice/create", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      alert("정상적으로 등록되었습니다.");
      location.href = "/admin/notice/list";
    }
  };
  xhr.send(
    JSON.stringify({
      title: title.value,
      writer: writer.value,
      content: content,
      path: path.value,
      originalname: originalname.value
    })
  );
}
// 공지사항 수정
function fnUpdate() {
  let title = document.querySelector('input[name="title"]');
  let writer = document.querySelector('input[name="writer"]');
  let content = $("#notice_content").summernote("code");
  if (!title.value) {
    alert("제목을 입력해주세요.");
    title.focus();
    return false;
  }
  if (!writer.value) {
    alert("작성자를 입력해주세요.");
    writer.focus();
    return false;
  }
  if (!$(content).text()) {
    alert("내용을 입력해주세요");
    return false;
  }

  let path = document.querySelector('input[name="path"]');
  let originalname = document.querySelector('input[name="originalname"]');
  let exist_path = [],
    exists_origin = [];
  document.querySelectorAll("a[data-role='exist-file']").forEach(function(v) {
    exist_path.push(v.getAttribute("href"));
    exists_origin.push(v.text);
  });
  if (path.value !== "") exist_path = path.value.split(",").concat(exist_path);
  if (originalname.value !== "")
    exists_origin = originalname.value.split(",").concat(exists_origin);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/admin/notice/update", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      alert("수정했습니다.");
      location.href = "/admin/notice/list";
    }
  };
  let formData = {
    _id: document.querySelector('input[name="_id"]').value,
    title: title.value,
    writer: writer.value,
    content: content,
    path: exist_path.join(","),
    originalname: exists_origin.join(",")
  };
  console.log("form data : ", formData);
  xhr.send(JSON.stringify(formData));
}
//  등록된 파일 삭제하기
document
  .querySelectorAll('button[data-role="removeFile"]')
  .forEach(function(btn) {
    btn.addEventListener("click", function() {
      if (!confirm("파일을 삭제하시겠습니까?")) return false;
      let id = document.querySelector('input[name="_id"]').value;
      let parent = this.parentElement;
      let a = parent.querySelector("a");
      let pathname_list = [];
      let detatch_list = [];
      let origin_list = [];
      document.querySelectorAll(".card-body a").forEach(function(v) {
        if (v.pathname !== a.pathname) pathname_list.push(v.pathname);
        else detatch_list.push(v.pathname);
        if (v.text !== a.text) origin_list.push(v.text);
      });
      let formData = {};
      formData["id"] = id;
      formData["doc_path"] = pathname_list.join(",");
      formData["file_name"] = origin_list.join(",");
      formData["detatch_path"] = detatch_list.join(",");

      let xhr = new XMLHttpRequest();
      xhr.open("PUT", "/admin/notice/file_detatch", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          let res = JSON.parse(this.response);
          alert(res.message);
          if (res.code === 1) {
            parent.remove();
          }
        }
      };
      console.log("formdata : ", formData);
      xhr.send(JSON.stringify(formData));
    });
  });
