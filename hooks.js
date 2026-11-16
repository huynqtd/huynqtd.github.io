/**
 * hooks.js
 * Chứa các custom hook để tải và quản lý dữ liệu từ Google Sheets.
 * Yêu cầu: index.html phải load trước các file config.js (chứa SHEET_ID, csvUrl, getMST, h...)
 * và thư viện PapaParse (papaparse.min.js).
 */

(function () {
  "use strict";

  const { useState, useEffect } = React;

  // ============================================================
  // HOOK CHÍNH: Tải dữ liệu từ Google Sheets qua CSV
  // ============================================================
  /**
   * @param {string} gid - ID của sheet (tab) cần tải
   * @param {Object} options
   * @param {Function} options.filterEmpty - Hàm lọc các dòng rỗng (nhận vào 1 row, trả về true/false)
   * @param {number} [options.cacheMinutes=5] - Số phút cache dữ liệu (mặc định 5 phút)
   * @returns {{ data: Array, loading: boolean, error: Error|null }}
   */
  function useSheetData(gid, { filterEmpty, cacheMinutes = 5 }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      let cancelled = false;
      const cacheKey = `sheet_cache_${gid}`;

      // 1. Thử đọc từ sessionStorage trước (để tải tức thì khi chuyển tab qua lại)
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && Date.now() - parsed.timestamp < cacheMinutes * 60 * 1000) {
            setData(parsed.data);
            setLoading(false);
            return; // Dùng cache, không gọi lại API
          }
        }
      } catch (e) {
        // sessionStorage có thể bị chặn (chế độ ẩn danh), bỏ qua và tải mới
      }

      // 2. Tải dữ liệu từ Google Sheets
      setLoading(true);
      setError(null);

      fetch(csvUrl(gid))
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} – không tải được sheet (gid=${gid})`);
          }
          return res.text();
        })
        .then((csv) => {
          if (cancelled) return;

          // Kiểm tra xem Google trả về HTML (lỗi quyền truy cập) thay vì CSV
          if (csv.trim().startsWith("<")) {
            throw new Error(
              "Sheet chưa được public hoặc bạn không có quyền truy cập. " +
              "Vào Google Sheets → Share → Anyone with the link → Viewer."
            );
          }

          // Parse CSV bằng PapaParse
          const { data: rows, errors } = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(), // Xóa khoảng trắng thừa ở tên cột
          });

          // Nếu PapaParse báo lỗi nghiêm trọng (không phải lỗi field rỗng)
          if (errors && errors.length > 0) {
            const fatalErrors = errors.filter((e) => e.type === "Quotes" || e.type === "Delimiter");
            if (fatalErrors.length > 0) {
              console.warn("PapaParse cảnh báo:", fatalErrors);
            }
          }

          // Làm sạch dữ liệu
          const cleaned = rows
            .map((r) => {
              const o = {};
              Object.keys(r).forEach((k) => {
                o[k.trim()] = (r[k] ?? "").toString().trim();
              });
              return o;
            })
            .filter(filterEmpty);

          if (cleaned.length === 0) {
            throw new Error(
              "Không có dòng dữ liệu nào. Kiểm tra lại: (1) tên cột trong Sheet có khớp code không, " +
              "(2) sheet có dữ liệu thật không, (3) gid có đúng không."
            );
          }

          setData(cleaned);

          // 3. Lưu vào sessionStorage để lần sau tải nhanh hơn
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              timestamp: Date.now(),
              data: cleaned,
            }));
          } catch (e) {
            // Nếu vượt quá dung lượng (~5MB) thì bỏ qua, không quan trọng
          }
        })
        .catch((e) => {
          if (cancelled) return;
          console.error(`[useSheetData] Lỗi khi tải gid=${gid}:`, e);
          setError(e);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => { cancelled = true; };
    }, [gid, cacheMinutes]); // filterEmpty nên là hàm stable, không cần vào deps

    return { data, loading, error };
  }

  // ============================================================
  // WRAPPER HOOK: Nhân sự
  // ============================================================
  function useNhanSuData() {
    return useSheetData(GID_NHANSU, {
      // Chỉ lấy dòng có ít nhất 1 trong 2 trường quan trọng
      filterEmpty: (r) => !!(r.id || r.hoTen || r["Họ và tên"]),
    });
  }

  // ============================================================
  // WRAPPER HOOK: Doanh nghiệp
  // ============================================================
  function useDoanhNghiepData() {
    return useSheetData(GID_DOANHNGHIEP, {
      // Chỉ lấy dòng có tên NNT, MST, hoặc mã cán bộ
      filterEmpty: (r) => !!(r["Tên NNT"] || getMST(r) || r["Mã cán bộ"]),
    });
  }

  // ============================================================
  // EXPORT GLOBAL (vì không dùng ES6 module, ta gắn vào window)
  // ============================================================
  window.useSheetData = useSheetData;
  window.useNhanSuData = useNhanSuData;
  window.useDoanhNghiepData = useDoanhNghiepData;
})();
