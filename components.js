/**
 * components.js
 * Chứa toàn bộ giao diện React và lệnh render App.
 * Yêu cầu: index.html phải load trước config.js và hooks.js.
 */

(function () {
  "use strict";

  const { useState, useEffect, useMemo } = React;
  const h = React.createElement;

  // ============================================================
  // UI PRIMITIVES
  // ============================================================
  const Badge = ({ children, color = "slate" }) => {
    const map = {
      slate: "bg-slate-100 text-slate-700 ring-slate-200",
      blue: "bg-brand-50 text-brand-700 ring-brand-200",
      green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      amber: "bg-amber-50 text-amber-700 ring-amber-200",
      rose: "bg-rose-50 text-rose-700 ring-rose-200",
    };
    return h("span", {
      className: `inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ring-1 ring-inset whitespace-nowrap ${map[color] || map.slate}`,
    }, children);
  };

  const Avatar = ({ src, name, size = 40 }) => {
    const [err, setErr] = useState(false);
    const initial = (name || "?").trim().charAt(0).toUpperCase();
    if (!src || err) {
      return h("div", {
        style: { width: size, height: size, minWidth: size },
        className: "rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-semibold shrink-0 text-sm sm:text-base",
      }, initial);
    }
    return h("img", {
      src, alt: name,
      style: { width: size, height: size, minWidth: size },
      className: "rounded-full object-cover ring-2 ring-white shadow-card shrink-0",
      onError: () => setErr(true),
    });
  };

  const Skeleton = ({ className = "" }) =>
    h("div", { className: `skeleton rounded ${className}` });

  function TableSkeleton() {
    return h("div", { className: "bg-white rounded-xl shadow-card p-4 sm:p-5" },
      h("div", { className: "space-y-4" },
        Array.from({ length: 6 }).map((_, i) =>
          h("div", { key: i, className: "flex items-center gap-3" },
            h(Skeleton, { className: "h-10 w-10 rounded-full shrink-0" }),
            h("div", { className: "flex-1 space-y-2" },
              h(Skeleton, { className: "h-3 w-1/2" }),
              h(Skeleton, { className: "h-2 w-1/3" })
            )
          )
        )
      )
    );
  }

  function ErrorBox({ error }) {
    return h("div", { className: "max-w-lg mx-auto mt-10 px-4" },
      h("div", { className: "bg-white rounded-xl shadow-card ring-1 ring-rose-100 p-5" },
        h("div", { className: "flex items-start gap-3" },
          h("div", { className: "w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold text-lg" }, "!"),
          h("div", null,
            h("h3", { className: "font-semibold text-slate-800" }, "Không tải được dữ liệu"),
            h("p", { className: "text-sm text-slate-600 mt-1" }, error.message)
          )
        )
      )
    );
  }

  // ============================================================
  // BANNER SINH NHẬT
  // ============================================================
  function BirthdayBanner({ nhanSu }) {
    const [dismissed, setDismissed] = useState(false);

    const todayList = useMemo(
      () => nhanSu.filter((n) => isBirthdayToday(n.ngaySinh)),
      [nhanSu]
    );

    const upcomingList = useMemo(() => {
      return nhanSu
        .map((n) => ({ ...n, daysLeft: getDaysUntilBirthday(n.ngaySinh) }))
        .filter((n) => n.daysLeft !== null && n.daysLeft > 0 && n.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [nhanSu]);

    useEffect(() => { setDismissed(false); }, [todayList.length]);

    if (todayList.length === 0 && upcomingList.length === 0) return null;

    const today = getTodayParts();

    if (todayList.length > 0 && !dismissed) {
      return h("div", {
        className: "relative overflow-hidden rounded-xl sm:rounded-2xl mb-4 p-4 sm:p-5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white shadow-pop animate-bounceIn",
      },
        h("div", { className: "absolute -right-6 -top-6 text-[100px] opacity-20 pointer-events-none" }, "🎂"),
        h("div", { className: "relative flex items-start gap-3" },
          h("div", { className: "w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl shrink-0" }, "🎂"),
          h("div", { className: "flex-1 min-w-0" },
            h("div", { className: "flex items-center gap-2 flex-wrap" },
              h("h2", { className: "text-base sm:text-lg font-bold" }, "Chúc mừng sinh nhật!"),
              h("span", { className: "text-[10px] bg-white/20 px-2 py-0.5 rounded-full" }, `Hôm nay ${today.d}/${today.m}`)
            ),
            h("p", { className: "text-xs text-white/90 mt-1" },
              todayList.length === 1
                ? "Hôm nay có 1 đồng nghiệp kỷ niệm ngày sinh:"
                : `Hôm nay có ${todayList.length} đồng nghiệp kỷ niệm ngày sinh:`
            ),
            h("div", { className: "mt-3 flex flex-wrap gap-2" },
              todayList.map((n, i) =>
                h("div", { key: i, className: "flex items-center gap-1.5 bg-white/15 rounded-full pl-1 pr-2.5 py-1" },
                  h(Avatar, { src: n.avatar, name: n.hoTen, size: 24 }),
                  h("span", { className: "text-xs font-semibold whitespace-nowrap" }, n.hoTen)
                )
              )
            )
          ),
          h("button", {
            onClick: () => setDismissed(true),
            className: "w-7 h-7 rounded-full hover:bg-white/20 text-white flex items-center justify-center text-xl shrink-0 -mt-1 -mr-1",
          }, "×")
        )
      );
    }

    if (upcomingList.length > 0) {
      return h("div", {
        className: "bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-start gap-2.5 text-xs sm:text-sm text-blue-800 shadow-sm",
      },
        h("span", { className: "text-base mt-0.5" }, "🗓️"),
        h("div", { className: "flex-1 leading-relaxed" },
          h("span", { className: "font-semibold block sm:inline" }, "Sinh nhật sắp tới: "),
          upcomingList.map((n, i) =>
            h("span", { key: i, className: "inline-block mr-1.5" },
              n.hoTen,
              h("span", { className: "text-blue-600 font-medium ml-0.5" },
                `(${n.daysLeft === 1 ? "Mai" : n.daysLeft + " ngày"})`
              ),
              i < upcomingList.length - 1 ? "," : ""
            )
          )
        )
      );
    }

    return null;
  }

  // ============================================================
  // MODAL CÁN BỘ: Xem danh sách DN được quản lý
  // ============================================================
  function CanBoDetail({ tenCanBo, data, onClose }) {
    const dsQuanLy = useMemo(
      () => data.filter((d) => normalizeTen(d["Tên cán bộ quản lý"]) === normalizeTen(tenCanBo)),
      [data, tenCanBo]
    );

    useEffect(() => {
      const onKey = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return h("div", {
      className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn",
      onClick: onClose,
    },
      h("div", {
        className: "bg-white w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-pop overflow-hidden flex flex-col animate-slideUp",
        onClick: (e) => e.stopPropagation(),
      },
        h("div", { className: "px-4 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3" },
          h("div", { className: "flex items-center gap-3" },
            h(Avatar, { name: tenCanBo, size: 44 }),
            h("div", null,
              h("h2", { className: "text-base sm:text-lg font-semibold text-slate-800 line-clamp-1" }, tenCanBo || "—"),
              h("p", { className: "text-xs sm:text-sm text-slate-500 mt-0.5" },
                "Đang quản lý ", h("span", { className: "font-semibold text-brand-700" }, dsQuanLy.length), " doanh nghiệp"
              )
            )
          ),
          h("button", {
            onClick: onClose,
            className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-lg shrink-0",
          }, "×")
        ),
        h("div", { className: "overflow-auto p-1" },
          dsQuanLy.length === 0
            ? h("div", { className: "text-center py-12" },
                h("div", { className: "text-4xl mb-2" }, "📭"),
                h("p", { className: "text-sm text-slate-500" }, "Cán bộ này chưa được phân công quản lý doanh nghiệp nào.")
              )
            : h("table", { className: "w-full text-sm" },
                h("thead", { className: "bg-slate-50 text-slate-500 text-[10px] sm:text-xs uppercase tracking-wide sticky top-0" },
                  h("tr", null,
                    ["Mã số thuế", "Tên NNT", "Phòng"].map((x) =>
                      h("th", { key: x, className: "px-3 py-3 text-left font-medium whitespace-nowrap" }, x))
                  )
                ),
                h("tbody", { className: "divide-y divide-slate-100" },
                  dsQuanLy.map((d, i) =>
                    h("tr", { key: i, className: "hover:bg-slate-50/70" },
                      h("td", { className: "px-3 py-3 font-mono text-[11px] sm:text-xs text-slate-700 whitespace-nowrap" }, getMST(d) || "—"),
                      h("td", { className: "px-3 py-3 text-slate-800 font-medium" }, d["Tên NNT"] || "—"),
                      h("td", { className: "px-3 py-3 text-slate-600 whitespace-nowrap" }, d["Tên phòng"] || "—")
                    )
                  )
                )
              )
        )
      )
    );
  }

  // ============================================================
  // NHÂN SỰ CARD
  // ============================================================
  function NhanSuCard({ n, onClick }) {
    const chucVuColor =
      /trưởng|phó|giám đốc/i.test(n.chucVu || "") ? "blue" :
      /chuyên viên|kiểm tra/i.test(n.chucVu || "") ? "green" : "slate";

    const isBday = isBirthdayToday(n.ngaySinh);

    return h("div", {
      onClick,
      className: `group bg-white rounded-xl shadow-card hover:shadow-pop ring-1 transition p-3.5 sm:p-4 flex gap-3 sm:gap-4 cursor-pointer relative ${
        isBday ? "ring-pink-300 bg-pink-50/30" : "ring-slate-100 hover:ring-brand-200"
      }`,
    },
      h("div", { className: "relative shrink-0 mt-0.5" },
        h(Avatar, { src: n.avatar, name: n.hoTen, size: 52 }),
        isBday
          ? h("span", {
              className: "absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center shadow-card ring-2 ring-white",
            }, "🎂")
          : null
      ),
      h("div", { className: "flex-1 min-w-0" },
        h("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2" },
          h("h3", { className: "font-semibold text-slate-800 text-[15px] sm:text-base truncate group-hover:text-brand-700 pr-1" }, n.hoTen || "—"),
          h("div", { className: "shrink-0 mt-1 sm:mt-0" },
            h(Badge, { color: chucVuColor }, n.chucVu || "—")
          )
        ),
        h("p", { className: "text-[11px] sm:text-xs text-slate-500 mt-1 truncate" },
          `${n.donVi || "—"}${n.toNghiepVu ? " • " + n.toNghiepVu : ""}`
        ),
        h("div", { className: "mt-2.5 grid grid-cols-1 gap-1.5 text-[11px] sm:text-xs text-slate-600" },
          h("div", { className: "flex items-center gap-2" },
            h("span", { className: "text-slate-400 shrink-0" }, "📞"),
            h("span", { className: "truncate" }, n.soDienThoai || "—")
          ),
          h("div", { className: "flex items-center gap-2" },
            h("span", { className: "text-slate-400 shrink-0" }, "☎️"),
            h("span", { className: "truncate" }, n.phone_cq || "—")
          ),
          h("div", { className: `flex items-center gap-2 ${isBday ? "text-pink-600 font-bold" : ""}` },
            h("span", { className: isBday ? "" : "text-slate-400 shrink-0" }, "🎂"),
            formatDate(n.ngaySinh)
          )
        )
      )
    );
  }

  // ============================================================
  // VIEW: NHÂN SỰ
  // ============================================================
  function NhanSuView({ dnData }) {
    const { data, loading, error } = useNhanSuData();
    const [keyword, setKeyword] = useState("");
    const [donViFilter, setDonViFilter] = useState("");
    const [viewMode, setViewMode] = useState("card");
    const [selectedCanBo, setSelectedCanBo] = useState(null);

    const danhSachDonVi = useMemo(
      () => [...new Set(data.map((n) => n.donVi).filter(Boolean))],
      [data]
    );

    const sorted = useMemo(() => {
      return [...data].sort((a, b) => {
        const ba = isBirthdayToday(a.ngaySinh) ? 0 : 1;
        const bb = isBirthdayToday(b.ngaySinh) ? 0 : 1;
        if (ba !== bb) return ba - bb;
        const ra = getChucVuRank(a.chucVu);
        const rb = getChucVuRank(b.chucVu);
        if (ra !== rb) return ra - rb;
        return (a.hoTen || "").localeCompare(b.hoTen || "", "vi");
      });
    }, [data]);

    const filtered = useMemo(() => {
      const kw = keyword.toLowerCase();
      return sorted.filter((n) => {
        const okKw =
          (n.hoTen || "").toLowerCase().includes(kw) ||
          (n.chucVu || "").toLowerCase().includes(kw) ||
          (n.soDienThoai || "").includes(keyword);
        return okKw && (donViFilter ? n.donVi === donViFilter : true);
      });
    }, [sorted, keyword, donViFilter]);

    if (loading) return h(TableSkeleton);
    if (error) return h(ErrorBox, { error });

    return h("div", null,
      h(BirthdayBanner, { nhanSu: data }),

      h("div", { className: "mb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-1" },
        h("div", null,
          h("h1", { className: "text-lg sm:text-xl font-semibold text-slate-800" }, "Danh sách nhân sự"),
          h("p", { className: "text-xs sm:text-sm text-slate-500" },
            `Hiển thị ${filtered.length} / ${data.length} nhân sự`
          )
        )
      ),

      h("div", { className: "bg-white rounded-xl shadow-card ring-1 ring-slate-100 p-2.5 mb-4 flex flex-col sm:flex-row gap-2" },
        h("div", { className: "relative flex-1" },
          h("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" }, "🔎"),
          h("input", {
            type: "text",
            placeholder: "Tìm tên, chức vụ, SĐT...",
            value: keyword,
            onChange: (e) => setKeyword(e.target.value),
            className: "w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition",
          })
        ),
        h("div", { className: "flex gap-2" },
          h("select", {
            value: donViFilter,
            onChange: (e) => setDonViFilter(e.target.value),
            className: "flex-1 sm:w-auto px-2 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm focus:border-brand-400 outline-none",
          },
            h("option", { value: "" }, "Tất cả đơn vị"),
            danhSachDonVi.map((dv) => h("option", { key: dv, value: dv }, dv))
          ),
          h("div", { className: "inline-flex rounded-lg border border-slate-200 overflow-hidden shrink-0" },
            ["card", "table"].map((m) =>
              h("button", {
                key: m,
                onClick: () => setViewMode(m),
                className: `px-3 py-2 text-xs sm:text-sm font-medium transition ${
                  viewMode === m ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`,
              }, m === "card" ? "Thẻ" : "Bảng")
            )
          )
        )
      ),

      filtered.length === 0
        ? h("div", { className: "bg-white rounded-xl shadow-card ring-1 ring-slate-100 py-12 text-center" },
            h("div", { className: "text-3xl mb-2" }, "🔍"),
            h("p", { className: "text-sm text-slate-600 font-medium" }, "Không tìm thấy nhân sự phù hợp")
          )
        : viewMode === "card"
          ? h("div", { className: "grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" },
              filtered.map((n) =>
                h(NhanSuCard, {
                  key: n.id || n.hoTen,
                  n,
                  onClick: () => setSelectedCanBo(n.hoTen),
                })
              )
            )
          : h("div", { className: "bg-white rounded-xl shadow-card ring-1 ring-slate-100 overflow-hidden" },
              h("div", { className: "overflow-x-auto" },
                h("table", { className: "w-full text-sm" },
                  h("thead", { className: "bg-slate-50 text-slate-500 text-[10px] sm:text-xs uppercase tracking-wide" },
                    h("tr", null,
                      ["Nhân sự", "Chức vụ", "SĐT", "Ngày sinh"].map((x) =>
                        h("th", { key: x, className: "px-3 sm:px-4 py-3 text-left font-medium whitespace-nowrap" }, x))
                    )
                  ),
                  h("tbody", { className: "divide-y divide-slate-100" },
                    filtered.map((n) => {
                      const isBday = isBirthdayToday(n.ngaySinh);
                      return h("tr", {
                        key: n.id || n.hoTen,
                        className: `hover:bg-slate-50 ${isBday ? "bg-pink-50/50" : ""}`,
                      },
                        h("td", { className: "px-3 sm:px-4 py-3" },
                          h("div", { className: "flex items-center gap-2 sm:gap-3" },
                            h(Avatar, { src: n.avatar, name: n.hoTen, size: 32 }),
                            h("button", {
                              onClick: () => setSelectedCanBo(n.hoTen),
                              className: "font-medium text-brand-700 hover:underline text-left truncate max-w-[120px] sm:max-w-none",
                            }, n.hoTen || "—"),
                            isBday ? h("span", { className: "text-sm" }, "🎂") : null
                          )
                        ),
                        h("td", { className: "px-3 sm:px-4 py-3 text-slate-700 whitespace-nowrap" }, n.chucVu || "—"),
                        h("td", { className: "px-3 sm:px-4 py-3 text-slate-700 whitespace-nowrap" }, n.soDienThoai || "—"),
                        h("td", { className: `px-3 sm:px-4 py-3 whitespace-nowrap ${isBday ? "text-pink-600 font-bold" : "text-slate-700"}` }, formatDate(n.ngaySinh))
                      );
                    })
                  )
                )
              )
            ),

      selectedCanBo
        ? h(CanBoDetail, {
            tenCanBo: selectedCanBo,
            data: dnData,
            onClose: () => setSelectedCanBo(null),
          })
        : null
    );
  }

  // ============================================================
  // TRA CỨU MST
  // ============================================================
  function TraCuuMST({ data }) {
    const [mst, setMst] = useState("");
    const ketQua = useMemo(() => {
      const key = normalizeMST(mst);
      if (!key) return null;
      return data.filter((d) => normalizeMST(getMST(d)).includes(key));
    }, [mst, data]);

    return h("div", {
      className: "bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl sm:rounded-2xl shadow-pop p-4 sm:p-6 mb-5 text-white",
    },
      h("div", { className: "flex items-start gap-2 sm:gap-3 mb-3" },
        h("div", { className: "w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/15 flex items-center justify-center text-lg sm:text-xl shrink-0" }, "🔍"),
        h("div", null,
          h("h2", { className: "text-base sm:text-lg font-semibold" }, "Tra cứu cán bộ theo MST"),
          h("p", { className: "text-[11px] sm:text-sm text-white/70" }, "Nhập mã số thuế để tìm cán bộ phụ trách.")
        )
      ),
      h("input", {
        type: "text",
        placeholder: "Ví dụ: 0101234567",
        value: mst,
        onChange: (e) => setMst(e.target.value),
        className: "w-full px-3 py-2 rounded-lg bg-white/95 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/60 text-sm",
      }),
      ketQua === null
        ? null
        : ketQua.length === 0
          ? h("div", { className: "mt-3 text-xs sm:text-sm bg-rose-500/20 ring-1 ring-rose-300/40 rounded-lg p-2.5" },
              `Không tìm thấy doanh nghiệp có MST "${mst}".`
            )
          : h("div", { className: "mt-3 space-y-2 sm:space-y-3" },
              ketQua.map((d, i) =>
                h("div", { key: i, className: "bg-white text-slate-800 rounded-xl p-3 sm:p-4 shadow-card" },
                  h("div", { className: "flex flex-wrap items-center justify-between gap-2" },
                    h("div", null,
                      h("p", { className: "text-[10px] text-slate-500 uppercase tracking-wider" }, "MST"),
                      h("p", { className: "font-mono font-semibold text-slate-800 text-sm" }, getMST(d) || "—")
                    ),
                    h(Badge, { color: "blue" }, d["CQT quản lý"] || "—")
                  ),
                  h("p", { className: "font-semibold text-brand-700 mt-1.5 text-sm sm:text-base line-clamp-2" }, d["Tên NNT"] || "—"),
                  h("div", { className: "mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] sm:text-sm" },
                    h("div", { className: "flex items-center gap-1.5" },
                      h("span", { className: "text-slate-400" }, "👤"),
                      h("span", { className: "text-slate-500" }, "Cán bộ:"),
                      h("span", { className: "font-medium text-slate-800" }, d["Tên cán bộ quản lý"] || "—")
                    )
                  )
                )
              )
            )
    );
  }

  // ============================================================
  // VIEW: DOANH NGHIỆP
  // ============================================================
  function DoanhNghiepView({ dnData, dnLoading, dnError }) {
    const data = dnData;
    const [keyword, setKeyword] = useState("");
    const [cqtFilter, setCqtFilter] = useState("");
    const [selectedCanBo, setSelectedCanBo] = useState(null);

    const danhSachCQT = useMemo(
      () => [...new Set(data.map((d) => d["CQT quản lý"]).filter(Boolean))].sort(),
      [data]
    );

    const filtered = useMemo(() => {
      const kw = keyword.toLowerCase();
      return data.filter((d) => {
        const okKw =
          (d["Tên NNT"] || "").toLowerCase().includes(kw) ||
          (getMST(d) || "").toLowerCase().includes(kw) ||
          (d["Tên cán bộ quản lý"] || "").toLowerCase().includes(kw);
        return okKw && (cqtFilter ? d["CQT quản lý"] === cqtFilter : true);
      });
    }, [data, keyword, cqtFilter]);

    if (dnLoading) return h(TableSkeleton);
    if (dnError) return h(ErrorBox, { error: dnError });

    return h("div", null,
      h(TraCuuMST, { data }),

      h("div", { className: "mb-3" },
        h("h1", { className: "text-lg sm:text-xl font-semibold text-slate-800" }, "Danh sách doanh nghiệp"),
        h("p", { className: "text-xs sm:text-sm text-slate-500" },
          `Hiển thị ${filtered.length} / ${data.length} doanh nghiệp`
        )
      ),

      h("div", { className: "bg-white rounded-xl shadow-card ring-1 ring-slate-100 p-2.5 mb-4 flex flex-col sm:flex-row gap-2" },
        h("div", { className: "relative flex-1" },
          h("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" }, "🔎"),
          h("input", {
            type: "text",
            placeholder: "Tìm tên NNT, MST, cán bộ...",
            value: keyword,
            onChange: (e) => setKeyword(e.target.value),
            className: "w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-brand-400 outline-none text-sm transition",
          })
        ),
        h("select", {
          value: cqtFilter,
          onChange: (e) => setCqtFilter(e.target.value),
          className: "px-2 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm focus:border-brand-400 outline-none",
        },
          h("option", { value: "" }, "Tất cả CQT"),
          danhSachCQT.map((x) => h("option", { key: x, value: x }, x))
        )
      ),

      filtered.length === 0
        ? h("div", { className: "bg-white rounded-xl shadow-card py-12 text-center" },
            h("p", { className: "text-sm text-slate-600" }, "Không tìm thấy dữ liệu.")
          )
        : h("div", { className: "bg-white rounded-xl shadow-card ring-1 ring-slate-100 overflow-hidden" },
            h("div", { className: "overflow-x-auto" },
              h("table", { className: "w-full text-sm" },
                h("thead", { className: "bg-slate-50 text-slate-500 text-[10px] sm:text-xs uppercase tracking-wide" },
                  h("tr", null,
                    ["Mã số thuế", "Tên NNT", "Cán bộ quản lý"].map((x) =>
                      h("th", { key: x, className: "px-3 sm:px-4 py-3 text-left font-medium whitespace-nowrap" }, x))
                  )
                ),
                h("tbody", { className: "divide-y divide-slate-100" },
                  filtered.map((d, i) =>
                    h("tr", { key: i, className: "hover:bg-slate-50/70" },
                      h("td", { className: "px-3 sm:px-4 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap" }, getMST(d) || "—"),
                      h("td", { className: "px-3 sm:px-4 py-3 font-medium text-slate-800 min-w-[150px]" }, d["Tên NNT"] || "—"),
                      h("td", { className: "px-3 sm:px-4 py-3 whitespace-nowrap" },
                        d["Tên cán bộ quản lý"]
                          ? h("button", {
                              onClick: () => setSelectedCanBo(d["Tên cán bộ quản lý"]),
                              className: "text-brand-700 hover:underline font-medium",
                            }, d["Tên cán bộ quản lý"])
                          : "—"
                      )
                    )
                  )
                )
              )
            )
          ),

      selectedCanBo
        ? h(CanBoDetail, {
            tenCanBo: selectedCanBo,
            data,
            onClose: () => setSelectedCanBo(null),
          })
        : null
    );
  }

  // ============================================================
  // HEADER & LAYOUT
  // ============================================================
  function Header({ tab, setTab }) {
    const tabs = [
      { id: "nhansu", label: "Nhân sự", icon: "👥" },
      { id: "doanhnghiep", label: "Doanh nghiệp", icon: "🏢" },
    ];

    return h("header", {
      className: "sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm",
    },
      h("div", { className: "max-w-7xl mx-auto px-3 sm:px-6" },
        h("div", { className: "h-14 sm:h-16 flex items-center justify-between gap-2" },
          h("div", { className: "flex items-center gap-2 shrink-0" },
            h("div", {
              className: "w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0",
            }, "Q"),
            h("div", { className: "leading-tight" },
              h("p", { className: "font-bold text-slate-800 text-[13px] sm:text-base whitespace-nowrap" }, "Phòng QLHTDN số 2"),
              h("p", { className: "text-[10px] sm:text-xs text-slate-500 whitespace-nowrap" }, "Nhân sự & Doanh nghiệp")
            )
          ),
          h("nav", { className: "flex items-center bg-slate-100 p-1 rounded-lg shrink-0" },
            tabs.map((t) =>
              h("button", {
                key: t.id,
                onClick: () => setTab(t.id),
                className: `px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                  tab === t.id
                    ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`,
              },
                h("span", { className: "text-sm sm:text-base" }, t.icon),
                h("span", { className: "hidden sm:inline" }, t.label)
              )
            )
          )
        )
      )
    );
  }

  function App() {
    const [tab, setTab] = useState("nhansu");
    const dn = useDoanhNghiepData();

    return h("div", { className: "min-h-screen flex flex-col" },
      h(Header, { tab, setTab }),
      h("main", { className: "flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6" },
        tab === "nhansu"
          ? h(NhanSuView, { dnData: dn.data })
          : h(DoanhNghiepView, {
              dnData: dn.data,
              dnLoading: dn.loading,
              dnError: dn.error,
            })
      ),
      h("footer", { className: "border-t border-slate-200 bg-white" },
        h("div", { className: "max-w-7xl mx-auto px-3 sm:px-6 py-3 text-[10px] sm:text-xs text-slate-500 flex items-center justify-between" },
          h("span", null, "© ", new Date().getFullYear(), " ", "Phòng QLHTDN số 2"),
          h("span", null, "Dữ liệu: Google Sheets")
        )
      )
    );
  }

  // ============================================================
  // RENDER APP
  // ============================================================
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("[components.js] Không tìm thấy thẻ #root trong HTML.");
  } else {
    ReactDOM.createRoot(rootEl).render(h(App));
  }
})();
