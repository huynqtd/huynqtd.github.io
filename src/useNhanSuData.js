// src/useNhanSuData.js
import { useEffect, useState } from "react";
import Papa from "papaparse";

/**
 * Google Sheet: "DanhbanganhThue"
 * Tab dữ liệu: "QLDN2"
 *
 * Cách lấy gid của tab QLDN2:
 *  1. Mở sheet trên trình duyệt
 *  2. Click vào tab "QLDN2"
 *  3. Nhìn URL có dạng: .../edit#gid=123456789
 *  4. Copy số 123456789 vào SHEET_GID bên dưới
 */
const SHEET_ID = "1wH_rQwpF2jRO_8s277hq_kmuN-i79JMzKqNx43XAK0Y";
const SHEET_GID = ""; // 👈 DÁN gid của tab QLDN2 vào đây (để trống = tab đầu tiên)

const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv${
  SHEET_GID ? `&gid=${SHEET_GID}` : ""
}`;

export function useNhanSuData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(SHEET_CSV_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status} – không tải được sheet. Kiểm tra quyền "Anyone with the link".`
          );
        }
        return res.text();
      })
      .then((csv) => {
        if (cancelled) return;

        // Nếu Google trả về trang HTML đăng nhập thay vì CSV
        if (csv.trim().startsWith("<")) {
          throw new Error(
            "Sheet chưa được chia sẻ công khai. Vào Share → Anyone with the link → Viewer."
          );
        }

        const { data: rows } = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
        });

        const cleaned = rows
          .map((r) => {
            const o = {};
            Object.keys(r).forEach((k) => {
              o[k.trim()] = (r[k] ?? "").toString().trim();
            });
            return o;
          })
          .filter((r) => r.id || r.hoTen);

        if (cleaned.length === 0) {
          throw new Error(
            "Không đọc được dòng dữ liệu nào. Kiểm tra lại tên cột hoặc gid của tab QLDN2."
          );
        }

        setData(cleaned);
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
