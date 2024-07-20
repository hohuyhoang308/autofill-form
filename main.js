// ==UserScript==
// @name         autofill
//@author        Hồ Huy Hoàng
// @namespace    carl.3h
// @version      1.4
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
    const values = [
      "32324_197",
      "32324_015",
      "32324_Gym4",
      "32324_050",
      "32324_121",
      "32324_132"
    ];
    let currentValueIndex = 0;

    document.addEventListener("keydown", function(event) {
      if (event.key === "`") {
  function loopThroughValues() {
    var radioButton = document.querySelector('input[value="Công nghệ Thông tin"]');
    if (radioButton) {
      console.log("Found radio button");
      radioButton.click();
    } else {
      console.log("Could not find radio button");
    }
    var nextButton = document.querySelector('button[aria-label="Next"]');
    if (nextButton) {
      console.log("Found Next button");
      nextButton.click();
    } else {
      console.log("Could not find Next button");
    }

    // Wait for 1 second and then click the listbox
    setTimeout(function() {
      var listbox = document.querySelector('div[role="button"][aria-haspopup="listbox"]');
      if (listbox) {
        console.log("Found listbox");
        listbox.click();
        // Wait for the listbox options to load
        setTimeout(function() {
          var listBoxOptions = document.querySelectorAll('span.text-format-content');
          for (var i = 0; i < listBoxOptions.length; i++) {
            if (listBoxOptions[i].textContent.startsWith(values[currentValueIndex])) {
              console.log("Đã chọn : "+values[currentValueIndex]);
              listBoxOptions[i].click();
              break;
            }
          }
          // Wait for the radio buttons to load
          setTimeout(function() {
            var radioButton = document.querySelector('input[value=">90 %"]');
            if (radioButton) {
              console.log("Found radio button");
              radioButton.click();
            } else {
              console.log("Could not find radio button");
            }
            // Click the Next button
            var nextButton = document.querySelector('button[aria-label="Next"]');
            if (nextButton) {
              console.log("Found Next button");
              nextButton.click();
              // Wait for 1 second and then execute the code to fill in the text box and select the radio buttons
              setTimeout(function() {
                // Fill in the text box

                // Select the radio buttons
                const radioInputs = document.querySelectorAll('input[role="radio"]');
                const radioAim = "Rất hài lòng";
                const filteredRadioInputs = Array.from(radioInputs).filter((radioInput) => {
                  const ariaLabel = radioInput.getAttribute('aria-label');
                  return ariaLabel.includes(radioAim);
                });
                let clickCount = 0;
                const interval = setInterval(() => {
                  if (clickCount < filteredRadioInputs.length) {
                    filteredRadioInputs[clickCount].click();
                    console.log("Đã Click Đánh Giá", radioAim, "ID :", clickCount);
                    clickCount++;
                  } else {
                    const inputElement = document.querySelector('input[aria-label="Single line text"]');
                    if (inputElement) {
                      inputElement.value = "Hài lòng";
                    } else {
                      console.log("Không Tìm Thấy Text Box");
                    }
                    clearInterval(interval);
                    // Wait for 2 seconds before submitting the form
                    setTimeout(function() {
                      var submitButton = document.querySelector('button[data-automation-id="submitButton"]');
                      if (submitButton) {
                        console.log("Found Submit button");
                        submitButton.click();
                        // Wait for 0.5 seconds and then click the "Submit another response" button
                        setTimeout(function() {
                          var submitAnotherButton = document.querySelector('span[data-automation-id="submitAnother"]');
                          if (submitAnotherButton) {
                            console.log("Found Submit another response button");
                            submitAnotherButton.click();
                            currentValueIndex = (currentValueIndex + 1) % values.length;
                            loopThroughValues(); // Call the loopThroughValues function again
                          } else {
                            console.log("Could not find Submit anotherresponse button");
                          }
                        }, 1000); // wait for 1 second before trying to click the "Submit another response" button
                      } else {
                        console.log("Could not find Submit button");
                      }
                    }, 2000);
                  }
                }, 50); // mỗi 50mili click 1 nhát
              }, 1000); // Wait for 1 second before filling in the text box and selecting the radio buttons
            } else {
              console.log("Could notfind Next button");
            }
          }, 500); // Wait for 0.5 seconds for the radio buttons to load
        }, 500); // Wait for 0.5 seconds for the listbox options to load
      } else {
        console.log("Could not find listbox");
      }
    }, 1000); // Wait for 1 second before clicking the listbox
  }

  // Call the loopThroughValues function to start the loop
  loopThroughValues();
      }
    });
  })();
