import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { bulkMarkAttendance }  from "../../api/attendanceApi";
import { getEmployees }        from "../../api/employeeApi";
import DashboardLayout        from "../../components/DashboardLayout";
import PageHeader             from "../../components/PageHeader";
import LoadingSpinner         from "../../components/LoadingSpinner";

const selectCls =
  "w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition-colors";

const today = new Date().toISOString().split("T")[0];

const BulkAttendance = () => {
  const navigate = useNavigate();

  const [employees,  setEmployees]  = useState([]);
  const [records,    setRecords]    = useState([]);
  const [date,       setDate]       = useState(today);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState("");
  const [success,    setSuccess]    = useState(null);

  useEffect(() => {
    getEmployees({ limit: 500, status: "active" })
      .then((r) => {
        const emps = r.data.employees || [];
        setEmployees(emps);
        setRecords(
          emps.map((emp) => ({
            employeeId: emp._id,
            status:    "present",
            checkIn:   "",
            checkOut:  "",
            remarks:   "",
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateRecord = (index, field, value) => {
    setRecords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!date) { setApiError("Please select a date."); return; }

    setSubmitting(true);
    setApiError("");
    setSuccess(null);
    try {
      const payload = records.map((r) => ({ ...r, date }));
      const res = await bulkMarkAttendance(payload);
      setSuccess(res.data.results);
    } catch (err) {
      setApiError(err.response?.data?.message || "Bulk mark failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading employees…" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title="Bulk Mark Attendance"
        action={
          <button
            onClick={() => navigate("/attendance")}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            ← Back
          </button>
        }
      />

      {apiError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {apiError}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
          Saved {success.success} records.
          {success.failed > 0 && ` ${success.failed} failed.`}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Date picker */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <label className="text-sm font-medium text-slate-400 flex-shrink-0">Attendance Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 ml-auto">{employees.length} active employees</p>
        </div>

        {/* Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {["Employee", "ID", "Status", "Check In", "Check Out", "Remarks"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {employees.map((emp, idx) => (
                  <tr key={emp._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-white whitespace-nowrap">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{emp.employeeId}</td>
                    <td className="px-4 py-2.5 w-32">
                      <select
                        value={records[idx]?.status || "present"}
                        onChange={(e) => updateRecord(idx, "status", e.target.value)}
                        className={selectCls}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half-day">Half Day</option>
                        <option value="leave">Leave</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 w-28">
                      <input
                        type="time"
                        value={records[idx]?.checkIn || ""}
                        onChange={(e) => updateRecord(idx, "checkIn", e.target.value)}
                        className={`${selectCls} cursor-pointer`}
                      />
                    </td>
                    <td className="px-4 py-2.5 w-28">
                      <input
                        type="time"
                        value={records[idx]?.checkOut || ""}
                        onChange={(e) => updateRecord(idx, "checkOut", e.target.value)}
                        className={`${selectCls} cursor-pointer`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={records[idx]?.remarks || ""}
                        onChange={(e) => updateRecord(idx, "remarks", e.target.value)}
                        placeholder="Optional"
                        className={`${selectCls} min-w-32`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/attendance")}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || employees.length === 0}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Saving…" : `Save Attendance (${employees.length})`}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default BulkAttendance;
