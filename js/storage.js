// storage.js - Xử lý lưu trữ dữ liệu

class StorageManager {
  static async getConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['config'], (result) => {
        if (result.config) {
          resolve(result.config);
        } else {
          // Nếu chưa có config, load từ background script
          chrome.storage.local.get(['config'], (result) => {
            if (result.config) {
              resolve(result.config);
            } else {
              // Fallback: tạo config mặc định và lưu vào storage
              const defaultConfig = {
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
              
              // Lưu config mặc định vào storage
              chrome.storage.local.set({ config: defaultConfig }, () => {
                resolve(defaultConfig);
              });
            }
          });
        }
      });
    });
  }

  static async saveConfig(config) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ config: config }, () => {
        resolve(true);
      });
    });
  }

  static async getProgress() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['progress'], (result) => {
        resolve(result.progress || {
          processedCourses: [],
          currentValueIndex: 0,
          currentOptionForSameCode: 0,
          completedVariantCount: 0
        });
      });
    });
  }

  static async saveProgress(progress) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ progress: progress }, () => {
        resolve(true);
      });
    });
  }

  static async clearProgress() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['progress'], () => {
        resolve(true);
      });
    });
  }
}
