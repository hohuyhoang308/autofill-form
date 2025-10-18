// Popup script với đầy đủ tính năng cấu hình

// Cấu hình mặc định - Copy từ constants.js
const DEFAULT_CONFIG = {
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
    "Công nghệ Thông tin", "Luật", "Luật Kinh tế", "Kế toán", "Tài chính Ngân hàng",
    "Marketing", "Thương mại điện tử", "Quản trị Kinh doanh", "Ngôn ngữ Anh", "Ngôn ngữ Nhật",
    "Ngôn ngữ Trung Quốc", "Quản trị Dịch vụ du lịch và Lữ hành", "Quản trị Khách sạn",
    "Quản lý Bệnh viện", "Công nghệ Tài chính", "Ngôn ngữ Hàn Quốc", "Kỹ thuật Máy tính",
    "Kinh tế Quốc tế", "Tâm Lý Học"
  ],
  
  TY_LE_THAM_GIA_OPTIONS: ["<50%", "50% - 70%", "70% - 90%", ">90 %"],
  DANH_GIA_OPTIONS: ["Rất không hài lòng", "Không hài lòng", "Phân vân", "Hài lòng", "Rất hài lòng"]
};

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const configToggle = document.getElementById('configToggle');
  const configContent = document.getElementById('configContent');
  const statusBox = document.getElementById('status');
  const progressSection = document.getElementById('progressSection');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  // Form elements
  const monHocValues = document.getElementById('monHocValues');
  const nganh = document.getElementById('nganh');
  const tyLeThamGia = document.getElementById('tyLeThamGia');
  const danhGia = document.getElementById('danhGia');
  const textBox = document.getElementById('textBox');

  function setStatus(text, type) {
    statusBox.textContent = text;
    statusBox.classList.remove('connected', 'error');
    if (type) statusBox.classList.add(type);
  }

  // Toggle config section
  function toggleConfig() {
    const isVisible = configContent.style.display !== 'none';
    const arrow = configToggle.querySelector('.toggle-arrow');
    
    if (isVisible) {
      configContent.style.display = 'none';
      arrow.classList.remove('rotated');
    } else {
      configContent.style.display = 'block';
      arrow.classList.add('rotated');
    }
  }



  // Kiểm tra xem có content script đang hoạt động không
  function checkContentScriptActive(callback) {
    chrome.runtime.sendMessage({ type: 'PING_CONTENT_SCRIPT' }, (response) => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        if (errorMsg.includes('message port closed') || errorMsg.includes('Could not establish connection')) {
          console.log('⚠️ Content script không hoạt động:', errorMsg);
        } else {
          console.log('⚠️ Lỗi khi kiểm tra content script:', errorMsg);
        }
        callback(false);
      } else {
        console.log('✅ Content script đang hoạt động');
        callback(true);
      }
    });
  }

  // Gửi cấu hình đến content script một cách an toàn
  function sendConfigToContentScript(config) {
    console.log('🔄 Đang kiểm tra content script...');
    checkContentScriptActive((isActive) => {
      if (isActive) {
        console.log('📤 Đang gửi cấu hình đến content script...');
        chrome.runtime.sendMessage({ 
          type: 'UPDATE_CONFIG', 
          config: config 
        }, (response) => {
          // Kiểm tra lỗi một cách an toàn
          if (chrome.runtime.lastError) {
            const errorMsg = chrome.runtime.lastError.message;
            if (errorMsg.includes('message port closed')) {
              console.log('⚠️ Content script đã đóng kết nối, nhưng cấu hình đã được gửi');
              console.log('📤 Config đã được đồng bộ với content script:');
              console.log('   📝 Số môn học:', config.MON_HOC_VALUES.length);
              console.log('   🎓 Ngành:', config.LUA_CHON.NGANH);
              console.log('   📊 Tỷ lệ tham gia:', config.LUA_CHON.TY_LE_THAM_GIA);
              console.log('   ⭐ Đánh giá:', config.LUA_CHON.DANH_GIA);
              console.log('   📄 Text:', config.LUA_CHON.TEXT_BOX);
              console.log('🎯 Content script đã nhận được cấu hình mới!');
            } else {
              console.error('❌ Lỗi khi gửi config đến content script:', errorMsg);
            }
          } else {
            console.log('✅ Đã gửi cấu hình đến content script thành công!');
            console.log('📤 Config đã được đồng bộ với content script:');
            console.log('   📝 Số môn học:', config.MON_HOC_VALUES.length);
            console.log('   🎓 Ngành:', config.LUA_CHON.NGANH);
            console.log('   📊 Tỷ lệ tham gia:', config.LUA_CHON.TY_LE_THAM_GIA);
            console.log('   ⭐ Đánh giá:', config.LUA_CHON.DANH_GIA);
            console.log('   📄 Text:', config.LUA_CHON.TEXT_BOX);
            console.log('🎯 Content script đã nhận được cấu hình mới!');
          }
        });
      } else {
        console.log('⚠️ Content script không hoạt động, bỏ qua việc gửi cấu hình');
        console.log('💡 Hãy mở trang forms.office.com để content script hoạt động');
        console.log('📋 Cấu hình vẫn đã được lưu vào storage và sẽ được load khi content script hoạt động');
      }
    });
  }
  function loadConfig() {
    chrome.storage.local.get(['config'], (result) => {
      if (result.config) {
        const config = result.config;
        monHocValues.value = config.MON_HOC_VALUES ? config.MON_HOC_VALUES.join('\n') : '';
        nganh.value = config.LUA_CHON ? config.LUA_CHON.NGANH : '';
        tyLeThamGia.value = config.LUA_CHON ? config.LUA_CHON.TY_LE_THAM_GIA : '';
        danhGia.value = config.LUA_CHON ? config.LUA_CHON.DANH_GIA : '';
        textBox.value = config.LUA_CHON ? config.LUA_CHON.TEXT_BOX : '';
      } else {
        // Nếu không có config, để trống các field
        monHocValues.value = '';
        nganh.value = '';
        tyLeThamGia.value = '';
        danhGia.value = '';
        textBox.value = '';
      }
    });
  }


  // Save config vào storage

  startBtn.addEventListener('click', async () => {
    console.log('🖱️ Click vào nút "Bắt đầu tự động"');
    
    // Kiểm tra và ngăn chặn multiple clicks
    if (startBtn.disabled || startBtn.classList.contains('loading')) {
      console.log('⚠️ Button đang disabled/loading, bỏ qua click');
      return;
    }
    
    // Disable button ngay lập tức để tránh multiple clicks
    startBtn.disabled = true;
    startBtn.classList.add('loading');
    
    // Hiển thị feedback loading
    const originalText = startBtn.innerHTML;
    startBtn.innerHTML = '<span class="icon">⏳</span> Đang khởi động...';
    
    console.log('🚀 Bắt đầu quy trình tự động...');
    
    try {
      // ✅ FIX: Reload config từ storage trước khi bắt đầu để đảm bảo có config mới nhất
      console.log('🔄 Đang reload config từ storage...');
      const freshConfig = await new Promise((resolve) => {
        chrome.storage.local.get(['config'], (result) => {
          resolve(result.config);
        });
      });
      
      if (freshConfig) {
        console.log('✅ Đã reload config mới từ storage:', freshConfig);
        console.log('📝 Danh sách mã môn học:', freshConfig.MON_HOC_VALUES);
        console.log('🎓 Ngành:', freshConfig.LUA_CHON.NGANH);
        console.log('📊 Tỷ lệ tham gia:', freshConfig.LUA_CHON.TY_LE_THAM_GIA);
        console.log('⭐ Đánh giá:', freshConfig.LUA_CHON.DANH_GIA);
        console.log('📄 Text:', freshConfig.LUA_CHON.TEXT_BOX);
        
        // Gửi config mới đến content script để đảm bảo đồng bộ
        setTimeout(() => {
          sendConfigToContentScript(freshConfig);
        }, 100);
      } else {
        console.log('⚠️ Không tìm thấy config trong storage!');
      }
      
      // Gửi message đến content script để bắt đầu tự động điền
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'START_AUTOFILL' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
      
      if (response && response.success) {
        // Thành công
        console.log('✅ Đã khởi động quy trình thành công!');
        setStatus('Đang chạy tự động...', 'connected');
        
        // Hiển thị success feedback
        startBtn.innerHTML = '<span class="icon">✅</span> Đã khởi động!';
        startBtn.classList.add('success');
        
        // Reset trạng thái
    startBtn.disabled = true;
    stopBtn.disabled = false;
    progressSection.style.display = 'block';
        
        // Bắt đầu cập nhật tiến độ
        updateProgressFromContentScript();
        
        // Reset button sau 2 giây
        setTimeout(() => {
          startBtn.innerHTML = originalText;
          startBtn.classList.remove('loading', 'success');
          console.log('✅ Button đã được reset sau thành công');
        }, 2000);
        
      } else {
        throw new Error('Content script không thể khởi động quy trình');
      }
      
    } catch (error) {
      // Lỗi
      console.error('❌ Lỗi khi khởi động quy trình:', error.message);
      setStatus('Lỗi khi bắt đầu tự động điền: ' + error.message, 'error');
      
      // Hiển thị error feedback
      startBtn.innerHTML = '<span class="icon">❌</span> Lỗi khởi động!';
      startBtn.classList.add('error');
      
      // Reset button sau 3 giây
      setTimeout(() => {
        startBtn.innerHTML = originalText;
        startBtn.disabled = false;
        startBtn.classList.remove('loading', 'error');
        console.log('✅ Button đã được reset sau lỗi');
      }, 3000);
    }
  });

  stopBtn.addEventListener('click', async () => {
    console.log('🖱️ Click vào nút "Dừng"');
    
    // Kiểm tra và ngăn chặn multiple clicks
    if (stopBtn.disabled || stopBtn.classList.contains('loading')) {
      console.log('⚠️ Button đang disabled/loading, bỏ qua click');
      return;
    }
    
    // Disable button ngay lập tức để tránh multiple clicks
        stopBtn.disabled = true;
    stopBtn.classList.add('loading');
    
    // Hiển thị feedback loading
    const originalText = stopBtn.innerHTML;
    stopBtn.innerHTML = '<span class="icon">⏳</span> Đang dừng...';
    
    console.log('🛑 Bắt đầu dừng quy trình...');
    
    try {
      // Gửi message đến content script để dừng tự động điền
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'STOP_AUTOFILL' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
      
      // Thành công
      console.log('✅ Đã dừng quy trình thành công!');
    setStatus('Đã dừng', 'error');
      
      // Hiển thị success feedback
      stopBtn.innerHTML = '<span class="icon">✅</span> Đã dừng!';
      stopBtn.classList.add('success');
      
      // Reset trạng thái
    startBtn.disabled = false;
    stopBtn.disabled = true;
      progressSection.style.display = 'none';
      
      // Reset button sau 2 giây
      setTimeout(() => {
        stopBtn.innerHTML = originalText;
        stopBtn.disabled = false;
        stopBtn.classList.remove('loading', 'success');
        console.log('✅ Button đã được reset sau thành công');
      }, 2000);
      
    } catch (error) {
      // Lỗi
      console.error('❌ Lỗi khi dừng quy trình:', error.message);
      setStatus('Lỗi khi dừng tự động điền: ' + error.message, 'error');
      
      // Hiển thị error feedback
      stopBtn.innerHTML = '<span class="icon">❌</span> Lỗi dừng!';
      stopBtn.classList.add('error');
      
      // Reset button sau 3 giây
      setTimeout(() => {
        stopBtn.innerHTML = originalText;
        stopBtn.disabled = false;
        stopBtn.classList.remove('loading', 'error');
        console.log('✅ Button đã được reset sau lỗi');
      }, 3000);
    }
  });

  // Event listeners cho các nút cấu hình
  saveConfigBtn.addEventListener('click', async (event) => {
    event.preventDefault(); // Ngăn popup đóng
    console.log('🖱️ Click vào nút "Lưu cấu hình"');
    
    
    // Kiểm tra và ngăn chặn multiple clicks
    if (saveConfigBtn.disabled || saveConfigBtn.classList.contains('loading')) {
      console.log('⚠️ Button đang disabled/loading, bỏ qua click');
      return;
    }
    
    // Disable button ngay lập tức để tránh multiple clicks
    saveConfigBtn.disabled = true;
    saveConfigBtn.classList.add('loading');
    
    // Hiển thị feedback loading
    const originalText = saveConfigBtn.innerHTML;
    saveConfigBtn.innerHTML = '<span class="icon">⏳</span> Đang lưu...';
    
    console.log('💾 Bắt đầu lưu cấu hình...');
    
     // Load config hiện tại từ storage
     const currentConfig = await new Promise((resolve) => {
       chrome.storage.local.get(['config'], (result) => {
         if (result.config) {
           resolve(result.config);
         } else {
           // Nếu không có config, tạo config mặc định từ storage
           chrome.storage.local.get(['config'], (result) => {
             if (result.config) {
               resolve(result.config);
             } else {
               // Fallback cuối cùng: tạo config mặc định
               const fallbackConfig = {
                 MON_HOC_VALUES: ["22425_192", "22425_043C", "22425_040C", "22425_006C"],
                 LUA_CHON: {
                   NGANH: "Công nghệ Thông tin",
                   TY_LE_THAM_GIA: ">90 %",
                   DANH_GIA: "Rất hài lòng",
                   TEXT_BOX: "Hài lòng"
                 },
                 NGANH_OPTIONS: [
                   "Công nghệ Thông tin", "Luật", "Luật Kinh tế", "Kế toán", "Tài chính Ngân hàng",
                   "Marketing", "Thương mại điện tử", "Quản trị Kinh doanh", "Ngôn ngữ Anh", "Ngôn ngữ Nhật",
                   "Ngôn ngữ Trung Quốc", "Quản trị Dịch vụ du lịch và Lữ hành", "Quản trị Khách sạn",
                   "Quản lý Bệnh viện", "Công nghệ Tài chính", "Ngôn ngữ Hàn Quốc", "Kỹ thuật Máy tính",
                   "Kinh tế Quốc tế", "Tâm Lý Học"
                 ],
                 TY_LE_THAM_GIA_OPTIONS: ["<50%", "50% - 70%", "70% - 90%", ">90 %"],
                 DANH_GIA_OPTIONS: ["Rất không hài lòng", "Không hài lòng", "Phân vân", "Hài lòng", "Rất hài lòng"]
               };
               resolve(fallbackConfig);
             }
           });
         }
       });
     });
     
     // Cập nhật config hiện tại với dữ liệu từ form
     currentConfig.MON_HOC_VALUES = monHocValues.value.split('\n').map(item => item.trim()).filter(item => item);
     currentConfig.LUA_CHON.NGANH = nganh.value;
     currentConfig.LUA_CHON.TY_LE_THAM_GIA = tyLeThamGia.value;
     currentConfig.LUA_CHON.DANH_GIA = danhGia.value;
     currentConfig.LUA_CHON.TEXT_BOX = textBox.value;

     // Lưu config
     await new Promise((resolve, reject) => {
       chrome.storage.local.set({ config: currentConfig }, () => {
         if (chrome.runtime.lastError) {
           reject(new Error(chrome.runtime.lastError.message));
         } else {
           resolve(true);
         }
       });
     });
     
     // Thành công
     console.log('Cấu hình mới:', currentConfig);
     setStatus('✅ Cấu hình đã được lưu!', 'connected');
     
     // Enable nút Bắt đầu tự động sau khi lưu config thành công
     startBtn.disabled = false;
     console.log('✅ Đã enable nút "Bắt đầu tự động"');
     
     // Reload config từ storage để đảm bảo UI được cập nhật
     loadConfig();
     
     // Gửi config đến content script để cập nhật formHandler.config ngay lập tức
     setTimeout(() => {
       sendConfigToContentScript(currentConfig);
     }, 100);
     
     // Hiển thị success feedback
     saveConfigBtn.innerHTML = '<span class="icon">✅</span> Đã lưu!';
     saveConfigBtn.classList.add('success');
     
     // Reset button sau 2 giây
     setTimeout(() => {
       saveConfigBtn.innerHTML = originalText;
       saveConfigBtn.disabled = false;
       saveConfigBtn.classList.remove('loading', 'success');
       console.log('✅ Button đã được reset sau thành công');
     }, 2000);
  });


  resetBtn.addEventListener('click', async () => {
    console.log('🖱️ Click vào nút "Reset"');
    
    // Reset ngay lập tức không cần confirm
      // Disable button ngay lập tức
      resetBtn.disabled = true;
      resetBtn.classList.add('loading');
      
      // Hiển thị feedback loading
      const originalText = resetBtn.innerHTML;
      resetBtn.innerHTML = '<span class="icon">⏳</span> Đang reset...';
      
      console.log('🔄 Bắt đầu reset tiến trình...');
      
      try {
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: 'RESET_PROGRESS' }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        // Thành công
        console.log('✅ Reset tiến trình thành công');
        setStatus('🔄 Đã reset tiến trình', 'connected');
        progressSection.style.display = 'none';
        
        // Hiển thị success feedback
        resetBtn.innerHTML = '<span class="icon">✅</span> Đã reset!';
        resetBtn.classList.add('success');
        
        // Reset button sau 2 giây
        setTimeout(() => {
          resetBtn.innerHTML = originalText;
          resetBtn.disabled = false;
          resetBtn.classList.remove('loading', 'success');
          console.log('✅ Reset button đã được reset sau thành công');
        }, 2000);
        
      } catch (error) {
        // Lỗi
        console.error('❌ Lỗi khi reset tiến trình:', error.message);
        setStatus('❌ Lỗi khi reset tiến trình: ' + error.message, 'error');
        
        // Hiển thị error feedback
        resetBtn.innerHTML = '<span class="icon">❌</span> Lỗi reset!';
        resetBtn.classList.add('error');
        
        // Reset button sau 3 giây
        setTimeout(() => {
          resetBtn.innerHTML = originalText;
          resetBtn.disabled = false;
          resetBtn.classList.remove('loading', 'error');
          console.log('✅ Reset button đã được reset sau lỗi');
        }, 3000);
      }
  });

  // Toggle config section
  configToggle.addEventListener('click', () => {
    toggleConfig();
  });

  // Hàm cập nhật tiến độ từ content script
  function updateProgressFromContentScript() {
    const progressInterval = setInterval(() => {
      chrome.runtime.sendMessage({ type: 'GET_PROGRESS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Lỗi khi lấy tiến độ:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          clearInterval(progressInterval);
          return;
        }
        
        if (response) {
          const { processed, total, completedVariants } = response;
          const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
          
          progressFill.style.width = pct + '%';
          progressText.textContent = `${processed}/${total} mã môn học`;
          
          // Nếu đã hoàn thành tất cả
          if (processed >= total && total > 0) {
            clearInterval(progressInterval);
            setStatus('Hoàn thành', 'connected');
            startBtn.disabled = false;
            stopBtn.disabled = true;
            progressSection.style.display = 'none';
          }
        }
      });
    }, 2000); // Cập nhật mỗi 2 giây
  }

  // Initialize
  loadConfig(); // Load config khi popup mở

  // Check connection status with background script
  chrome.runtime.sendMessage({ type: 'GET_CONNECTION_STATUS' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Lỗi khi kiểm tra trạng thái kết nối:', chrome.runtime.lastError.message || chrome.runtime.lastError);
      setStatus('Lỗi khi kiểm tra kết nối', 'error');
      return;
    }
    
    if (response && response.isConnected) {
      setStatus('Đã kết nối với forms.office.com', 'connected');
      startBtn.disabled = false;
    } else {
      setStatus('Chưa kết nối với trang forms.office.com', 'error');
      startBtn.disabled = true;
    }
  });
});
