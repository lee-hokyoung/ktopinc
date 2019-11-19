// IE 의 경우 querySelectAll 를 array 로 인식하기 위해서 prototype 설정을 넣어줌.
if (typeof NodeList !== "undefined" && NodeList.prototype && !NodeList.prototype.forEach) {
  // Yes, there's really no need for `Object.defineProperty` here
  NodeList.prototype.forEach = Array.prototype.forEach;
}
