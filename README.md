# 🚀 Auto-fill Form - Tự động điền khảo sát học phần Microsoft Forms

[![Version](https://img.shields.io/badge/version-1.27-blue.svg)](https://github.com/hohuyhoang308/autofill-form)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-red.svg)](https://chrome.google.com/webstore)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Script-yellow.svg)](https://www.tampermonkey.net/)

> **Công cụ tự động hóa việc điền khảo sát Microsoft Forms, tiết kiệm thời gian và công sức cho sinh viên**

## 📋 Tổng quan
**Có bao giờ bạn tự nghĩ tại sao mình phải tốn 15p cuộc đời vào việc khảo sát chưa, trong khi mình có thể làm nhiều việc. Chúng tôi ra mắt công cụ tiện ích giúp giải quyết vấn đề này**
Auto-fill Form là một công cụ mạnh mẽ giúp tự động điền các biểu mẫu khảo sát trên Microsoft Forms với các đánh giá được cấu hình sẵn. Công cụ hỗ trợ cả **Chrome Extension** và **Tampermonkey Userscript**, mang lại sự linh hoạt tối đa cho người dùng.

### ✨ Tính năng chính

- 🎯 **Tự động điền form**: Tự động chọn và điền các trường biểu mẫu theo thiết lập
- ⚙️ **Cấu hình linh hoạt**: Menu cấu hình để chỉnh sửa danh sách mã môn học, ngành, tỷ lệ tham gia, đánh giá
- 🔄 **Xử lý nhiều biến thể**: Hỗ trợ xử lý nhiều biến thể của cùng một mã môn học
- 📊 **Theo dõi tiến độ**: Hiển thị tiến độ xử lý real-time
- 💾 **Lưu trữ cấu hình**: Tự động lưu và khôi phục cấu hình
- 🎨 **Giao diện thân thiện**: Popup đẹp mắt với các nút điều khiển trực quan

## 🛠️ Cài đặt

### Phương thức 1: Chrome Extension (Khuyến nghị)

#### Bước 1: Chuẩn bị
1. Tải về toàn bộ source code từ repository này
2. Giải nén file ZIP vào một thư mục

#### Bước 2: Cài đặt Extension
1. Mở Chrome và truy cập `chrome://extensions/`
2. Bật **"Developer mode"** ở góc trên bên phải
3. Click **"Load unpacked"**
4. Chọn thư mục chứa source code đã giải nén
5. Extension sẽ xuất hiện trong danh sách với tên "Auto-fill"

#### Bước 3: Kích hoạt
1. Click vào icon extension trên thanh công cụ
2. Extension sẽ tự động phát hiện khi bạn truy cập `forms.office.com`

### Phương thức 2: Tampermonkey Userscript

1. Cài đặt tiện ích [Tampermonkey](https://www.tampermonkey.net/) trên trình duyệt của bạn.
2. Nhấp vào nút cài đặt này để cài đặt script 👉 :
   [![Cài đặt Script](https://img.shields.io/badge/Cài%20đặt-Script-blue.svg)](https://raw.githubusercontent.com/hohuyhoang308/autofill-form/refs/heads/main/main.user.js)

## 🚀 Hướng dẫn sử dụng

### Chrome Extension

1. **Mở trang khảo sát**: Truy cập `forms.office.com` với form khảo sát cần điền
2. **Cấu hình**: Click vào icon extension → Click "Cấu hình" để mở menu
3. **Thiết lập**:
   - Nhập danh sách mã môn học (mỗi mã một dòng)
   - Chọn ngành học
   - Chọn tỷ lệ tham gia
   - Chọn mức độ đánh giá
   - Nhập nội dung cho ô text
4. **Lưu cấu hình**: Click "Lưu cấu hình"
5. **Bắt đầu**: Click "Bắt đầu tự động"
6. **Theo dõi**: Quan sát thanh tiến độ và trạng thái

### Tampermonkey Userscript

1. **Mở trang khảo sát**: Truy cập `forms.office.com`
2. **Cấu hình**: Click vào menu "Cấu hình tự động điền" ở góc trên bên phải
3. **Thiết lập**: Điều chỉnh các thông số theo nhu cầu
4. **Lưu**: Click "Lưu cấu hình"
5. **Bắt đầu**: Click "Bắt đầu" để khởi động quy trình

## ⚙️ Cấu hình chi tiết

### Danh sách mã môn học
```
22425_192
22425_043C
22425_040C
22425_006C
```

### Các tùy chọn ngành học
- Công nghệ Thông tin
- Luật
- Luật Kinh tế
- Kế toán
- Tài chính Ngân hàng
- Marketing
- Thương mại điện tử
- Quản trị Kinh doanh
- Ngôn ngữ Anh
- Ngôn ngữ Nhật
- Ngôn ngữ Trung Quốc
- Quản trị Dịch vụ du lịch và Lữ hành
- Quản trị Khách sạn
- Quản lý Bệnh viện
- Công nghệ Tài chính
- Ngôn ngữ Hàn Quốc
- Kỹ thuật Máy tính
- Kinh tế Quốc tế
- Tâm Lý Học

### Tỷ lệ tham gia
- <50%
- 50% - 70%
- 70% - 90%
- 90%

### Mức độ đánh giá
- Rất không hài lòng
- Không hài lòng
- Phân vân
- Hài lòng
- Rất hài lòng

## 🔧 Cấu trúc dự án

```
autofill-form/
├── manifest.json          # Manifest cho Chrome Extension
├── main.user.js          # Userscript cho Tampermonkey
├── js/
│   ├── background.js     # Service worker
│   ├── content.js        # Content script chính
│   ├── form-handler.js   # Logic xử lý form
│   ├── storage.js        # Quản lý lưu trữ
│   └── constants.js      # Hằng số và cấu hình
├── popup/
│   ├── popup.html        # Giao diện popup
│   └── popup.js          # Logic popup
├── css/
│   ├── content.css       # Style cho content
│   └── popup.css         # Style cho popup
├── icons/
│   └── icon-16.png       # Icon extension
└── libs/
    └── jquery-3.6.0.min.js # Thư viện jQuery
```

## 🎯 Tính năng nâng cao

### Xử lý thông minh
- **Tự động phát hiện**: Nhận diện các loại form khác nhau
- **Xử lý lỗi**: Xử lý các trường hợp ngoại lệ một cách thông minh
- **Retry logic**: Tự động thử lại khi gặp lỗi

### Quản lý tiến trình
- **Lưu trạng thái**: Tự động lưu tiến độ xử lý
- **Khôi phục**: Tiếp tục từ nơi đã dừng khi reload trang
- **Reset**: Khả năng reset tiến trình về đầu

### Giao diện người dùng
- **Popup đẹp mắt**: Giao diện hiện đại với các icon trực quan
- **Feedback real-time**: Hiển thị trạng thái và tiến độ ngay lập tức
- **Responsive**: Tương thích với các kích thước màn hình khác nhau

## 🐛 Xử lý sự cố

### Lỗi thường gặp

**Extension không hoạt động:**
- Kiểm tra xem đã bật Developer mode chưa
- Đảm bảo đang truy cập đúng trang `forms.office.com`
- Reload lại trang web

**Script Tampermonkey không load:**
- Kiểm tra xem Tampermonkey đã được cài đặt và kích hoạt chưa
- Đảm bảo script đã được lưu và kích hoạt
- Kiểm tra console để xem lỗi chi tiết (F12)

**Form không được điền đúng:**
- Kiểm tra cấu hình mã môn học
- Đảm bảo các tùy chọn trong form khớp với cấu hình
- Kiểm tra console để xem log chi tiết

### Debug
1. Mở Developer Tools (F12)
2. Chuyển sang tab Console
3. Quan sát các log để hiểu quá trình xử lý
4. Kiểm tra các lỗi JavaScript nếu có

## 📝 Ghi chú quan trọng

- ⚠️ **Chỉ hoạt động trên Microsoft Forms**: Extension/script chỉ hoạt động trên trang `forms.office.com`
- 🔒 **Tuân thủ chính sách**: Đảm bảo tuân thủ các chính sách sử dụng của Microsoft Forms
- 🎯 **Mục đích giáo dục**: Công cụ được phát triển để hỗ trợ sinh viên trong việc điền khảo sát học tập
- 🔄 **Cập nhật thường xuyên**: Kiểm tra và cập nhật phiên bản mới nhất

## 👨‍💻 Tác giả

**Hồ Huy Hoàng**
- 🌐 Facebook: [facebook.com/hohuyhoang308](https://www.facebook.com/hohuyhoang308/)
- 📱 GitHub: [github.com/hohuyhoang308](https://github.com/hohuyhoang308)

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository này
2. Tạo branch cho tính năng mới (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở một Pull Request

## 📞 Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:

- 📧 Gửi email cho tác giả
- 🐛 Tạo issue trên GitHub
- 💬 Liên hệ qua Facebook

---

<div align="center">

**⭐ Nếu dự án này hữu ích, hãy cho chúng tôi một star! ⭐**

Made with ❤️ by Hồ Huy Hoàng

</div>
