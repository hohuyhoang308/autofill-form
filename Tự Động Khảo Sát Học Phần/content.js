'use strict';

// Prevent conflicts with other scripts
const SCRIPT_NAMESPACE = 'hohuyhoang308_autofill';

// Các biến cấu hình
let MON_HOC_VALUES = [];
let LUA_CHON = {
    NGANH: '',
    TY_LE_THAM_GIA: '',
    DANH_GIA: '',
    TEXT_BOX: ''
};

let NGANH_OPTIONS = [
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
];

let TY_LE_THAM_GIA_OPTIONS = [
    "<50%",
    "50% - 70%",
    "70% - 90%",
    ">90 %"
];

let DANH_GIA_OPTIONS = [
    "Rất không hài lòng",
    "Không hài lòng",
    "Phân vân",
    "Hài lòng",
    "Rất hài lòng"
];

const DELAY = {
    CLICK_RADIO: 50,
    SUBMIT_FORM: 1000,
    NEXT_FORM: 2000,
    LOAD_LISTBOX: 500,
    LOAD_ELEMENTS: 1000,
    RETRY: 500
};

// Biến theo dõi
let currentValueIndex = 0;
let currentOptionForSameCode = 0;
let matchingOptions = [];
let processedCourses = new Set();
let completedVariantCount = 0;
let allProcessed = false;

// Hàm logMessage để log ra console với timestamp
function logMessage(message, isError = false) {
    const timestamp = new Date().toLocaleTimeString();
    if (isError) {
        console.error(`[${timestamp}] [Content.js ERROR] ${message}`);
    } else {
        console.log(`[${timestamp}] [Content.js] ${message}`);
    }
}

// Đọc cấu hình từ chrome.storage.local
function loadConfig(callback) {
    chrome.storage.local.get([
        'MON_HOC_VALUES', 
        'LUA_CHON', 
        'NGANH_OPTIONS', 
        'TY_LE_THAM_GIA_OPTIONS', 
        'DANH_GIA_OPTIONS'
    ], function(result) {
        if (chrome.runtime.lastError) {
            logMessage('Lỗi khi tải cấu hình: ' + chrome.runtime.lastError.message, true);
            if (callback) callback(false);
            return;
        }
        
        if (!result || Object.keys(result).length === 0) {
            logMessage('Không tìm thấy cấu hình trong storage', true);
            if (callback) callback(false);
            return;
        }
        
        logMessage('Đã tải cấu hình từ storage');
        
        // Cập nhật cấu hình
        if (result.MON_HOC_VALUES && Array.isArray(result.MON_HOC_VALUES)) {
            MON_HOC_VALUES = result.MON_HOC_VALUES;
        }
        
        if (result.LUA_CHON) {
            LUA_CHON = result.LUA_CHON;
        }
        
        if (result.NGANH_OPTIONS && Array.isArray(result.NGANH_OPTIONS)) {
            NGANH_OPTIONS = result.NGANH_OPTIONS;
        }
        
        if (result.TY_LE_THAM_GIA_OPTIONS && Array.isArray(result.TY_LE_THAM_GIA_OPTIONS)) {
            TY_LE_THAM_GIA_OPTIONS = result.TY_LE_THAM_GIA_OPTIONS;
        }
        
        if (result.DANH_GIA_OPTIONS && Array.isArray(result.DANH_GIA_OPTIONS)) {
            DANH_GIA_OPTIONS = result.DANH_GIA_OPTIONS;
        }
        
        logMessage('Cấu hình hiện tại:', false);
        logMessage('- Mã môn học: ' + MON_HOC_VALUES.join(', '), false);
        logMessage('- Ngành: ' + LUA_CHON.NGANH, false);
        logMessage('- Tỷ lệ tham gia: ' + LUA_CHON.TY_LE_THAM_GIA, false);
        logMessage('- Đánh giá: ' + LUA_CHON.DANH_GIA, false);
        logMessage('- Text box: ' + LUA_CHON.TEXT_BOX, false);
        
        createConfigMenu();
        
        if (callback) callback(true);
    });
}

