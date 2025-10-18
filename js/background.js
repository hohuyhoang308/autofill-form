// background.js - Service worker

let activeFormsTabId = null; // Biến để lưu trữ tabId của trang forms.office.com đang hoạt động

chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto-fill Extension đã được cài đặt!');
  
  // Khởi tạo config mặc định nếu chưa có
  chrome.storage.local.get(['config'], (result) => {
    if (!result.config) {
      chrome.storage.local.set({ 
        config: {
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
        }
      });
    }
  });
});

// Xử lý messages từ content script và popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'CONTENT_SCRIPT_LOADED':
      if (sender.tab && sender.tab.url.includes('forms.office.com')) {
        activeFormsTabId = sender.tab.id;
        console.log(`Content script loaded on forms.office.com in tab: ${activeFormsTabId}`);
      }
      break;

    case 'GET_CONNECTION_STATUS':
      sendResponse({ isConnected: activeFormsTabId !== null });
      break;

    case 'START_AUTOFILL':
      if (activeFormsTabId) {
        chrome.tabs.sendMessage(activeFormsTabId, { type: 'START_AUTOFILL' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Lỗi khi gửi START_AUTOFILL đến content script:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response || { success: true });
          }
        });
        return true; // Giữ kết nối để chờ response
      } else {
        sendResponse({ success: false, error: 'Chưa kết nối với forms.office.com' });
      }
      break;

    case 'STOP_AUTOFILL':
      if (activeFormsTabId) {
        chrome.tabs.sendMessage(activeFormsTabId, { type: 'STOP_AUTOFILL' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Lỗi khi gửi STOP_AUTOFILL đến content script:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response || { success: true });
          }
        });
        return true; // Giữ kết nối để chờ response
      } else {
        sendResponse({ success: false, error: 'Chưa kết nối với forms.office.com' });
      }
      break;

    case 'GET_PROGRESS':
      if (activeFormsTabId) {
        chrome.tabs.sendMessage(activeFormsTabId, { type: 'GET_PROGRESS' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Lỗi khi gửi GET_PROGRESS đến content script:', chrome.runtime.lastError);
            sendResponse({ processed: 0, total: 0, completedVariants: 0 });
          } else {
            sendResponse(response || { processed: 0, total: 0, completedVariants: 0 });
          }
        });
        return true; // Giữ kết nối để chờ response
      } else {
        sendResponse({ processed: 0, total: 0, completedVariants: 0 });
      }
      break;


    case 'RESET_PROGRESS':
      if (activeFormsTabId) {
        chrome.tabs.sendMessage(activeFormsTabId, { type: 'RESET_PROGRESS' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Lỗi khi gửi RESET_PROGRESS đến content script:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response || { success: true });
          }
        });
        return true; // Giữ kết nối để chờ response
      } else {
        sendResponse({ success: false, error: 'Chưa kết nối với forms.office.com' });
      }
      break;

    case 'PING_CONTENT_SCRIPT':
      if (activeFormsTabId) {
        chrome.tabs.sendMessage(activeFormsTabId, { type: 'PING' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script không phản hồi:', chrome.runtime.lastError.message);
            sendResponse({ active: false });
          } else {
            sendResponse({ active: true });
          }
        });
        return true; // Giữ kết nối để chờ response
      } else {
        sendResponse({ active: false });
      }
      break;

    case 'COMPLETION':
      // Hiển thị notification khi hoàn thành
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Auto-fill hoàn thành!',
        message: `Đã xử lý xong ${request.data.totalCourses} mã môn học với tổng ${request.data.totalVariants} biến thể.`,
        priority: 2
      });
      break;
  }
});

// Xử lý khi tab được cập nhật hoặc đóng
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (activeFormsTabId === tabId && !tab.url.includes('forms.office.com')) {
    activeFormsTabId = null; // Reset nếu tab không còn là forms.office.com
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeFormsTabId === tabId) {
    activeFormsTabId = null; // Reset nếu tab bị đóng
  }
});

// Debug log handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DEBUG_LOG') {
    console.log('🔍 [BACKGROUND] Debug from popup:', request.message);
    sendResponse({ received: true });
  }
});

// Xử lý khi click vào extension icon
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('forms.office.com')) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_MENU' });
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Lưu ý',
      message: 'Extension này chỉ hoạt động trên trang forms.office.com',
      priority: 1
    });
  }
});
