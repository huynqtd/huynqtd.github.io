/**
 * hooks.js
 * Chứa các custom hook để tải và quản lý dữ liệu từ Google Sheets.
 * Yêu cầu: nạp SAU config.js và papaparse.min.js.
 */
(function () {
  "use strict";

  const { useState, useEffect } = React;

  // Đưa filter ra ngoài — ổn định, không tạo mới mỗi render
  const filterNhanSu = (r) => !!(r.id || r.hoTen || r["Họ và tên"]);
  const filterDoanhNghiep = (r) =>
    !!(r["Tên NNT"] || window.getMST(r) || r["Mã cán bộ"]);

  function useSheetData(gid, { filterEmpty, cacheMinutes = 5 }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      let cancelled = false;
      const cacheKey = `sheet_cache_${gid}`;

      // 1. Đọc cache và hiển thị ngay (nếu có) — nhưng KHÔNG return,
      //    vẫn fetch ngầm để cập nhật dữ liệu mới nhất.
      let hasCache = false;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (
            parsed.timestamp &&
            Date.now() - parsed.timestamp < cacheMinutes * 60 * 1000
          ) {
            setData(parsed.data);
            setLoading(false);
            hasCache = true;
          }
        }
      } catch (e) {
        // sessionStorage có thể bị chặn — bỏ qua
      }

      if (!hasCache) {
        setLoading(true);
      }
      setError(null);

      // 2. Luôn fetch để revalidate (stale-while-revalidate)
      fetch(window.csvUrl(gid))
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status} – không tải được sheet (gid=${gid})`);
          return res.text();
        })
        .then((csv) => {
          if (cancelled) return;
          if (csv.trim().startsWith("<")) {
            throw new Error(
              "Sheet chưa được public. Vào Google Sheets → Share → Anyone with the link → Viewer."
            );
          }

          const { data: rows, errors } = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
          });

          if (errors && errors.length > 0) {
            const fatal = errors.filter((e) => e.type === "Quotes" || e.type === "Delimiter");
            if (fatal.length > 0) console.warn("PapaParse:", fatal);
          }

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
              "Không có dòng dữ liệu. Kiểm tra: (1) tên cột trong Sheet, (2) sheet có dữ liệu thật, (3) gid."
            );
          }

          setData(cleaned);

          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ timestamp: Date.now(), data: cleaned })
            );
          } catch (e) {
            /* Bỏ qua nếu vượt dung lượng */
          }
        })
        .catch((e) => {
          if (cancelled) return;
          console.error(`[useSheetData] Lỗi khi tải gid=${gid}:`, e);
          // Chỉ set error nếu CHƯA có data (để không mất cache khi mất mạng tạm thời)
          setError((prev) => (hasCache ? null : e));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [gid, cacheMinutes]);

    return { data, loading, error };
  }

  // ============================================================
  // WRAPPER HOOKS
  // ============================================================
  function useNhanSuData() {
    return useSheetData(window.GID_NHANSU, { filterEmpty: filterNhanSu });
  }

  function useDoanhNghiepData() {
    return useSheetData(window.GID_DOANHNGHIEP, {
      filterEmpty: filterDoanhNghiep,
    });
  }

  // Gắn global
  window.useSheetData = useSheetData;
  window.useNhanSuData = useNhanSuData;
  window.useDoanhNghiepData = useDoanhNghiepData;

  console.log("[hooks.js] ✅ Đã nạp custom hooks");
})();
