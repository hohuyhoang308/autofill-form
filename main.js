// ==UserScript==
// @name         Hồ Huy Hoàng
// @namespace    carl.3h
// @version      1
// @description  tự động đánh giá khảo sát
// @include      office.com
// @match        https://forms.office.com/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
document.addEventListener("keydown", function(event) {
  if (event.key === "`") {
    // Lấy phần tử input
const inputElement = document.querySelector('input[aria-label="Single line text"]');
if (inputElement) {
  inputElement.value = "Hài lòng";
} else {
  console.log("Không Tìm Thấy TextBox");
}
// Lấy tất cả các phần tử input radio
const radioInputs = document.querySelectorAll('input[role="radio"]');

//Chọn Mục Muốn Đánh Giá
const radioAim = "5";
      // Lọc các phần tử input radio có chuỗi "includes("")" trong aria-label
const filteredRadioInputs = Array.from(radioInputs).filter((radioInput) => {
  const ariaLabel = radioInput.getAttribute('aria-label');
  return ariaLabel.includes(radioAim);
});

    // Số lần click
    let clickCount = 0;

    // Kích hoạt sự kiện click vào radio button mỗi giây
    const interval = setInterval(() => {
      // Kiểm tra xem đã click hết tất cả các radio button hay chưa
      if (clickCount < filteredRadioInputs.length) {
        // Click vào radio button tiếp theo
        filteredRadioInputs[clickCount].click();
          console.log("Đã Click Đánh Giá",radioAim , "ID :" ,clickCount);
        clickCount++;
      } else {
        // Dừng interval nếu đã click hết tất cả các radio button
        clearInterval(interval);

        // Đợi 2 giây trước khi ấn nút Submit
        setTimeout(() => {
          // Tìm phần tử nút Submit
          const submitButton = document.querySelector('button[data-automation-id="submitButton"]');

          // Kích hoạt sự kiện click vào nút Submit
          submitButton.click();
        }, 20000000000000);
      }
    }, 25);
  }
});
})();
