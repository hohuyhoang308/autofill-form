// content.js - Script chính chạy trên trang

(async function() {
  'use strict';

  console.log('Auto-fill Extension đã được load!');

  try {
    // Load config từ storage
    const config = await StorageManager.getConfig();
    
    // Khởi tạo form handler
    const formHandler = new FormHandler(config);

    // Gửi message cho background script biết content script đã load
    chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_LOADED' });
    
    // Lắng nghe messages từ popup hoặc background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'START_AUTOFILL':
          formHandler.start();
          sendResponse({ success: true });
          break;
          
        case 'STOP_AUTOFILL':
          formHandler.allProcessed = true;
          sendResponse({ success: true });
          break;
          
        case 'GET_PROGRESS':
          sendResponse({
            processed: formHandler.processedCourses.size,
            total: config.MON_HOC_VALUES.length,
            completedVariants: formHandler.completedVariantCount
          });
          break;
          
        case 'UPDATE_CONFIG':
          console.log('📥 Nhận được cấu hình mới từ popup:', request.config);
          
          // Sử dụng config mới từ popup ngay lập tức
          if (request.config) {
            console.log('🔄 Cập nhật config ngay lập tức từ popup...');
            
            // Cập nhật config hiện tại với dữ liệu mới
            Object.assign(config, request.config);
            
            // Đảm bảo formHandler.config được cập nhật với reference mới
            formHandler.config = config;
            
            console.log('✅ Config đã được cập nhật thành công!');
            console.log('📝 Danh sách mã môn học:', config.MON_HOC_VALUES);
            console.log('🎓 Ngành:', config.LUA_CHON.NGANH);
            console.log('📊 Tỷ lệ tham gia:', config.LUA_CHON.TY_LE_THAM_GIA);
            console.log('⭐ Đánh giá:', config.LUA_CHON.DANH_GIA);
            console.log('📄 Text:', config.LUA_CHON.TEXT_BOX);
            console.log('🔄 formHandler.config đã được đồng bộ:', formHandler.config === config);
          } else {
            console.log('⚠️ Không có config trong request, reload từ storage...');
            // Fallback: reload từ storage
            StorageManager.getConfig().then(newConfig => {
              console.log('🔄 Reload config từ storage:', newConfig);
              Object.assign(config, newConfig);
              formHandler.config = config;
              console.log('🔄 formHandler.config đã được đồng bộ từ storage:', formHandler.config === config);
            }).catch(error => {
              console.error('❌ Lỗi khi reload config từ storage:', error);
            });
          }
          
          sendResponse({ success: true });
          break;
          
        case 'RESET_PROGRESS':
          formHandler.reset().then(() => {
            sendResponse({ success: true });
          });
          return true; // Giữ kết nối để chờ response
          
        case 'PING':
          sendResponse({ active: true });
          break;
      }
    });
    
  } catch (error) {
    console.error('Lỗi khởi tạo extension:', error);
  }
})();