// Tạo menu cấu hình
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
                    <button id="${SCRIPT_NAMESPACE}_nextForm">Form tiếp theo</button>
                    <button id="${SCRIPT_NAMESPACE}_stopProcess">Dừng quy trình</button>
                    <button id="${SCRIPT_NAMESPACE}_resetProcess">Reset quy trình</button>

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

        // Xử lý sự kiện
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

                chrome.storage.local.set({
                    MON_HOC_VALUES: MON_HOC_VALUES,
                    LUA_CHON: LUA_CHON,
                    NGANH_OPTIONS: NGANH_OPTIONS,
                    TY_LE_THAM_GIA_OPTIONS: TY_LE_THAM_GIA_OPTIONS,
                    DANH_GIA_OPTIONS: DANH_GIA_OPTIONS
                }, function() {
                    alert('Cấu hình đã được lưu!');
                    logMessage('Cấu hình mới đã lưu:', false);
                    logMessage('- Mã môn học: ' + MON_HOC_VALUES.join(', '), false);
                    logMessage('- Ngành: ' + LUA_CHON.NGANH, false);
                    logMessage('- Tỷ lệ tham gia: ' + LUA_CHON.TY_LE_THAM_GIA, false);
                    logMessage('- Đánh giá: ' + LUA_CHON.DANH_GIA, false);
                    logMessage('- Text box: ' + LUA_CHON.TEXT_BOX, false);
                });
            } catch (e) {
                logMessage('Lỗi khi lưu cấu hình: ' + e.message, true);
                alert('Lỗi khi lưu cấu hình: ' + e.message);
            }
        });

        document.getElementById(`${SCRIPT_NAMESPACE}_startProcess`).addEventListener('click', function() {
            try {
                startProcess();
            } catch (e) {
                logMessage('Lỗi khi bắt đầu quy trình: ' + e.message, true);
                alert('Lỗi khi bắt đầu quy trình: ' + e.message);
            }
        });

        document.getElementById(`${SCRIPT_NAMESPACE}_selectAndSubmit`).addEventListener('click', function() {
            try {
                selectAllRatHaiLongAndSubmit();
            } catch (e) {
                logMessage('Lỗi khi chọn và submit: ' + e.message, true);
                alert('Lỗi khi chọn và submit: ' + e.message);
            }
        });

        document.getElementById(`${SCRIPT_NAMESPACE}_nextForm`).addEventListener('click', function() {
            try {
                const submitAnotherButton = document.querySelector('span[data-automation-id="submitAnother"]');
                if (submitAnotherButton) {
                    logMessage("Đang click nút Submit another response");
                    submitAnotherButton.click();
                } else {
                    logMessage("Không tìm thấy nút Submit another response");
                }
            } catch (e) {
                logMessage('Lỗi khi chuyển form: ' + e.message, true);
                alert('Lỗi khi chuyển form: ' + e.message);
            }
        });

        document.getElementById(`${SCRIPT_NAMESPACE}_stopProcess`).addEventListener('click', function() {
            try {
                allProcessed = true;
                logMessage("Đã dừng quy trình tự động điền");
                alert("Đã dừng quy trình tự động điền");
            } catch (e) {
                logMessage('Lỗi khi dừng quy trình: ' + e.message, true);
                alert('Lỗi khi dừng quy trình: ' + e.message);
            }
        });

        document.getElementById(`${SCRIPT_NAMESPACE}_resetProcess`).addEventListener('click', function() {
            try {
                currentValueIndex = 0;
                currentOptionForSameCode = 0;
                matchingOptions = [];
                processedCourses.clear();
                completedVariantCount = 0;
                allProcessed = false;
                logMessage("Đã reset quy trình tự động điền");
                alert("Đã reset quy trình tự động điền");
            } catch (e) {
                logMessage('Lỗi khi reset quy trình: ' + e.message, true);
                alert('Lỗi khi reset quy trình: ' + e.message);
            }
        });

        logMessage('Menu cấu hình đã được tạo thành công!');
    } catch (e) {
        logMessage('Lỗi khi tạo menu cấu hình: ' + e.message, true);
        alert('Lỗi khi tạo menu cấu hình: ' + e.message);
    }
}

