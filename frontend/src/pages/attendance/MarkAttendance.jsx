import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { markAttendance } from "../../api/attendanceApi";
import { getEmployees }   from "../../api/employeeApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import FormSection     from "../../components/FormSection";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${
    err ? "border-red-500" : "border-slate-700"
  } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`;

const selectCls =
  "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors";

const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-400 mb-1.5">
    {children}{required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

const today = new Date().toISOString().split("T")[0];

const INITIAL = { employeeId: "", date: today, status: "present", checkIn: "", checkOut: "", remarks: "" };

const MarkAttendance = () => {
  const navigate = useNavigate();

  const [form,       setForm]       = useState(INITIAL);
  const [errors,     setErrors]     = useState({});
  const [apiError,   setApiError]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [employees,  setEmployees]  = useState([]);

  useEffect(() => {
    getEmployees({ limit: 500, status: "active" })
      .then((r) => setEmployees(r.data.employees || []))
      .catch(() => {});
  }, []);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.employeeId) e.employeeId = "Select an employee.";
    if (!form.date)       e.date       = "Date is required.";
    if (!form.status)     e.status     = "Status is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    setApiError("");
    try {
      await markAttendance(form);
      navigate("/attendance");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Mark Attendance"
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
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Attendance Details">
          <div>
            <Label required>Employee</Label>
            <select
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
              className={errors.employeeId ? `${selectCls} border-red-500` : selectCls}
            >
              <option value="">— Select employee —</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
            {errors.employeeId && <p className="text-red-400 text-xs mt-1">{errors.employeeId}</p>}
          </div>

          <div>
            <Label required>Date</Label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputCls(errors.date)}
            />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>

          <div>
            <Label required>Status</Label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={selectCls}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half Day</option>
              <option value="leave">Leave</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          <div>
            <Label>Check In Time</Label>
            <input
              type="time"
              value={form.checkIn}
              onChange={(e) => set("checkIn", e.target.value)}
              className={inputCls(false)}
            />
          </div>

          <div>
            <Label>Check Out Time</Label>
            <input
              type="time"
              value={form.checkOut}
              onChange={(e) => set("checkOut", e.target.value)}
              className={inputCls(false)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label>Remarks</Label>
            <input
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              placeholder="Optional notes…"
              className={inputCls(false)}
            />
          </div>
        </FormSection>

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
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Saving…" : "Mark Attendance"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default MarkAttendance;
