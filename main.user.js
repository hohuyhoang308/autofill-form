// ==UserScript==
// @name          autofill_improved
// @author        Hồ Huy Hoàng
// @namespace     hohuyhoang308.autofill.improved
// @version       1.27
// @description   tự động đánh giá khảo sát với menu chỉnh sửa, hỗ trợ radio button và listbox
// @include       office.com
// @match         https://forms.office.com/*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant         GM_xmlhttpRequest
// @grant         GM.xmlHttpRequest
// @grant         GM_getResourceText
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         unsafeWindow
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    try {
        // Prevent conflicts with other scripts
        const SCRIPT_NAMESPACE = 'hohuyhoang308_autofill';

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
                try {
                    const posInSet = parseInt(radio.getAttribute('aria-posinset'));
                    if (posInSet && posInSetMap[posInSet] === LUA_CHON.DANH_GIA) {
                        radio.click();
                        foundDanhGia = true;
                        console.log(`Đã chọn Đánh giá: ${LUA_CHON.DANH_GIA} tại aria-posinset ${posInSet}`);
                    }
                } catch (e) {
                    console.error('Lỗi khi xử lý radio input:', e);
                }
            });

            if (!foundDanhGia) {
                console.log(`Không tìm thấy tùy chọn '${LUA_CHON.DANH_GIA}' dựa trên aria-posinset`);
                // Continue to try filling text box and submitting even if no radio button was found
            }

            try {
                const inputElement = document.querySelector('input[aria-label="Single line text"], textarea[aria-label*="nhận xét"], textarea[aria-label*="góp ý"]'); // More robust selector for text box
                if (inputElement) {
                    inputElement.value = LUA_CHON.TEXT_BOX;
                    const event = new Event('input', { bubbles: true });
                    inputElement.dispatchEvent(event);
                    console.log(`Đã điền text box với giá trị: ${LUA_CHON.TEXT_BOX}`);
                } else {
                    console.log("Không tìm thấy text box để điền.");
                }
            } catch (e) {
                console.error('Lỗi khi điền text box:', e);
            }

            setTimeout(function() {
                try {
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
                            try {
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
                            } catch (e) {
                                console.error('Lỗi khi xử lý submit another:', e);
                            }
                        }, DELAY.NEXT_FORM);
                    } else {
                        console.log("Không tìm thấy nút Submit");
                    }
                } catch (e) {
                    console.error('Lỗi khi xử lý submit:', e);
                }
            }, DELAY.SUBMIT_FORM);
        }

        function loopThroughValues() {
            try {
                if (allProcessed) {
                    console.log("Tất cả mã môn học đã được xử lý. Dừng quy trình.");
                    return;
                }

                console.log(`Bắt đầu quy trình với mã môn học: ${MON_HOC_VALUES[currentValueIndex]} (${currentValueIndex + 1}/${MON_HOC_VALUES.length})`);

                // 1. Click the "Ngành" listbox to open it
                const nganhListbox = document.querySelector('div[role="button"][aria-haspopup="listbox"]');
                if (nganhListbox) {
                    console.log("Tìm thấy listbox Ngành");
                    nganhListbox.click();

                    setTimeout(() => {
                        // 2. Find and click the selected "Ngành" option from the opened list
                        const nganhOptions = document.querySelectorAll('span.text-format-content');
                        let foundNgành = false;
                        for (let i = 0; i < nganhOptions.length; i++) {
                            if (nganhOptions[i].textContent.trim() === LUA_CHON.NGANH) {
                                console.log(`Đã chọn Ngành: ${nganhOptions[i].textContent}`);
                                nganhOptions[i].click();
                                foundNgành = true;
                                break;
                            }
                        }

                        if (!foundNgành) {
                            console.log(`Không tìm thấy tùy chọn Ngành: ${LUA_CHON.NGANH}`);
                        }

                        // Proceed to click the "Next" button after handling "Ngành"
                        clickElement('button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]', "Next/Tiếp theo button", function() {
                            setTimeout(function() {
                                try {
                                    var listbox = document.querySelector('div[role="button"][aria-haspopup="listbox"]');
                                    if (listbox) {
                                        console.log("Tìm thấy listbox cho mã môn học");
                                        listbox.click();
                                        setTimeout(function() {
                                            try {
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
                                                    try {
                                                        var tyLeThamGiaRadio = document.querySelector(`input[value="${LUA_CHON.TY_LE_THAM_GIA}"]`);
                                                        if (tyLeThamGiaRadio) {
                                                            console.log(`Tìm thấy nút radio ${LUA_CHON.TY_LE_THAM_GIA}`);
                                                            tyLeThamGiaRadio.click();
                                                        } else {
                                                            console.log(`Không tìm thấy nút radio ${LUA_CHON.TY_LE_THAM_GIA}`);
                                                        }
                                                        clickElement('button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]', "Next/Tiếp theo button", function() {
                                                            setTimeout(function() {
                                                                selectAllRatHaiLongAndSubmit();
                                                            }, DELAY.LOAD_ELEMENTS);
                                                        });
                                                    } catch (e) {
                                                        console.error('Lỗi khi xử lý radio Tỷ lệ tham gia:', e);
                                                    }
                                                }, DELAY.LOAD_LISTBOX);
                                            } catch (e) {
                                                console.error('Lỗi khi xử lý listbox options (mã môn học):', e);
                                            }
                                        }, DELAY.LOAD_LISTBOX);
                                    } else {
                                        console.log("Không tìm thấy listbox cho mã môn học.");
                                    }
                                } catch (e) {
                                    console.error('Lỗi khi tìm listbox (mã môn học):', e);
                                }
                            }, DELAY.LOAD_ELEMENTS);
                        });
                    }, DELAY.LOAD_LISTBOX); // Give time for the listbox options to appear
                } else {
                    console.log("Không tìm thấy listbox Ngành.");
                    // Fallback to old behavior if it's a radio button for NGANH (less likely based on your HTML)
                    var radioButton = document.querySelector(`input[value="${LUA_CHON.NGANH}"]`);
                    if (radioButton) {
                        console.log(`Tìm thấy nút radio ${LUA_CHON.NGANH}`);
                        radioButton.click();
                        // Continue to click next button after radio button is clicked
                        clickElement('button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]', "Next/Tiếp theo button", function() {
                             setTimeout(function() {
                                // The rest of your logic for the subject code listbox and subsequent steps would go here
                                // For brevity, assuming the rest of the flow is similar to after NGANH listbox is handled
                                // You might need to refactor more to avoid repetition.
                                console.log("Proceeding after NGANH radio button click. This path might need more specific handling based on form structure.");
                                // Re-evaluate where to go from here if NGANH was a radio.
                                // For now, let's assume it leads to the same next steps as the listbox path.
                                // It's better to make NGANH a listbox handling or clearly separate flows.
                             }, DELAY.LOAD_ELEMENTS);
                        });
                    } else {
                        console.log("Không tìm thấy phần tử nào cho Ngành. Kiểm tra lại cấu trúc form.");
                        // If neither listbox nor radio button for Ngành is found, what should happen?
                        // For now, let's just log and potentially stop or move to next value if needed.
                        // You might want to add error handling or jump to the next course if a required field isn't found.
                        processedCourses.add(MON_HOC_VALUES[currentValueIndex]);
                        currentValueIndex = (currentValueIndex + 1) % MON_HOC_VALUES.length;
                        currentOptionForSameCode = 0;
                        if (processedCourses.size >= MON_HOC_VALUES.length) {
                             allProcessed = true;
                             console.log("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
                             return;
                        }
                        setTimeout(loopThroughValues, DELAY.LOAD_ELEMENTS); // Try next value
                    }
                }
            } catch (e) {
                console.error('Lỗi trong loopThroughValues:', e);
            }
        }

        function clickElement(selector, elementName, callback) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`Tìm thấy ${elementName}: ${elements.length} phần tử`);
                    elements[0].click();
                    if (callback) callback();
                } else {
                    console.log(`Không tìm thấy ${elementName}`);
                }
            } catch (e) {
                console.error(`Lỗi khi click ${elementName}:`, e);
            }
        }

        function createConfigMenu() {
            try {
                if (document.getElementById('configMenu')) {
                    return;
                }
                const menuId = SCRIPT_NAMESPACE + '_configMenu';
                const styleId = SCRIPT_NAMESPACE + '_style';

                const menuStyle = `
                    #${menuId} {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: white;
                        border: 1px solid #ccc;
                        padding: 5px;
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        z-index: 99999;
                        max-width: 250px;
                        min-width: 200px;
                    }
                    #${menuId} h3 {
                        margin: 0 0 5px 0;
                        cursor: pointer;
                        user-select: none;
                        font-size: 14px;
                    }
                    #${menuId} .content {
                        display: none;
                        margin-top: 5px;
                    }
                    #${menuId} select, #${menuId} textarea, #${menuId} input {
                        width: 100%;
                        margin: 3px 0;
                        padding: 3px;
                        font-size: 12px;
                    }
                    #${menuId} button {
                        margin: 3px 0;
                        padding: 3px 6px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 12px;
                    }
                    #${menuId} button:hover {
                        background: #0056b3;
                    }
                    .${SCRIPT_NAMESPACE}_neon-text {
                        font-size: 1rem;
                        color: black;
                        text-shadow: 0 0 5px #ff005e, 0 0 10px #ff005e, 0 0 20px #ff005e, 0 0 40px #ff005e, 0 0 80px #ff005e;
                        animation: ${SCRIPT_NAMESPACE}_glow 1.5s infinite alternate;
                    }
                    @keyframes ${SCRIPT_NAMESPACE}_glow {
                        0% {
                            text-shadow: 0 0 5px #ff005e, 0 0 10px #ff005e, 0 0 20px #ff005e, 0 0 40px #ff005e, 0 0 80px #ff005e;
                        }
                        100% {
                            text-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 80px #00d4ff, 0 0 160px #00d4ff;
                        }
                    }
                `;

                const nganhSelect = NGANH_OPTIONS.map(option => `<option value="${option}" ${option === LUA_CHON.NGANH ? 'selected' : ''}>${option}</option>`).join('');
                const tyLeSelect = TY_LE_THAM_GIA_OPTIONS.map(option => `<option value="${option}" ${option === LUA_CHON.TY_LE_THAM_GIA ? 'selected' : ''}>${option}</option>`).join('');
                const danhGiaSelect = DANH_GIA_OPTIONS.map(option => `<option value="${option}" ${option === LUA_CHON.DANH_GIA ? 'selected' : ''}>${option}</option>`).join('');

                const menuHtml = `
                    <div id="${menuId}">
                        <h3 id="${SCRIPT_NAMESPACE}_toggleMenu">Cấu hình tự động điền <span style="font-size: 10px;">(Click để mở/đóng)</span></h3>
                        <div class="content">
                            <h4>Danh sách mã môn học</h4>
                            <textarea id="${SCRIPT_NAMESPACE}_monHocValues" rows="3" placeholder="Nhập mã môn học, mỗi mã một dòng">${MON_HOC_VALUES.join("\n")}</textarea>

                            <h4>Các lựa chọn form</h4>
                            <label>Ngành: </label><select id="${SCRIPT_NAMESPACE}_nganh">${nganhSelect}</select><br/>
                            <label>Tỷ lệ tham gia: </label><select id="${SCRIPT_NAMESPACE}_tyLeThamGia">${tyLeSelect}</select><br/>
                            <label>Đánh giá: </label><select id="${SCRIPT_NAMESPACE}_danhGia">${danhGiaSelect}</select><br/>
                            <label>Nội dung ô text: </label><input type="text" id="${SCRIPT_NAMESPACE}_textBox" value="${LUA_CHON.TEXT_BOX}" /><br/>

                            <h4>Chạy tự động</h4>
                            <button id="${SCRIPT_NAMESPACE}_startProcess">Bắt đầu</button><br/>
                            <button id="${SCRIPT_NAMESPACE}_selectAndSubmit">Chọn & Submit</button>

                            <button id="${SCRIPT_NAMESPACE}_saveConfig">Lưu cấu hình</button>
                            <div class="${SCRIPT_NAMESPACE}_neon-container">
                                <a href="https://www.facebook.com/hohuyhoang308/" target="_blank" class="${SCRIPT_NAMESPACE}_neon-text">TÁC GIẢ : HỒ HUY HOÀNG</a>
                            </div>
                        </div>
                    </div>
                `;

                const styleEl = document.createElement('style');
                styleEl.id = styleId;
                styleEl.textContent = menuStyle;
                document.head.appendChild(styleEl);

                const menuDiv = document.createElement('div');
                menuDiv.innerHTML = menuHtml;
                document.body.appendChild(menuDiv.firstElementChild);

                document.getElementById(`${SCRIPT_NAMESPACE}_toggleMenu`).addEventListener('click', function() {
                    const content = document.querySelector(`#${menuId} .content`);
                    content.style.display = content.style.display === 'block' ? 'none' : 'block';
                });

                document.getElementById(`${SCRIPT_NAMESPACE}_saveConfig`).addEventListener('click', function() {
                    try {
                        MON_HOC_VALUES = document.getElementById(`${SCRIPT_NAMESPACE}_monHocValues`).value.split('\n').map(item => item.trim()).filter(item => item);
                        LUA_CHON.NGANH = document.getElementById(`${SCRIPT_NAMESPACE}_nganh`).value;
                        LUA_CHON.TY_LE_THAM_GIA = document.getElementById(`${SCRIPT_NAMESPACE}_tyLeThamGia`).value;
                        LUA_CHON.DANH_GIA = document.getElementById(`${SCRIPT_NAMESPACE}_danhGia`).value;
                        LUA_CHON.TEXT_BOX = document.getElementById(`${SCRIPT_NAMESPACE}_textBox`).value;

                        GM_setValue('MON_HOC_VALUES', MON_HOC_VALUES);
                        GM_setValue('LUA_CHON', LUA_CHON);
                        GM_setValue('NGANH_OPTIONS', NGANH_OPTIONS);
                        GM_setValue('TY_LE_THAM_GIA_OPTIONS', TY_LE_THAM_GIA_OPTIONS);
                        GM_setValue('DANH_GIA_OPTIONS', DANH_GIA_OPTIONS);

                        alert('Cấu hình đã được lưu!');
                        console.log('Cấu hình mới:', { MON_HOC_VALUES, LUA_CHON });
                    } catch (e) {
                        console.error('Lỗi khi lưu cấu hình:', e);
                        alert('Lỗi khi lưu cấu hình: ' + e.message);
                    }
                });

                document.getElementById(`${SCRIPT_NAMESPACE}_startProcess`).addEventListener('click', function() {
                    try {
                        currentValueIndex = 0;
                        currentOptionForSameCode = 0;
                        matchingOptions = [];
                        processedCourses.clear();
                        completedVariantCount = 0;
                        allProcessed = false;
                        loopThroughValues();
                    } catch (e) {
                        console.error('Lỗi khi bắt đầu quy trình:', e);
                        alert('Lỗi khi bắt đầu quy trình: ' + e.message);
                    }
                });

                document.getElementById(`${SCRIPT_NAMESPACE}_selectAndSubmit`).addEventListener('click', function() {
                    try {
                        selectAllRatHaiLongAndSubmit();
                    } catch (e) {
                        console.error('Lỗi khi chọn và submit:', e);
                        alert('Lỗi khi chọn và submit: ' + e.message);
                    }
                });
                console.log('Menu cấu hình đã được tạo thành công!');
            } catch (e) {
                console.error('Lỗi khi tạo menu cấu hình:', e);
                alert('Lỗi khi tạo menu cấu hình: ' + e.message);
            }
        }

        // Fix for MutationObserver conflict
        const waitForPageLoad = function() {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(createConfigMenu, 1000); // Delay to ensure DOM is fully loaded
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(createConfigMenu, 1000);
                });
            }
        };
        waitForPageLoad();
    } catch (mainError) {
        console.error('Lỗi chính trong script:', mainError);
        alert('Script gặp lỗi: ' + mainError.message);
    }
})();