// Khởi tạo quá trình và tải lại cấu hình mới nhất trước khi bắt đầu
function startProcess() {
    // Reset biến theo dõi
    currentValueIndex = 0;
    currentOptionForSameCode = 0;
    matchingOptions = [];
    processedCourses.clear();
    completedVariantCount = 0;
    allProcessed = false;
    
    // Tải lại cấu hình mới nhất trước khi bắt đầu
    loadConfig(function(success) {
        if (success) {
            logMessage("Đã tải lại cấu hình mới nhất");
            loopThroughValues();
        } else {
            logMessage("Không thể tải cấu hình. Quy trình không thể bắt đầu.", true);
            alert("Không thể tải cấu hình. Quy trình không thể bắt đầu.");
        }
    });
}

// Hàm chọn và submit
function selectAllRatHaiLongAndSubmit() {
    logMessage(`Bắt đầu chọn tất cả '${LUA_CHON.DANH_GIA}'`);
    const radioInputs = document.querySelectorAll('input[role="radio"]');
    let foundDanhGia = false;

    // Ánh xạ aria-posinset từ 1 đến 5 với DANH_GIA_OPTIONS
    const posInSetMap = {};
    DANH_GIA_OPTIONS.forEach((option, index) => {
        posInSetMap[index + 1] = option;
    });

    radioInputs.forEach(radio => {
        try {
            const posInSet = parseInt(radio.getAttribute('aria-posinset'));
            if (posInSet && posInSetMap[posInSet] === LUA_CHON.DANH_GIA) {
                radio.click();
                foundDanhGia = true;
                logMessage(`Đã chọn Đánh giá: ${LUA_CHON.DANH_GIA} tại aria-posinset ${posInSet}`);
            }
        } catch (e) {
            logMessage('Lỗi khi xử lý radio input: ' + e.message, true);
        }
    });

    if (!foundDanhGia) {
        logMessage(`Không tìm thấy tùy chọn '${LUA_CHON.DANH_GIA}' dựa trên aria-posinset`, true);
        return;
    }

    try {
        const inputElement = document.querySelector('input[aria-label="Single line text"]');
        if (inputElement) {
            inputElement.value = LUA_CHON.TEXT_BOX;
            const event = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(event);
            logMessage(`Đã điền text box với giá trị: ${LUA_CHON.TEXT_BOX}`);
        }
    } catch (e) {
        logMessage('Lỗi khi điền text box: ' + e.message, true);
    }

    setTimeout(function() {
        try {
            const submitButton = document.querySelector('button[data-automation-id="submitButton"]');
            if (submitButton) {
                logMessage("Đang click nút Submit");
                submitButton.click();

                completedVariantCount++;

                let moveToNextCode = false;

                if (matchingOptions.length > 0 && currentOptionForSameCode < matchingOptions.length - 1) {
                    currentOptionForSameCode++;
                    logMessage(`Chuyển sang tùy chọn tiếp theo (${currentOptionForSameCode + 1}/${matchingOptions.length}) cho mã ${MON_HOC_VALUES[currentValueIndex]}`);
                } else {
                    const currentCode = MON_HOC_VALUES[currentValueIndex];
                    processedCourses.add(currentCode);
                    logMessage(`Đã hoàn thành tất cả biến thể của mã: ${currentCode}`);
                    logMessage(`Đã xử lý ${processedCourses.size}/${MON_HOC_VALUES.length} mã môn học`);

                    currentValueIndex = (currentValueIndex + 1) % MON_HOC_VALUES.length;
                    currentOptionForSameCode = 0;
                    matchingOptions = [];
                    moveToNextCode = true;

                    if (processedCourses.size >= MON_HOC_VALUES.length) {
                        allProcessed = true;
                        logMessage("============================================");
                        logMessage(`ĐÃ HOÀN THÀNH TẤT CẢ ${MON_HOC_VALUES.length} MÃ MÔN HỌC!`);
                        logMessage(`Tổng số biến thể đã xử lý: ${completedVariantCount}`);
                        logMessage("============================================");
                    }
                }

                setTimeout(function() {
                    try {
                        const submitAnotherButton = document.querySelector('span[data-automation-id="submitAnother"]');
                        if (submitAnotherButton && !allProcessed) {
                            logMessage("Đang click nút Submit another response");
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
                                        logMessage("Đã xử lý tất cả mã môn học. Dừng quy trình.");
                                        return;
                                    }
                                }

                                if (!allProcessed) {
                                    logMessage("Form mới đã load, tiếp tục vòng lặp");
                                    loopThroughValues();
                                } else {
                                    logMessage("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
                                }
                            }, DELAY.LOAD_ELEMENTS);
                        } else if (allProcessed) {
                            logMessage("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
                        } else {
                            logMessage("Không tìm thấy nút Submit another response", true);
                        }
                    } catch (e) {
                        logMessage('Lỗi khi xử lý submit another: ' + e.message, true);
                    }
                }, DELAY.NEXT_FORM);
            } else {
                logMessage("Không tìm thấy nút Submit", true);
            }
        } catch (e) {
            logMessage('Lỗi khi xử lý submit: ' + e.message, true);
        }
    }, DELAY.SUBMIT_FORM);
}

