// Khởi tạo giá trị mặc định khi extension được cài đặt
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('Extension đã được cài đặt/cập nhật, lý do:', details.reason);
    
    if (details.reason === "install") {
        const defaultValues = {
            'MON_HOC_VALUES': [
                "22425_192",
                "22425_043C",
                "22425_040C",
                "22425_006C"
            ],
            'LUA_CHON': {
                NGANH: "Công nghệ Thông tin",
                TY_LE_THAM_GIA: ">90 %",
                DANH_GIA: "Rất hài lòng",
                TEXT_BOX: "Hài lòng"
            },
            'NGANH_OPTIONS': [
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
            'TY_LE_THAM_GIA_OPTIONS': [
                "<50%",
                "50% - 70%",
                "70% - 90%",
                ">90 %"
            ],
            'DANH_GIA_OPTIONS': [
                "Rất không hài lòng",
                "Không hài lòng",
                "Phân vân",
                "Hài lòng",
                "Rất hài lòng"
            ]
        };

        chrome.storage.local.set(defaultValues, function() {
            if (chrome.runtime.lastError) {
                console.error('Lỗi khi khởi tạo giá trị mặc định:', chrome.runtime.lastError);
            } else {
                console.log('Đã khởi tạo giá trị mặc định cho extension.');
            }
        });
    }
});

// Lắng nghe tin nhắn từ content script hoặc popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Đã nhận tin nhắn:', request);
    
    if (request.action === "log") {
        console.log('[Content Script]', request.message);
        sendResponse({status: "Đã ghi nhận log"});
    }
    
    if (request.action === "checkStorage") {
        chrome.storage.local.get(null, function(data) {
            if (chrome.runtime.lastError) {
                console.error('Lỗi khi đọc storage:', chrome.runtime.lastError);
                sendResponse({status: "error", message: chrome.runtime.lastError.message});
            } else {
                console.log('Dữ liệu trong storage:', data);
                sendResponse({status: "success", data: data});
            }
        });
        return true; // Giữ kết nối để sendResponse không đóng
    }
    
    return true;
});