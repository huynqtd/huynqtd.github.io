/**
 * config.js
 * Chứa toàn bộ hằng số cấu hình và hàm tiện ích dùng chung.
 * PHẢI nạp TRƯỚC hooks.js và components.js.
 */

(function () {
  "use strict";

  // ============================================================
  // CẤU HÌNH
  // ============================================================
  const SHEET_ID = "1wH_rQwpF2jRO_8s277hq_kmuN-i79JMzKqNx43XAK0Y";
  const GID_NHANSU = "557275852";
  const GID_DOANHNGHIEP = "869158415";
  const APP_NAME = "Phòng QLHTDN số 2";
  const APP_SUB = "Nhân sự & Doanh nghiệp";

  const csvUrl = (gid) =>
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

  // ============================================================
  // TIỆN ÍCH NGÀY THÁNG
  // ============================================================
  function formatDate(iso) {
    if (!iso) return "—";
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split("-");
      return `${d}/${m}/${y}`;
    }
    return iso;
  }

  // ============================================================
  // TIỆN ÍCH CHUỖI
  // ============================================================
  function normalizeMST(s) {
    return (s || "").replace(/[\s\-\.]/g, "").trim();
  }

  function normalizeTen(s) {
    return (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getVal(obj, ...keys) {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== "") return obj[k];
    }
    return "";
  }

  // ============================================================
  // LẤY MST LINH HOẠT (nhiều tên cột)
  // ============================================================
  function getMST(d) {
    const candidates = [
      "Mã số thuế", "MST", "Mã Số Thuế", "Ma so thue", "Mã số thuế (MST)",
      "Số thuế", "Tax Code", "MST/NNT", "Mã số thuế NNT",
    ];
    for (const k of candidates) {
      if (d[k] !== undefined && d[k] !== "") return d[k];
    }
    const key = Object.keys(d).find((k) => {
      const kl = k.toLowerCase();
      return kl.includes("thuế") || kl.includes("thue") || kl.includes("mst");
    });
    return key ? d[key] : "";
  }

  // ============================================================
  // XẾP HẠNG CHỨC VỤ
  // ============================================================
  function getChucVuRank(chucVu) {
    const cv = (chucVu || "").toLowerCase().trim();
    if (cv.includes("trưởng phòng")) return 1;
    if (cv.includes("phó phòng")) return 2;
    if (cv.includes("chuyên viên chính")) return 3;
    if (cv.includes("kiểm tra viên chính")) return 4;
    if (cv.includes("chuyên viên")) return 5;
    if (cv.includes("kiểm tra viên")) return 6;
    return 99;
  }

  // ============================================================
  // XỬ LÝ NGÀY SINH
  // ============================================================
  function parseBirthday(raw) {
    if (!raw) return null;
    const s = String(raw).trim();

    let m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (m) return { d: parseInt(m[3], 10), m: parseInt(m[2], 10), y: parseInt(m[1], 10) };

    m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (m) return { d: parseInt(m[1], 10), m: parseInt(m[2], 10), y: parseInt(m[3], 10) };

    m = s.match(/^(\d{1,2})[-\/](\d{1,2})$/);
    if (m) return { d: parseInt(m[1], 10), m: parseInt(m[2], 10), y: null };

    return null;
  }

  function getTodayParts() {
    const t = new Date();
    return { d: t.getDate(), m: t.getMonth() + 1, y: t.getFullYear() };
  }

  function isBirthdayToday(raw) {
    const b = parseBirthday(raw);
    if (!b) return false;
    const t = getTodayParts();
    return b.d === t.d && b.m === t.m;
  }

  function getDaysUntilBirthday(raw) {
    const b = parseBirthday(raw);
    if (!b) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextBday = new Date(today.getFullYear(), b.m - 1, b.d);
    if (nextBday < today) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = Math.abs(nextBday - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // ============================================================
  // GẮN TẤT CẢ VÀO WINDOW ĐỂ CÁC FILE KHÁC DÙNG ĐƯỢC
  // ============================================================
  window.SHEET_ID = SHEET_ID;
  window.GID_NHANSU = GID_NHANSU;
  window.GID_DOANHNGHIEP = GID_DOANHNGHIEP;
  window.APP_NAME = APP_NAME;
  window.APP_SUB = APP_SUB;

  window.csvUrl = csvUrl;
  window.formatDate = formatDate;
  window.normalizeMST = normalizeMST;
  window.normalizeTen = normalizeTen;
  window.getVal = getVal;
  window.getMST = getMST;
  window.getChucVuRank = getChucVuRank;
  window.parseBirthday = parseBirthday;
  window.getTodayParts = getTodayParts;
  window.isBirthdayToday = isBirthdayToday;
  window.getDaysUntilBirthday = getDaysUntilBirthday;

  console.log("[config.js] ✅ Đã nạp cấu hình và tiện ích");
})();
