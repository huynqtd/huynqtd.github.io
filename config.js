const SHEET_ID = "1wH_rQwpF2jRO_8s277hq_kmuN-i79JMzKqNx43XAK0Y";
const GID_NHANSU = "557275852";
const GID_DOANHNGHIEP = "869158415";
const APP_NAME = "Phòng QLHTDN số 2";
const APP_SUB = "Nhân sự & Doanh nghiệp";
const h = React.createElement;

const csvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

// Các hàm tiện ích (formatDate, normalizeTen, getMST, parseBirthday...)
// Copy toàn bộ các hàm từ file HTML cũ vào đây.
