// ==UserScript==
// @name         autofill
// @author       Hồ Huy Hoàng
// @namespace    hohuyhoang308
// @version      1.11
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

    // ===== CÁC BIẾN CÓ THỂ TÙY CHỈNH =====
    // Danh sách mã môn học
    const MON_HOC_VALUES = [
      "Mã Môn 1",
      "Mã Môn 2",
      "Mã Môn 3",
      "Mã Môn 4"
    ];

    // Các lựa chọn dành cho form
    const LUA_CHON = {
      NGANH: "Công nghệ Thông tin",        // Ngành học mặc định là công nghệ thông tin
      TY_LE_THAM_GIA: ">90 %",              // Tỷ lệ tham gia lớp học
      DANH_GIA: "Rất hài lòng",            // Đánh giá chọn tự động
      TEXT_BOX: "Hài lòng"                  // Nội dung điền vào ô text
    };

    // Thời gian chờ (milliseconds)
    const DELAY = {
      CLICK_RADIO: 50,                      // Thời gian giữa các lần click radio
      SUBMIT_FORM: 1000,                    // Thời gian chờ trước khi submit
      NEXT_FORM: 2000,                      // Thời gian chờ trước khi bắt đầu form mới
      LOAD_LISTBOX: 500,                    // Thời gian chờ để listbox load
      LOAD_ELEMENTS: 1000                   // Thời gian chờ để các phần tử load
    };
    // ===== KẾT THÚC PHẦN TÙY CHỈNH =====

    // Tracking variables
    let currentValueIndex = 0;
    let currentOptionForSameCode = 0;
    let matchingOptions = [];
    let processedCourses = new Set(); // Theo dõi mã môn học đã xử lý
    let completedVariantCount = 0; // Đếm tổng số biến thể đã hoàn thành
    let allProcessed = false; // Cờ để kiểm tra xem tất cả đã được xử lý chưa

    document.addEventListener("keydown", function(event) {
      if (event.key === "`") {
        currentValueIndex = 0;
        currentOptionForSameCode = 0;
        matchingOptions = [];
        processedCourses.clear();
        completedVariantCount = 0;
        allProcessed = false;
        loopThroughValues();
      } else if (event.key === "1") {
        selectAllRatHaiLongAndSubmit();
      }
    });

    function selectAllRatHaiLongAndSubmit() {
      console.log(`Bắt đầu chọn tất cả '${LUA_CHON.DANH_GIA}'`);
      const radioInputs = document.querySelectorAll('input[role="radio"]');
      const filteredRadioInputs = Array.from(radioInputs).filter((radioInput) => {
        const ariaLabel = radioInput.getAttribute('aria-label');
        return ariaLabel && ariaLabel.includes(LUA_CHON.DANH_GIA);
      });

      if (filteredRadioInputs.length === 0) {
        console.log(`Không tìm thấy tùy chọn '${LUA_CHON.DANH_GIA}'`);
        return;
      }

      console.log(`Tìm thấy ${filteredRadioInputs.length} tùy chọn '${LUA_CHON.DANH_GIA}'`);
      let clickCount = 0;
      const interval = setInterval(() => {
        if (clickCount < filteredRadioInputs.length) {
          filteredRadioInputs[clickCount].click();
          console.log(`Đã Click Đánh Giá ${LUA_CHON.DANH_GIA}, ID: ${clickCount}`);
          clickCount++;
        } else {
          clearInterval(interval);
          const inputElement = document.querySelector('input[aria-label="Single line text"]');
          if (inputElement) {
            inputElement.value = LUA_CHON.TEXT_BOX;
            console.log(`Đã điền text box với giá trị: ${LUA_CHON.TEXT_BOX}`);
          }
          setTimeout(function() {
            const submitButton = document.querySelector('button[data-automation-id="submitButton"]');
            if (submitButton) {
              console.log("Đang click nút Submit");
              submitButton.click();

              completedVariantCount++;

              let moveToNextCode = false;

              if (matchingOptions.length > 0 && currentOptionForSameCode < matchingOptions.length - 1) {
                currentOptionForSameCode++;
                console.log(`Chuyển sang tùy chọn tiếp theo (${currentOptionForSameCode + 1}/${matchingOptions.length}) cho mã ${MON_HOC_VALUES[currentValueIndex]}`);
              } else {
                const currentCode = MON_HOC_VALUES[currentValueIndex];
                processedCourses.add(currentCode);
                console.log(`Đã hoàn thành tất cả biến thể của mã: ${currentCode}`);
                console.log(`Đã xử lý ${processedCourses.size}/${MON_HOC_VALUES.length} mã môn học`);

                currentValueIndex = (currentValueIndex + 1) % MON_HOC_VALUES.length;
                currentOptionForSameCode = 0;
                matchingOptions = [];
                moveToNextCode = true;

                if (processedCourses.size >= MON_HOC_VALUES.length) {
                  allProcessed = true;
                  console.log("============================================");
                  console.log(`ĐÃ HOÀN THÀNH TẤT CẢ ${MON_HOC_VALUES.length} MÃ MÔN HỌC!`);
                  console.log(`Tổng số biến thể đã xử lý: ${completedVariantCount}`);
                  console.log("============================================");
                }
              }

              setTimeout(function() {
                const submitAnotherButton = document.querySelector('span[data-automation-id="submitAnother"]');
                if (submitAnotherButton && !allProcessed) {
                  console.log("Đang click nút Submit another response");
                  submitAnotherButton.click();

                  setTimeout(function() {
                    if (moveToNextCode && processedCourses.has(MON_HOC_VALUES[currentValueIndex])) {
                      let foundUnprocessed = false;
                      const startIndex = currentValueIndex;

                      do {
                        if (!processedCourses.has(MON_HOC_VALUES[currentValueIndex])) {
                          foundUnprocessed = true;
                          break;
                        }
                        currentValueIndex = (currentValueIndex + 1) % MON_HOC_VALUES.length;
                      } while (currentValueIndex !== startIndex);

                      if (!foundUnprocessed) {
                        allProcessed = true;
                        console.log("Đã xử lý tất cả mã môn học. Dừng quy trình.");
                        return;
                      }
                    }

                    if (!allProcessed) {
                      console.log("Form mới đã load, tiếp tục vòng lặp");
                      loopThroughValues();
                    } else {
                      console.log("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
                    }
                  }, DELAY.LOAD_ELEMENTS);
                } else if (allProcessed) {
                  console.log("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
                } else {
                  console.log("Không tìm thấy nút Submit another response");
                }
              }, DELAY.NEXT_FORM);
            } else {
              console.log("Không tìm thấy nút Submit");
            }
          }, DELAY.SUBMIT_FORM);
        }
      }, DELAY.CLICK_RADIO);
    }

    function loopThroughValues() {
      console.log(`Bắt đầu quy trình với mã môn học: ${MON_HOC_VALUES[currentValueIndex]} (${currentValueIndex + 1}/${MON_HOC_VALUES.length})`);

      var radioButton = document.querySelector(`input[value="${LUA_CHON.NGANH}"]`);
      if (radioButton) {
        console.log(`Tìm thấy nút radio ${LUA_CHON.NGANH}`);
        radioButton.click();
      } else {
        console.log(`Không tìm thấy nút radio ${LUA_CHON.NGANH}`);
      }

      clickElement('button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]', "Next/Tiếp theo button", function() {
        setTimeout(function() {
          var listbox = document.querySelector('div[role="button"][aria-haspopup="listbox"]');
          if (listbox) {
            console.log("Tìm thấy listbox");
            listbox.click();
            setTimeout(function() {
              var listBoxOptions = document.querySelectorAll('span.text-format-content');

              matchingOptions = [];
              for (var i = 0; i < listBoxOptions.length; i++) {
                if (listBoxOptions[i].textContent.startsWith(MON_HOC_VALUES[currentValueIndex])) {
                  matchingOptions.push(listBoxOptions[i]);
                }
              }

              console.log(`Tìm thấy ${matchingOptions.length} tùy chọn cho mã ${MON_HOC_VALUES[currentValueIndex]}`);

              if (matchingOptions.length > 0) {
                console.log(`Đã chọn: ${matchingOptions[currentOptionForSameCode].textContent}`);
                matchingOptions[currentOptionForSameCode].click();
              } else {
                console.log(`Không tìm thấy tùy chọn với giá trị: ${MON_HOC_VALUES[currentValueIndex]}`);

                processedCourses.add(MON_HOC_VALUES[currentValueIndex]);

                currentValueIndex = (currentValueIndex + 1) % MON_HOC_VALUES.length;
                currentOptionForSameCode = 0;

                if (processedCourses.size >= MON_HOC_VALUES.length) {
                  allProcessed = true;
                  console.log("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
                  return;
                }

                if (processedCourses.has(MON_HOC_VALUES[currentValueIndex])) {
                  let foundUnprocessed = false;
                  const startIndex = currentValueIndex;

                  do {
                    if (!processedCourses.has(MON_HOC_VALUES[currentValueIndex])) {
                      foundUnprocessed = true;
                      break;
                    }
                    currentValueIndex = (currentValueIndex + 1) % MON_HOC_VALUES.length;
                  } while (currentValueIndex !== startIndex);

                  if (!foundUnprocessed) {
                    allProcessed = true;
                    console.log("Đã xử lý tất cả mã môn học. Dừng quy trình.");
                    return;
                  }
                }

                setTimeout(loopThroughValues, DELAY.LOAD_ELEMENTS);
                return;
              }

              setTimeout(function() {
                var radioButton = document.querySelector(`input[value="${LUA_CHON.TY_LE_THAM_GIA}"]`);
                if (radioButton) {
                  console.log(`Tìm thấy nút radio ${LUA_CHON.TY_LE_THAM_GIA}`);
                  radioButton.click();
                } else {
                  console.log(`Không tìm thấy nút radio ${LUA_CHON.TY_LE_THAM_GIA}`);
                }
                clickElement('button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]', "Next/Tiếp theo button", function() {
                  setTimeout(function() {
                    selectAllRatHaiLongAndSubmit();
                  }, DELAY.LOAD_ELEMENTS);
                });
              }, DELAY.LOAD_LISTBOX);
            }, DELAY.LOAD_LISTBOX);
          } else {
            console.log("Không tìm thấy listbox");
          }
        }, DELAY.LOAD_ELEMENTS);
      });
    }

    function clickElement(selector, elementName, callback) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Tìm thấy ${elementName}: ${elements.length} phần tử`);
        elements[0].click(); // Click vào phần tử đầu tiên tìm thấy
        if (callback) callback();
      } else {
        console.log(`Không tìm thấy ${elementName}`);
      }
    }
})();
