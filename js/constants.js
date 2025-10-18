// constants.js - Các hằng số và cấu hình mặc định

const SCRIPT_NAMESPACE = 'autofill_improved';

// Cấu hình mặc định
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

// Thời gian delay
const DELAY = {
  CLICK_RADIO: 50,
  SUBMIT_FORM: 1000,
  NEXT_FORM: 2000,
  LOAD_LISTBOX: 500,
  LOAD_ELEMENTS: 1000,
  RETRY: 500
};

// Selectors
const SELECTORS = {
  RADIO_INPUT: 'input[role="radio"]',
  SUBMIT_BUTTON: 'button[data-automation-id="submitButton"]',
  SUBMIT_ANOTHER: 'span[data-automation-id="submitAnother"]',
  NEXT_BUTTON: 'button[aria-label="Next"], button[aria-label="Tiếp theo"], button[data-automation-id="nextButton"]',
  LISTBOX: 'div[role="button"][aria-haspopup="listbox"]',
  LISTBOX_OPTIONS: 'span.text-format-content',
  TEXT_INPUT: 'input[aria-label="Single line text"], textarea[aria-label*="nhận xét"], textarea[aria-label*="góp ý"]'
};
