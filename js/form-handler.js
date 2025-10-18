// form-handler.js - Xử lý logic điền form

class FormHandler {
  constructor(config) {
    this.config = config;
    this.currentValueIndex = 0;
    this.currentOptionForSameCode = 0;
    this.matchingOptions = [];
    this.processedCourses = new Set();
    this.completedVariantCount = 0;
    this.allProcessed = false;
  }

  async loadProgress() {
    const progress = await StorageManager.getProgress();
    this.currentValueIndex = progress.currentValueIndex;
    this.currentOptionForSameCode = progress.currentOptionForSameCode;
    this.completedVariantCount = progress.completedVariantCount;
    this.processedCourses = new Set(progress.processedCourses);
  }

  async saveProgress() {
    await StorageManager.saveProgress({
      processedCourses: Array.from(this.processedCourses),
      currentValueIndex: this.currentValueIndex,
      currentOptionForSameCode: this.currentOptionForSameCode,
      completedVariantCount: this.completedVariantCount
    });
  }

  clickElement(selector, elementName, callback) {
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

  selectAllRatHaiLongAndSubmit() {
    console.log(`Bắt đầu chọn tất cả '${this.config.LUA_CHON.DANH_GIA}'`);
    const radioInputs = document.querySelectorAll(SELECTORS.RADIO_INPUT);
    let foundDanhGia = false;

    // Ánh xạ aria-posinset với DANH_GIA_OPTIONS
    const posInSetMap = {};
    this.config.DANH_GIA_OPTIONS.forEach((option, index) => {
      posInSetMap[index + 1] = option;
    });

    radioInputs.forEach(radio => {
      try {
        const posInSet = parseInt(radio.getAttribute('aria-posinset'));
        if (posInSet && posInSetMap[posInSet] === this.config.LUA_CHON.DANH_GIA) {
          radio.click();
          foundDanhGia = true;
          console.log(`Đã chọn Đánh giá: ${this.config.LUA_CHON.DANH_GIA} tại aria-posinset ${posInSet}`);
        }
      } catch (e) {
        console.error('Lỗi khi xử lý radio input:', e);
      }
    });

    if (!foundDanhGia) {
      console.log(`Không tìm thấy tùy chọn '${this.config.LUA_CHON.DANH_GIA}' dựa trên aria-posinset`);
    }

    // Điền text box
    try {
      const inputElement = document.querySelector(SELECTORS.TEXT_INPUT);
      if (inputElement) {
        inputElement.value = this.config.LUA_CHON.TEXT_BOX;
        const event = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(event);
        console.log(`Đã điền text box với giá trị: ${this.config.LUA_CHON.TEXT_BOX}`);
      } else {
        console.log("Không tìm thấy text box để điền.");
      }
    } catch (e) {
      console.error('Lỗi khi điền text box:', e);
    }

    // Submit form
    setTimeout(() => {
      this.submitForm();
    }, DELAY.SUBMIT_FORM);
  }

  submitForm() {
    try {
      const submitButton = document.querySelector(SELECTORS.SUBMIT_BUTTON);
      if (submitButton) {
        console.log("Đang click nút Submit");
        submitButton.click();

        this.completedVariantCount++;
        this.saveProgress();

        let moveToNextCode = false;

        if (this.matchingOptions.length > 0 && this.currentOptionForSameCode < this.matchingOptions.length - 1) {
          this.currentOptionForSameCode++;
          console.log(`Chuyển sang tùy chọn tiếp theo (${this.currentOptionForSameCode + 1}/${this.matchingOptions.length}) cho mã ${this.config.MON_HOC_VALUES[this.currentValueIndex]}`);
        } else {
          const currentCode = this.config.MON_HOC_VALUES[this.currentValueIndex];
          this.processedCourses.add(currentCode);
          console.log(`Đã hoàn thành tất cả biến thể của mã: ${currentCode}`);
          console.log(`Đã xử lý ${this.processedCourses.size}/${this.config.MON_HOC_VALUES.length} mã môn học`);

          this.currentValueIndex = (this.currentValueIndex + 1) % this.config.MON_HOC_VALUES.length;
          this.currentOptionForSameCode = 0;
          this.matchingOptions = [];
          moveToNextCode = true;

          if (this.processedCourses.size >= this.config.MON_HOC_VALUES.length) {
            this.allProcessed = true;
            this.showCompletionMessage();
          }
        }

        setTimeout(() => {
          this.handleSubmitAnother(moveToNextCode);
        }, DELAY.NEXT_FORM);
      } else {
        console.log("Không tìm thấy nút Submit");
      }
    } catch (e) {
      console.error('Lỗi khi xử lý submit:', e);
    }
  }

  showCompletionMessage() {
    console.log("============================================");
    console.log(`ĐÃ HOÀN THÀNH TẤT CẢ ${this.config.MON_HOC_VALUES.length} MÃ MÔN HỌC!`);
    console.log(`Tổng số biến thể đã xử lý: ${this.completedVariantCount}`);
    console.log("============================================");
    
    // Gửi message cho popup để hiển thị thông báo
    chrome.runtime.sendMessage({
      type: 'COMPLETION',
      data: {
        totalCourses: this.config.MON_HOC_VALUES.length,
        totalVariants: this.completedVariantCount
      }
    });
  }

  handleSubmitAnother(moveToNextCode) {
    try {
      const submitAnotherButton = document.querySelector(SELECTORS.SUBMIT_ANOTHER);
      if (submitAnotherButton && !this.allProcessed) {
        console.log("Đang click nút Submit another response");
        submitAnotherButton.click();

        setTimeout(() => {
          if (moveToNextCode && this.processedCourses.has(this.config.MON_HOC_VALUES[this.currentValueIndex])) {
            let foundUnprocessed = false;
            const startIndex = this.currentValueIndex;

            do {
              if (!this.processedCourses.has(this.config.MON_HOC_VALUES[this.currentValueIndex])) {
                foundUnprocessed = true;
                break;
              }
              this.currentValueIndex = (this.currentValueIndex + 1) % this.config.MON_HOC_VALUES.length;
            } while (this.currentValueIndex !== startIndex);

            if (!foundUnprocessed) {
              this.allProcessed = true;
              console.log("Đã xử lý tất cả mã môn học. Dừng quy trình.");
              return;
            }
          }

          if (!this.allProcessed) {
            console.log("Form mới đã load, tiếp tục vòng lặp");
            this.loopThroughValues();
          } else {
            console.log("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
          }
        }, DELAY.LOAD_ELEMENTS);
      } else if (this.allProcessed) {
        console.log("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
      } else {
        console.log("Không tìm thấy nút Submit another response");
      }
    } catch (e) {
      console.error('Lỗi khi xử lý submit another:', e);
    }
  }

  loopThroughValues() {
    try {
      if (this.allProcessed) {
        console.log("Tất cả mã môn học đã được xử lý. Dừng quy trình.");
        return;
      }

      console.log(`Bắt đầu quy trình với mã môn học: ${this.config.MON_HOC_VALUES[this.currentValueIndex]} (${this.currentValueIndex + 1}/${this.config.MON_HOC_VALUES.length})`);

      // Kiểm tra các element có sẵn trên trang
      const allListboxes = document.querySelectorAll('div[role="button"][aria-haspopup="listbox"]');

      // Xử lý listbox Ngành
      const nganhListbox = document.querySelector(SELECTORS.LISTBOX);
      if (nganhListbox) {
        nganhListbox.click();

        setTimeout(() => {
          this.selectNganh();
        }, DELAY.LOAD_LISTBOX);
      } else {
        this.handleRadioNganh();
      }
    } catch (e) {
      console.error('Lỗi trong loopThroughValues:', e);
    }
  }

  selectNganh() {
    const nganhOptions = document.querySelectorAll(SELECTORS.LISTBOX_OPTIONS);
    let foundNgành = false;
    
    for (let i = 0; i < nganhOptions.length; i++) {
      if (nganhOptions[i].textContent.trim() === this.config.LUA_CHON.NGANH) {
        console.log(`Đã chọn Ngành: ${nganhOptions[i].textContent}`);
        nganhOptions[i].click();
        foundNgành = true;
        break;
      }
    }

    if (!foundNgành) {
      console.log(`Không tìm thấy tùy chọn Ngành: ${this.config.LUA_CHON.NGANH}`);
    }

    // Click Next button
    this.clickElement(SELECTORS.NEXT_BUTTON, "Next/Tiếp theo button", () => {
      setTimeout(() => {
        this.handleMonHocListbox();
      }, DELAY.LOAD_ELEMENTS);
    });
  }

  handleRadioNganh() {
    const radioButton = document.querySelector(`input[value="${this.config.LUA_CHON.NGANH}"]`);
    if (radioButton) {
      console.log(`Tìm thấy nút radio ${this.config.LUA_CHON.NGANH}`);
      radioButton.click();
      
      this.clickElement(SELECTORS.NEXT_BUTTON, "Next/Tiếp theo button", () => {
        setTimeout(() => {
          this.handleMonHocListbox();
        }, DELAY.LOAD_ELEMENTS);
      });
    } else {
      this.skipCurrentCourse();
    }
  }

  skipCurrentCourse() {
    this.processedCourses.add(this.config.MON_HOC_VALUES[this.currentValueIndex]);
    this.currentValueIndex = (this.currentValueIndex + 1) % this.config.MON_HOC_VALUES.length;
    this.currentOptionForSameCode = 0;
    
    if (this.processedCourses.size >= this.config.MON_HOC_VALUES.length) {
      this.allProcessed = true;
      console.log("Tất cả mã môn học đã được xử lý. Kết thúc tự động điền.");
      return;
    }
    
    setTimeout(() => this.loopThroughValues(), DELAY.LOAD_ELEMENTS);
  }

  handleMonHocListbox() {
    try {
      const listbox = document.querySelector(SELECTORS.LISTBOX);
      if (listbox) {
        console.log("Tìm thấy listbox cho mã môn học");
        listbox.click();
        
        setTimeout(() => {
          this.selectMonHoc();
        }, DELAY.LOAD_LISTBOX);
      } else {
        console.log("Không tìm thấy listbox cho mã môn học.");
      }
    } catch (e) {
      console.error('Lỗi khi tìm listbox (mã môn học):', e);
    }
  }

  selectMonHoc() {
    try {
      const listBoxOptions = document.querySelectorAll(SELECTORS.LISTBOX_OPTIONS);

      this.matchingOptions = [];
      for (let i = 0; i < listBoxOptions.length; i++) {
        if (listBoxOptions[i].textContent.startsWith(this.config.MON_HOC_VALUES[this.currentValueIndex])) {
          this.matchingOptions.push(listBoxOptions[i]);
        }
      }

      console.log(`Tìm thấy ${this.matchingOptions.length} tùy chọn cho mã ${this.config.MON_HOC_VALUES[this.currentValueIndex]}`);

      if (this.matchingOptions.length > 0) {
        console.log(`Đã chọn: ${this.matchingOptions[this.currentOptionForSameCode].textContent}`);
        this.matchingOptions[this.currentOptionForSameCode].click();
        
        setTimeout(() => {
          this.handleTyLeThamGia();
        }, DELAY.LOAD_LISTBOX);
      } else {
        console.log(`Không tìm thấy tùy chọn với giá trị: ${this.config.MON_HOC_VALUES[this.currentValueIndex]}`);
        this.skipCurrentCourse();
      }
    } catch (e) {
      console.error('Lỗi khi xử lý listbox options (mã môn học):', e);
    }
  }

  handleTyLeThamGia() {
    try {
      const tyLeThamGiaRadio = document.querySelector(`input[value="${this.config.LUA_CHON.TY_LE_THAM_GIA}"]`);
      if (tyLeThamGiaRadio) {
        console.log(`Tìm thấy nút radio ${this.config.LUA_CHON.TY_LE_THAM_GIA}`);
        tyLeThamGiaRadio.click();
      } else {
        console.log(`Không tìm thấy nút radio ${this.config.LUA_CHON.TY_LE_THAM_GIA}`);
      }
      
      this.clickElement(SELECTORS.NEXT_BUTTON, "Next/Tiếp theo button", () => {
        setTimeout(() => {
          this.selectAllRatHaiLongAndSubmit();
        }, DELAY.LOAD_ELEMENTS);
      });
    } catch (e) {
      console.error('Lỗi khi xử lý radio Tỷ lệ tham gia:', e);
    }
  }

  async start() {
    // Reload config từ storage trước khi bắt đầu để đảm bảo có config mới nhất
    const freshConfig = await StorageManager.getConfig();
    this.config = freshConfig;
    
    await this.loadProgress();
    this.allProcessed = false;
    this.loopThroughValues();
  }

  async reset() {
    this.currentValueIndex = 0;
    this.currentOptionForSameCode = 0;
    this.matchingOptions = [];
    this.processedCourses.clear();
    this.completedVariantCount = 0;
    this.allProcessed = false;
    await StorageManager.clearProgress();
  }
}