// Hàm xử lý từng môn học
function loopThroughValues() {
    try {
        logMessage(`Bắt đầu quy trình với mã môn học: ${MON_HOC_VALUES[currentValueIndex]} (${currentValueIndex + 1}/${MON_HOC_VALUES.length})`);

        var radioButton = document.querySelector(`input[value="${LUA_CHON.NGANH}"]`);
        if (radioButton) {
            logMessage(`Tìm thấy nút radio ${LUA_CHON.NGANH}`);
            radioButton.click();
        } else {
            logMessage(`Không tìm thấy nút radio ${LUA_CHON.NGANH}`, true);
            // Thử tìm radio button bằng label
            const labels = document.querySelectorAll('label');
            let found = false;
            
            for (let i = 0; i < labels.length; i++) {
                if (labels[i].textContent.trim() === LUA_CHON.NGANH) {
                    logMessage(`Tìm thấy label cho ${LUA_CHON.NGANH}, thử click`);
                    labels[i].click();
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                logMessage(`Không thể tìm thấy radio button cho ${LUA_CHON.NGANH} bằng bất kỳ cách nào`, true);
            }
        }

        clickElement('button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]', "Next/Tiếp theo button", function() {
            setTimeout(function() {
                try {
                    var listbox = document.querySelector('div[role="button"][aria-haspopup="listbox"]');
                    if (listbox) {
                        logMessage("Tìm thấy listbox");
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

                                logMessage(`Tìm thấy ${matchingOptions.length} tùy chọn cho mã ${MON_HOC_VALUES[currentValueIndex]}`);

                                if (matchingOptions.length > 0) {
                                    logMessage(`Đã chọn: ${matchingOptions[currentOptionForSameCode].textContent}`);
                                    matchingOptions[currentOptionForSameCode].click();
                                } else {
                                    logMessage(`Không tìm thấy tùy chọn với giá trị: ${MON_HOC_VALUES[currentValueIndex]}`, true);

                                    processedCourses.add(MON_HOC_VALUES[currentValueIndex]);

                                    currentValueIndex = (currentValueIndex + 1) % MON_HOC_VALUES.length;
                                    currentOptionForSameCode = 0;

                                    if (processedCourses.size >= MON_HOC_VALUES.length) {
                                        allProcessed = true;
                                        logMessage("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
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
                                            logMessage("Đã xử lý tất cả mã môn học. Dừng quy trình.");
                                            return;
                                        }
                                    }

                                    setTimeout(loopThroughValues, DELAY.LOAD_ELEMENTS);
                                    return;
                                }

                                setTimeout(function() {
                                    try {
                                        var radioButton = document.querySelector(`input[value="${LUA_CHON.TY_LE_THAM_GIA}"]`);
                                        if (radioButton) {
                                            logMessage(`Tìm thấy nút radio ${LUA_CHON.TY_LE_THAM_GIA}`);
                                            radioButton.click();
                                        } else {
                                            logMessage(`Không tìm thấy nút radio ${LUA_CHON.TY_LE_THAM_GIA}`, true);
                                            
                                            // Thử tìm theo label
                                            const labels = document.querySelectorAll('label');
                                            let found = false;
                                            
                                            for (let i = 0; i < labels.length; i++) {
                                                if (labels[i].textContent.trim() === LUA_CHON.TY_LE_THAM_GIA) {
                                                    logMessage(`Tìm thấy label cho ${LUA_CHON.TY_LE_THAM_GIA}, thử click`);
                                                    labels[i].click();
                                                    found = true;
                                                    break;
                                                }
                                            }
                                            
                                            if (!found) {
                                                logMessage(`Không thể tìm thấy radio button cho ${LUA_CHON.TY_LE_THAM_GIA} bằng bất kỳ cách nào`, true);
                                            }
                                        }
                                        
                                        clickElement('button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]', "Next/Tiếp theo button", function() {
                                            setTimeout(function() {
                                                selectAllRatHaiLongAndSubmit();
                                            }, DELAY.LOAD_ELEMENTS);
                                        });
                                    } catch (e) {
                                        logMessage('Lỗi khi xử lý radio Tỷ lệ tham gia: ' + e.message, true);
                                    }
                                }, DELAY.LOAD_LISTBOX);
                            } catch (e) {
                                logMessage('Lỗi khi xử lý listbox options: ' + e.message, true);
                            }
                        }, DELAY.LOAD_LISTBOX);
                    } else {
                        logMessage("Không tìm thấy listbox", true);
                    }
                } catch (e) {
                    logMessage('Lỗi khi tìm listbox: ' + e.message, true);
                }
            }, DELAY.LOAD_ELEMENTS);
        });
    } catch (e) {
        logMessage('Lỗi trong loopThroughValues: ' + e.message, true);
    }
}

