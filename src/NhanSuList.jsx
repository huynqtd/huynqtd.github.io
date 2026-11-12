// src/NhanSuList.jsx
import { useMemo, useState } from "react";
import { useNhanSuData } from "./useNhanSuData";

const formatDate = (iso) => {
  if (!iso) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  return iso;
};

export default function NhanSuList() {
  const { data, loading, error } = useNhanSuData();
  const [keyword, setKeyword] = useState("");
  const [donViFilter, setDonViFilter] = useState("");
  const [viewMode, setViewMode] = useState("card");

  const danhSachDonVi = useMemo(
    () => [...new Set(data.map((n) => n.donVi).filter(Boolean))],
    [data]
  );

  const filtered = useMemo(() => {
    const kw = keyword.toLowerCase();
    return data.filter((n) => {
      const matchKeyword =
        (n.hoTen || "").toLowerCase().includes(kw) ||
        (n.chucVu || "").toLowerCase().includes(kw) ||
        (n.soDienThoai || "").includes(keyword);
      const matchDonVi = donViFilter ? n.donVi === donViFilter : true;
      return matchKeyword && matchDonVi;
    });
  }, [data, keyword, donViFilter]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải dữ liệu từ Google Sheet...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 max-w-lg">
          <p className="font-semibold mb-1">Không tải được dữ liệu</p>
          <p className="text-sm">{error.message}</p>
          <p className="text-xs mt-3 text-red-500">
            Kiểm tra: (1) Sheet để "Anyone with the link", (2) SHEET_GID trỏ
            đúng tab QLDN2.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Danh bạ nhân sự – QLDN2
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Tổng: {filtered.length} / {data.length} nhân sự
        </p>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Tìm theo tên, chức vụ, SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={donViFilter}
            onChange={(e) => setDonViFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Tất cả đơn vị</option>
            {danhSachDonVi.map((dv) => (
              <option key={dv} value={dv}>
                {dv}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 text-sm ${
                viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Thẻ
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 text-sm ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Bảng
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Không tìm thấy nhân sự phù hợp.
          </div>
        ) : viewMode === "card" ? (
          <CardView data={filtered} />
        ) : (
          <TableView data={filtered} />
        )}
      </div>
    </div>
  );
}

function CardView({ data }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((n) => (
        <div
          key={n.id || n.hoTen}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex gap-4"
        >
          <img
            src={n.avatar || "https://via.placeholder.com/80"}
            alt={n.hoTen}
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 shrink-0"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/80";
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">
              {n.hoTen || "—"}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {n.chucVu || "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{n.donVi || "—"}</p>
            <p className="text-xs text-gray-500">{n.toNghiepVu || "—"}</p>
            <div className="mt-2 text-xs text-gray-600 space-y-0.5">
              <p>📞 {n.soDienThoai || "—"}</p>
              <p>☎️ {n.phone_cq || "—"}</p>
              <p>🎂 {formatDate(n.ngaySinh)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableView({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Nhân sự</th>
            <th className="px-4 py-3 text-left">Chức vụ</th>
            <th className="px-4 py-3 text-left">Đơn vị</th>
            <th className="px-4 py-3 text-left">Tổ nghiệp vụ</th>
            <th className="px-4 py-3 text-left">SĐT</th>
            <th className="px-4 py-3 text-left">SĐT CQ</th>
            <th className="px-4 py-3 text-left">Ngày sinh</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((n) => (
            <tr key={n.id || n.hoTen} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={n.avatar || "https://via.placeholder.com/40"}
                    alt={n.hoTen}
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/40";
                    }}
                  />
                  <span className="font-medium text-gray-800 whitespace-nowrap">
                    {n.hoTen || "—"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">{n.chucVu || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{n.donVi || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{n.toNghiepVu || "—"}</td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {n.soDienThoai || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {n.phone_cq || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {formatDate(n.ngaySinh)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
