// Giá trị mặc định cho trường hợp không có dữ liệu
const DEFAULT_VALUES = {
    MON_HOC_VALUES: [
        "22425_192",
        "22425_043C",
        "22425_040C",
        "22425_006C"
    ],
    LUA_CHON: {
        NGANH: "Công nghệ Thông tin",
        TY_LE_THAM_GIA: ">90 %",
        DANH_GIA: "Rất hài lòng",
        TEXT_BOX: "Hài lòng"
    },
    NGANH_OPTIONS: [
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
    ],
    TY_LE_THAM_GIA_OPTIONS: [
        "<50%",
        "50% - 70%",
        "70% - 90%",
        ">90 %"
    ],
    DANH_GIA_OPTIONS: [
        "Rất không hài lòng",
        "Không hài lòng",
        "Phân vân",
        "Hài lòng",
        "Rất hài lòng"
    ]
};

// Hàm in log kèm thông tin
function logInfo(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [Popup] ${message}`);
    if (data) {
        console.log(data);
    }
}

// Hàm in log lỗi kèm thông tin
function logError(message, error = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`[${timestamp}] [Popup ERROR] ${message}`);
    if (error) {
        console.error(error);
    }
}

// Hàm hiển thị thông báo trực tiếp trên popup
function showMessage(message, isError = false) {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = isError ? 'error-message' : 'success-message';
    messageEl.style.display = 'block';
    
    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// Hàm hiển thị cấu hình trên console
function logConfiguration(config) {
    logInfo('===== CẤU HÌNH HIỆN TẠI =====');
    
    // Hiển thị danh sách môn học
    logInfo('MÃ MÔN HỌC:', config.MON_HOC_VALUES);
    
    // Hiển thị các lựa chọn
    logInfo('LỰA CHỌN:', config.LUA_CHON);
    
    // Hiển thị thông tin về các options
    logInfo(`Số lượng ngành: ${config.NGANH_OPTIONS.length}`);
    logInfo(`Số lượng tỷ lệ tham gia: ${config.TY_LE_THAM_GIA_OPTIONS.length}`);
    logInfo(`Số lượng đánh giá: ${config.DANH_GIA_OPTIONS.length}`);
    
    logInfo('==============================');
}

// Hàm lưu cấu hình - tách riêng để dễ gọi
function saveConfiguration() {
    try {
        logInfo('Bắt đầu lưu cấu hình...');
        
        // Lấy các giá trị từ form
        const monHoc = document.getElementById('mon-hoc').value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
            
        const nganh = document.getElementById('nganh').value;
        const tyLe = document.getElementById('ty-le').value;
        const danhGia = document.getElementById('danh-gia').value;
        const textBox = document.getElementById('text-box').value;
        
        // Tạo object lưu trữ
        const configData = {
            MON_HOC_VALUES: monHoc,
            LUA_CHON: {
                NGANH: nganh,
                TY_LE_THAM_GIA: tyLe,
                DANH_GIA: danhGia,
                TEXT_BOX: textBox
            }
        };
        
        // Lấy các options để lưu
        configData.NGANH_OPTIONS = Array.from(document.getElementById('nganh').options).map(opt => opt.value);
        configData.TY_LE_THAM_GIA_OPTIONS = Array.from(document.getElementById('ty-le').options).map(opt => opt.value);
        configData.DANH_GIA_OPTIONS = Array.from(document.getElementById('danh-gia').options).map(opt => opt.value);
        
        // In cấu hình đang lưu ra console
        logInfo('Cấu hình đang được lưu:');
        logConfiguration(configData);
        
        // Lưu vào storage
        chrome.storage.local.set(configData, function() {
            // Kiểm tra lỗi
            if (chrome.runtime.lastError) {
                const errorMsg = chrome.runtime.lastError.message;
                logError('Lỗi khi lưu cấu hình:', errorMsg);
                showMessage('Lỗi khi lưu: ' + errorMsg, true);
                return;
            }
            
            // Hiển thị thông báo thành công
            logInfo('Đã lưu cấu hình thành công!');
            showMessage('Đã lưu cấu hình thành công!');
            
            // Đổi màu nút save
            const saveBtn = document.getElementById('save-btn');
            saveBtn.textContent = 'Đã lưu!';
            saveBtn.style.backgroundColor = '#28a745';
            
            // Quay lại trạng thái ban đầu sau 1.5 giây
            setTimeout(function() {
                saveBtn.textContent = 'Lưu cấu hình';
                saveBtn.style.backgroundColor = '#007bff';
            }, 1500);
            
            // Thông báo cho content script (nếu đang mở) để cập nhật cấu hình
            notifyContentScript('configUpdated');
        });
    } catch (error) {
        logError('Lỗi trong quá trình lưu cấu hình:', error);
        showMessage('Lỗi: ' + error.message, true);
    }
}

// Thông báo cho content script biết cấu hình đã thay đổi
function notifyContentScript(action) {
    try {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]) {
                logInfo('Không tìm thấy tab hoạt động để thông báo cập nhật cấu hình');
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, {action: action}, function(response) {
                if (chrome.runtime.lastError) {
                    // Có thể content script chưa được tải hoặc trang không tương thích
                    logInfo('Không gửi được thông báo đến content script:', chrome.runtime.lastError.message);
                    return;
                }
                
                logInfo('Đã thông báo cho content script về cấu hình mới:', response);
            });
        });
    } catch (error) {
        logError('Lỗi khi thông báo cho content script:', error);
    }
}

// Hàm điền tùy chọn vào select boxes
function fillSelectOptions(selectId, options, selectedValue) {
    const select = document.getElementById(selectId);
    if (!select) {
        logError(`Không tìm thấy select với id "${selectId}"`);
        return;
    }
    
    select.innerHTML = '';
    
    // Sử dụng các options mặc định nếu không có options hoặc options không hợp lệ
    let optionsToUse = options && Array.isArray(options) && options.length > 0 
        ? options 
        : DEFAULT_VALUES[selectId.toUpperCase() + '_OPTIONS'] || [];
    
    if (optionsToUse.length === 0) {
        logError(`Không có options cho select "${selectId}"`);
        return;
    }
    
    // Sử dụng giá trị mặc định nếu không có selectedValue
    let valueToSelect = selectedValue;
    if (!valueToSelect) {
        if (selectId === 'nganh') valueToSelect = DEFAULT_VALUES.LUA_CHON.NGANH;
        else if (selectId === 'ty-le') valueToSelect = DEFAULT_VALUES.LUA_CHON.TY_LE_THAM_GIA;
        else if (selectId === 'danh-gia') valueToSelect = DEFAULT_VALUES.LUA_CHON.DANH_GIA;
    }
    
    // Điền các options vào select
    optionsToUse.forEach(function(option) {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        
        if (option === valueToSelect) {
            optionElement.selected = true;
        }
        
        select.appendChild(optionElement);
    });
    
    logInfo(`Đã điền ${optionsToUse.length} tùy chọn vào "${selectId}". Giá trị được chọn: "${valueToSelect}"`);
}

// Hàm gửi lệnh tới content script
function sendCommand(action) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0]) {
            logError('Không tìm thấy tab đang hoạt động');
            showMessage('Không tìm thấy tab đang hoạt động', true);
            return;
        }
        
        logInfo(`Đang gửi lệnh "${action}" tới content script...`);
        
        chrome.tabs.sendMessage(tabs[0].id, {action: action}, function(response) {
            if (chrome.runtime.lastError) {
                const errorMsg = 'Lỗi khi gửi lệnh: ' + chrome.runtime.lastError.message;
                logError(errorMsg);
                showMessage(errorMsg, true);
                return;
            }
            
            logInfo(`Đã gửi lệnh "${action}" thành công. Phản hồi:`, response);
            showMessage(`Đã gửi lệnh ${action}`);
        });
    });
}

// Khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    logInfo('DOM Content Loaded - Khởi tạo popup');
    
    // Hiển thị thông báo đang tải
    showMessage('Đang tải cấu hình...');
    
    // Nạp dữ liệu từ storage
    chrome.storage.local.get(null, function(result) {
        if (chrome.runtime.lastError) {
            const errorMsg = chrome.runtime.lastError.message;
            logError('Lỗi khi tải cấu hình:', errorMsg);
            showMessage('Lỗi khi tải cấu hình: ' + errorMsg, true);
            
            // Sử dụng giá trị mặc định nếu có lỗi
            loadDefaultValues();
            return;
        }
        
        // Kiểm tra xem có dữ liệu không
        if (!result || Object.keys(result).length === 0) {
            logInfo('Không có dữ liệu trong storage, sử dụng giá trị mặc định');
            loadDefaultValues();
            return;
        }
        
        // Hiển thị cấu hình đã tải lên console
        logInfo('Đã tải cấu hình từ storage:');
        logConfiguration(result);
        
        // Điền các giá trị từ storage
        
        // Điền danh sách môn học
        if (result.MON_HOC_VALUES && Array.isArray(result.MON_HOC_VALUES)) {
            document.getElementById('mon-hoc').value = result.MON_HOC_VALUES.join('\n');
        } else {
            document.getElementById('mon-hoc').value = DEFAULT_VALUES.MON_HOC_VALUES.join('\n');
        }
        
        // Điền text box
        if (result.LUA_CHON && result.LUA_CHON.TEXT_BOX) {
            document.getElementById('text-box').value = result.LUA_CHON.TEXT_BOX;
        } else {
            document.getElementById('text-box').value = DEFAULT_VALUES.LUA_CHON.TEXT_BOX;
        }
        
        // Điền các select box
        const nganhValue = result.LUA_CHON ? result.LUA_CHON.NGANH : DEFAULT_VALUES.LUA_CHON.NGANH;
        const tyLeValue = result.LUA_CHON ? result.LUA_CHON.TY_LE_THAM_GIA : DEFAULT_VALUES.LUA_CHON.TY_LE_THAM_GIA;
        const danhGiaValue = result.LUA_CHON ? result.LUA_CHON.DANH_GIA : DEFAULT_VALUES.LUA_CHON.DANH_GIA;
        
        fillSelectOptions('nganh', result.NGANH_OPTIONS, nganhValue);
        fillSelectOptions('ty-le', result.TY_LE_THAM_GIA_OPTIONS, tyLeValue);
        fillSelectOptions('danh-gia', result.DANH_GIA_OPTIONS, danhGiaValue);
        
        showMessage('Đã tải cấu hình thành công!');
    });
    
    // Hàm tải giá trị mặc định
    function loadDefaultValues() {
        document.getElementById('mon-hoc').value = DEFAULT_VALUES.MON_HOC_VALUES.join('\n');
        document.getElementById('text-box').value = DEFAULT_VALUES.LUA_CHON.TEXT_BOX;
        
        fillSelectOptions('nganh', DEFAULT_VALUES.NGANH_OPTIONS, DEFAULT_VALUES.LUA_CHON.NGANH);
        fillSelectOptions('ty-le', DEFAULT_VALUES.TY_LE_THAM_GIA_OPTIONS, DEFAULT_VALUES.LUA_CHON.TY_LE_THAM_GIA);
        fillSelectOptions('danh-gia', DEFAULT_VALUES.DANH_GIA_OPTIONS, DEFAULT_VALUES.LUA_CHON.DANH_GIA);
        
        showMessage('Đã tải giá trị mặc định!');
    }
    
    // Đăng ký sự kiện cho các nút
    document.getElementById('save-btn').addEventListener('click', saveConfiguration);
    
    document.getElementById('start-btn').addEventListener('click', function() {
        sendCommand('startProcess');
    });
    
    document.getElementById('select-submit-btn').addEventListener('click', function() {
        sendCommand('selectAndSubmit');
    });
    
    logInfo('Popup khởi tạo hoàn tất');
});