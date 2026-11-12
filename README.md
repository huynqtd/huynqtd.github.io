# Danh bạ nhân sự – QLDN2

Web app hiển thị danh sách nhân sự, dữ liệu đọc trực tiếp từ Google Sheet
**DanhbanganhThue** (tab **QLDN2**).

## Tính năng
- Tìm kiếm theo họ tên / chức vụ / SĐT
- Lọc theo đơn vị
- 2 chế độ xem: Thẻ & Bảng
- Responsive

## Chạy local
\`\`\`bash
npm install
npm run dev
\`\`\`

## Cấu hình sheet
Mở `src/useNhanSuData.js`, sửa:
- `SHEET_ID` – ID Google Sheet
- `SHEET_GID` – gid của tab QLDN2 (xem hướng dẫn trong file)

## Deploy GitHub Pages
\`\`\`bash
npm run build
# đẩy thư mục dist/ lên nhánh gh-pages, hoặc dùng GitHub Actions
\`\`\`
