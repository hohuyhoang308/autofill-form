// ==UserScript==
// @name         autofill
// @author       Hồ Huy Hoàng
// @namespace    hohuyhoang308
// @version      1.26
// @description  tự động đánh giá khảo sát với menu chỉnh sửa.
// @include      office.com
// @match        https://forms.office.com/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // ===== CÁC BIẾN CÓ THỂ TÙY CHỈNH (SẼ ĐƯỢC HIỂN THỊ TRONG MENU) =====
    let MON_HOC_VALUES = GM_getValue('MON_HOC_VALUES', [
        "22425_192",
        "22425_043C",
        "22425_040C",
        "22425_006C"
    ]);

    let LUA_CHON = GM_getValue('LUA_CHON', {
        NGANH: "Công nghệ Thông tin",
        TY_LE_THAM_GIA: ">90 %",
        DANH_GIA: "Rất hài lòng",
        TEXT_BOX: "Hài lòng"
    });

    let NGANH_OPTIONS = GM_getValue('NGANH_OPTIONS', [
        "Công nghệ Thông tin",
        "Luật",
        "Luật Kinh tế",
        "Kế toán",
        "Tài chính Ngân hàng",
        "Marketing",
        "Thương mại điện tử",
        "Quản trị Kinh doanh",
        "Ngôn ngữ Anh",
        "Ngôn ngữ Nhật",
        "Ngôn ngữ Trung Quốc",
        "Quản trị Dịch vụ du lịch và Lữ hành",
        "Quản trị Khách sạn",
        "Quản lý Bệnh viện",
        "Công nghệ Tài chính",
        "Ngôn ngữ Hàn Quốc",
        "Kỹ thuật Máy tính",
        "Kinh tế Quốc tế",
        "Tâm Lý Học"
    ]);

    let TY_LE_THAM_GIA_OPTIONS = GM_getValue('TY_LE_THAM_GIA_OPTIONS', [
        "<50%",
        "50% - 70%",
        "70% - 90%",
        ">90 %"
    ]);

    let DANH_GIA_OPTIONS = GM_getValue('DANH_GIA_OPTIONS', [
        "Rất không hài lòng",
        "Không hài lòng",
        "Phân vân",
        "Hài lòng",
        "Rất hài lòng"
    ]);

    // Thời gian chờ (milliseconds)
    const DELAY = {
        CLICK_RADIO: 50,
        SUBMIT_FORM: 1000,
        NEXT_FORM: 2000,
        LOAD_LISTBOX: 500,
        LOAD_ELEMENTS: 1000,
        RETRY: 500
    };

    // Tracking variables
    let currentValueIndex = 0;
    let currentOptionForSameCode = 0;
    let matchingOptions = [];
    let processedCourses = new Set();
    let completedVariantCount = 0;
    let allProcessed = false;


    function selectAllRatHaiLongAndSubmit() {
        console.log(`Bắt đầu chọn tất cả '${LUA_CHON.DANH_GIA}'`);
        const radioInputs = document.querySelectorAll('input[role="radio"]');
        let foundDanhGia = false;

        // Ánh xạ aria-posinset từ 1 đến 5 với DANH_GIA_OPTIONS
        const posInSetMap = {};
        DANH_GIA_OPTIONS.forEach((option, index) => {
            posInSetMap[index + 1] = option; // 1 -> "Rất không hài lòng", 2 -> "Không hài lòng", 3 -> "Phân vân", 4 -> "Hài lòng", 5 -> "Rất hài lòng"
        });

        radioInputs.forEach(radio => {
            const posInSet = parseInt(radio.getAttribute('aria-posinset'));
            if (posInSet && posInSetMap[posInSet] === LUA_CHON.DANH_GIA) {
                radio.click();
                foundDanhGia = true;
                console.log(`Đã chọn Đánh giá: ${LUA_CHON.DANH_GIA} tại aria-posinset ${posInSet}`);
            }
        });

        if (!foundDanhGia) {
            console.log(`Không tìm thấy tùy chọn '${LUA_CHON.DANH_GIA}' dựa trên aria-posinset`);
            return;
        }

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
            elements[0].click();
            if (callback) callback();
        } else {
            console.log(`Không tìm thấy ${elementName}`);
        }
    }


    function createConfigMenu() {
        const menuStyle = `
            #configMenu {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid #ccc;
                padding: 5px; /* Giảm padding */
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                z-index: 9999;
                max-width: 250px; /* Giảm max-width */
                min-width: 200px; /* Đặt min-width để tránh quá nhỏ */
            }
            #configMenu h3 {
                margin: 0 0 5px 0; /* Giảm margin */
                cursor: pointer;
                user-select: none;
                font-size: 14px; /* Giảm font-size */
            }
            #configMenu .content {
                display: none;
                margin-top: 5px; /* Giảm margin-top */
            }
            #configMenu select, #configMenu textarea, #configMenu input {
                width: 100%;
                margin: 3px 0; /* Giảm margin */
                padding: 3px; /* Giảm padding */
                font-size: 12px; /* Giảm font-size */
            }
            #configMenu button {
                margin: 3px 0; /* Giảm margin */
                padding: 3px 6px; /* Giảm padding */
                background: #007bff;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px; /* Giảm font-size */
            }
            #configMenu button:hover {
                background: #0056b3;
            }
        `;

        const nganhSelect = NGANH_OPTIONS.map(option => `<option value="${option}" ${option === LUA_CHON.NGANH ? 'selected' : ''}>${option}</option>`).join('');
        const tyLeSelect = TY_LE_THAM_GIA_OPTIONS.map(option => `<option value="${option}" ${option === LUA_CHON.TY_LE_THAM_GIA ? 'selected' : ''}>${option}</option>`).join('');
        const danhGiaSelect = DANH_GIA_OPTIONS.map(option => `<option value="${option}" ${option === LUA_CHON.DANH_GIA ? 'selected' : ''}>${option}</option>`).join('');

        const menuHtml = `
            <div id="configMenu">
                <h3 onclick="toggleMenu()">Cấu hình tự động điền <span style="font-size: 10px;">(Click để mở/đóng)</span></h3>
                <div class="content">
                    <h4>Danh sách mã môn học</h4>
                    <textarea id="monHocValues" rows="3" placeholder="Nhập mã môn học, mỗi mã một dòng">${MON_HOC_VALUES.join("\n")}</textarea>

                    <h4>Các lựa chọn form</h4>
                    <label>Ngành: </label><select id="nganh">${nganhSelect}</select><br/>
                    <label>Tỷ lệ tham gia: </label><select id="tyLeThamGia">${tyLeSelect}</select><br/>
                    <label>Đánh giá: </label><select id="danhGia">${danhGiaSelect}</select><br/>
                    <label>Nội dung ô text: </label><input type="text" id="textBox" value="${LUA_CHON.TEXT_BOX}" /><br/>

                    <h4>Chạy tự động</h4>
                    <button id="startProcess">Bắt đầu</button><br/>
                    <button id="selectAndSubmit">Chọn & Submit</button>

                    <button id="saveConfig">Lưu cấu hình</button>
                </div>
            </div>
        `;

        const script = document.createElement('script');
        script.textContent = `
            function toggleMenu() {
                const content = document.querySelector('#configMenu .content');
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        `;
        document.head.appendChild(script);
        document.head.insertAdjacentHTML('beforeend', `<style>${menuStyle}</style>`);
        document.body.insertAdjacentHTML('beforeend', menuHtml);


        document.getElementById('saveConfig').addEventListener('click', function() {
            MON_HOC_VALUES = document.getElementById('monHocValues').value.split('\n').map(item => item.trim()).filter(item => item);
            LUA_CHON.NGANH = document.getElementById('nganh').value;
            LUA_CHON.TY_LE_THAM_GIA = document.getElementById('tyLeThamGia').value;
            LUA_CHON.DANH_GIA = document.getElementById('danhGia').value;
            LUA_CHON.TEXT_BOX = document.getElementById('textBox').value;

            GM_setValue('MON_HOC_VALUES', MON_HOC_VALUES);
            GM_setValue('LUA_CHON', LUA_CHON);
            GM_setValue('NGANH_OPTIONS', NGANH_OPTIONS);
            GM_setValue('TY_LE_THAM_GIA_OPTIONS', TY_LE_THAM_GIA_OPTIONS);
            GM_setValue('DANH_GIA_OPTIONS', DANH_GIA_OPTIONS);

            alert('Cấu hình đã được lưu!');
            console.log('Cấu hình mới:', { MON_HOC_VALUES, LUA_CHON });
        });

        document.getElementById('startProcess').addEventListener('click', function() {
            currentValueIndex = 0;
            currentOptionForSameCode = 0;
            matchingOptions = [];
            processedCourses.clear();
            completedVariantCount = 0;
            allProcessed = false;
            loopThroughValues();
        });

        document.getElementById('selectAndSubmit').addEventListener('click', function() {
            selectAllRatHaiLongAndSubmit();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createConfigMenu);
    } else {
        createConfigMenu();
    }
})();