// Hàm click element
function clickElement(selector, elementName, callback) {
    try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            logMessage(`Tìm thấy ${elementName}: ${elements.length} phần tử`);
            elements[0].click();
            if (callback) callback();
        } else {
            logMessage(`Không tìm thấy ${elementName}`, true);
        }
    } catch (e) {
        logMessage(`Lỗi khi click ${elementName}: ` + e.message, true);
    }
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        loadConfig();
    }, 1000);
});

// Cho trường hợp trang đã tải xong
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        loadConfig();
    }, 1000);
}

// Lắng nghe tin nhắn từ popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    logMessage('[Content.js] Nhận lệnh từ popup: ' + request.action);
    
    if (request.action === 'startProcess') {
        // Không reset các biến ở đây, dời vào hàm startProcess
        startProcess();
        logMessage('[Content.js] Bắt đầu quy trình tự động điền!');
        sendResponse('Đã bắt đầu quy trình');
    }
    else if (request.action === 'selectAndSubmit') {
        selectAllRatHaiLongAndSubmit();
        logMessage('[Content.js] Thực hiện chọn & submit!');
        sendResponse('Đã chọn & submit');
    }
    else if (request.action === 'configUpdated') {
        // Khi nhận được thông báo cấu hình đã được cập nhật
        logMessage('[Content.js] Nhận thông báo cấu hình đã được cập nhật!');
        loadConfig(function(success) {
            if (success) {
                logMessage('[Content.js] Đã tải lại cấu hình mới nhất sau khi có thông báo từ popup');
                sendResponse('Đã cập nhật cấu hình thành công');
            } else {
                logMessage('[Content.js] Không thể tải lại cấu hình mới', true);
                sendResponse('Không thể cập nhật cấu hình');
            }
        });
        return true; // Giữ kết nối cho sendResponse bất đồng bộ
    }
});