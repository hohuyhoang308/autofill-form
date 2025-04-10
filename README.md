# Tự Động Điền Khảo Sát cho Microsoft Forms

Script Tampermonkey này tự động điền các biểu mẫu trên [Microsoft Forms](https://forms.office.com/) với đánh giá "Rất hài lòng".

## 📌 Tính năng
- Tự động chọn **"Công nghệ Thông tin"** làm ngành học.
- Điền các trường biểu mẫu theo thiết lập sẵn.
- Chọn tất cả đánh giá **"Rất hài lòng"**.
- Gửi biểu mẫu và có thể tiếp tục phản hồi tiếp theo.
- Phím tắt:
  - Nhấn phím **`** để bắt đầu quy trình tự động hoàn toàn.
  - Nhấn phím **1** để chỉ chọn tất cả tùy chọn **"Rất hài lòng"** và gửi.

## 🔧 Cài đặt
1. Cài đặt tiện ích [Tampermonkey](https://www.tampermonkey.net/) trên trình duyệt của bạn.
2. Nhấp vào nút cài đặt này để cài đặt script 👉 :
   [![Cài đặt Script](https://img.shields.io/badge/Cài%20đặt-Script-blue.svg)](https://raw.githubusercontent.com/hohuyhoang308/autofill-form/refs/heads/main/main.user.js)

## 🚀 Cách sử dụng
1. Truy cập trang [Microsoft Forms](https://forms.office.com/).
2. Nhấn phím **`** để bắt đầu quy trình tự động hoàn toàn.
3. Hoặc nhấn phím **1** để chỉ chọn tất cả đánh giá **"Rất hài lòng"** và gửi.

## 👨‍💻 Tác giả
- **Tác giả gốc:** Hồ Huy Hoàng
- **Phiên bản:** 1.11
- **Giấy phép:** MIT

---

## Hướng dẫn Cấu hình

### Các Biến Có Thể Tùy Chỉnh

Bạn có thể tùy chỉnh script để phù hợp với nhu cầu của mình bằng cách thay đổi các biến sau:

```javascript
// Danh sách mã môn học
const MON_HOC_VALUES = [
  "Mã Môn Học 1", // Ví dụ: 22425_043C
  "Mã Môn Học 2",
  "Mã Môn Học 3",
  "Mã Môn Học 4"
];

// Các lựa chọn dành cho form
const LUA_CHON = {
  NGANH: "Công nghệ Thông tin", // Ngành học mặc định là công nghệ thông tin
  TY_LE_THAM_GIA: ">90 %", // Tỷ lệ tham gia lớp học
  DANH_GIA: "Rất hài lòng", // Đánh giá chọn tự động
  TEXT_BOX: "Hài lòng" // Nội dung điền vào ô text
};

// Thời gian chờ (milliseconds)
const DELAY = {
  CLICK_RADIO: 50, // Thời gian giữa các lần click radio
  SUBMIT_FORM: 1000, // Thời gian chờ trước khi submit
  NEXT_FORM: 2000, // Thời gian chờ trước khi bắt đầu form mới
  LOAD_LISTBOX: 500, // Thời gian chờ để listbox load
  LOAD_ELEMENTS: 1000 // Thời gian chờ để các phần tử load
};
