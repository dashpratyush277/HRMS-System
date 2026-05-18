import { useState, useEffect, useCallback } from "react";
import { getMyAttendance } from "../../api/attendanceApi";
import DashboardLayout       from "../../components/DashboardLayout";
import PageHeader            from "../../components/PageHeader";
import AttendanceStatusBadge from "../../components/AttendanceStatusBadge";
import AttendanceSummaryCard from "../../components/AttendanceSummaryCard";
import LoadingSpinner        from "../../components/LoadingSpinner";
import EmptyState            from "../../components/EmptyState";

const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const SUMMARY_CARDS = [
  { key: "present",   label: "Present",  color: "green",  icon: "✅" },
  { key: "absent",    label: "Absent",   color: "red",    icon: "❌" },
  { key: "half-day",  label: "Half Day", color: "yellow", icon: "🌓" },
  { key: "leave",     label: "On Leave", color: "blue",   icon: "🏖️" },
  { key: "holiday",   label: "Holidays", color: "purple", icon: "🎉" },
];

const MyAttendance = () => {
  const now = new Date();
  const [records,    setRecords]    = useState([]);
  const [summary,    setSummary]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [month,      setMonth]      = useState(now.getMonth() + 1);
  const [year,       setYear]       = useState(now.getFullYear());
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAttendance({ month, year, page, limit: 31 });
      setRecords(res.data.records);
      setSummary(res.data.summary || {});
      setPagination(res.data.pagination);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [month, year, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { setPage(1); }, [month, year]);

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <PageHeader title="My Attendance" />

      {/* Month/Year filter */}
      <div className="flex gap-3 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {["January","February","March","April","May","June",
            "July","August","September","October","November","December"].map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {SUMMARY_CARDS.map(({ key, label, color, icon }) => (
          <AttendanceSummaryCard
            key={key}
            label={label}
            value={summary[key] ?? 0}
            color={color}
            icon={icon}
          />
        ))}
      </div>

      {/* Records table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading attendance…" />
        ) : records.length === 0 ? (
          <EmptyState message="No attendance records for this period." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {["Date", "Status", "Check In", "Check Out", "Hours", "Remarks"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-slate-300">{fmt(r.date)}</td>
                    <td className="px-5 py-3.5"><AttendanceStatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5 text-slate-400">{r.checkIn  || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400">{r.checkOut || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400">{r.totalHours > 0 ? `${r.totalHours}h` : "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400">{r.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * 31 + 1}–{Math.min(page * 31, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyAttendance;
