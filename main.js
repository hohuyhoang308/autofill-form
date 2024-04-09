// ==UserScript==
// @name         autofill
// @namespace    carl.3h
// @version      1
// @description  tự động đánh giá khảo sát
// @include      office.com
// @match        https://forms.office.com/Pages/*
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
  if (event.key === "c") {
    // Lấy phần tử input
    const inputElement = document.querySelector('input[aria-label="Single line text"]');
    // Thiết lập giá trị "Hài lòng" cho phần tử input
    inputElement.value = "Hài lòng";

    // Lấy tất cả các phần tử input radio
    const radioInputs = document.querySelectorAll('input[type="radio"]');

    // Lọc các phần tử input radio có chuỗi "Rất hài lòng" trong aria-label
    const filteredRadioInputs = Array.from(radioInputs).filter((radioInput) => {
      const ariaLabel = radioInput.getAttribute('aria-label');
      return ariaLabel.includes("Rất hài lòng");
    });

    // Số lần click
    let clickCount = 0;

    // Kích hoạt sự kiện click vào radio button mỗi giây
    const interval = setInterval(() => {
      // Kiểm tra xem đã click hết tất cả các radio button hay chưa
      if (clickCount < filteredRadioInputs.length) {
        // Click vào radio button tiếp theo
        filteredRadioInputs[clickCount].click();
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
        }, 20000000);
      }
    }, 100);
  }
});
})();
