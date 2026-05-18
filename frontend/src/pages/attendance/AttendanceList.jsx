import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAttendance, deleteAttendance } from "../../api/attendanceApi";
import { getDepartments }                  from "../../api/departmentApi";
import DashboardLayout        from "../../components/DashboardLayout";
import PageHeader             from "../../components/PageHeader";
import AttendanceStatusBadge  from "../../components/AttendanceStatusBadge";
import ConfirmModal           from "../../components/ConfirmModal";
import LoadingSpinner         from "../../components/LoadingSpinner";
import EmptyState             from "../../components/EmptyState";

const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const AttendanceList = () => {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [date,        setDate]        = useState(today);
  const [month,       setMonth]       = useState("");
  const [year,        setYear]        = useState("");
  const [status,      setStatus]      = useState("");
  const [department,  setDepartment]  = useState("");
  const [departments, setDepartments] = useState([]);
  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState(null);
  const [toDelete,    setToDelete]    = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    getDepartments({ limit: 100 })
      .then((r) => setDepartments(r.data.departments || []))
      .catch(() => {});
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (date)       params.date       = date;
      if (month)      params.month      = month;
      if (year)       params.year       = year;
      if (status)     params.status     = status;
      if (department) params.department = department;
      const res = await getAttendance(params);
      setRecords(res.data.records);
      setPagination(res.data.pagination);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [date, month, year, status, department, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { setPage(1); }, [date, month, year, status, department]);

  const handleDelete = async () => {
    try {
      await deleteAttendance(toDelete._id);
      setToDelete(null);
      fetchRecords();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete record.");
      setToDelete(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <PageHeader
        title="Attendance"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/attendance/bulk")}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
            >
              Bulk Mark
            </button>
            <button
              onClick={() => navigate("/attendance/mark")}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
            >
              + Mark Single
            </button>
          </div>
        }
      />

      {deleteError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {deleteError}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setMonth(""); setYear(""); }}
          className="col-span-2 sm:col-span-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <select
          value={month}
          onChange={(e) => { setMonth(e.target.value); setDate(""); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Months</option>
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => { setYear(e.target.value); setDate(""); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half Day</option>
          <option value="leave">Leave</option>
          <option value="holiday">Holiday</option>
        </select>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Depts</option>
          {departments.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading records…" />
        ) : records.length === 0 ? (
          <EmptyState message="No attendance records found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {["Employee", "Date", "Status", "Check In", "Check Out", "Hours", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">
                        {r.employee?.firstName} {r.employee?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">{r.employee?.employeeId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{fmt(r.date)}</td>
                    <td className="px-5 py-3.5"><AttendanceStatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5 text-slate-400">{r.checkIn  || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400">{r.checkOut || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400">{r.totalHours > 0 ? `${r.totalHours}h` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/attendance/${r._id}/edit`)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setDeleteError(""); setToDelete(r); }}
                          className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, pagination.total)} of {pagination.total}
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

      {toDelete && (
        <ConfirmModal
          title="Delete Attendance Record"
          message={`Delete attendance record for ${toDelete.employee?.firstName} ${toDelete.employee?.lastName} on ${fmt(toDelete.date)}?`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default AttendanceList;
