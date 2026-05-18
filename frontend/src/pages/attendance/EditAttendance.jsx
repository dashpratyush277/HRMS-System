import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttendanceById, updateAttendance } from "../../api/attendanceApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import FormSection     from "../../components/FormSection";
import LoadingSpinner  from "../../components/LoadingSpinner";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${
    err ? "border-red-500" : "border-slate-700"
  } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`;

const selectCls =
  "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors";

const Label = ({ children }) => (
  <label className="block text-xs font-medium text-slate-400 mb-1.5">{children}</label>
);

const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

const EditAttendance = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [record,     setRecord]     = useState(null);
  const [form,       setForm]       = useState({ status: "", checkIn: "", checkOut: "", remarks: "" });
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [apiError,   setApiError]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAttendanceById(id)
      .then((r) => {
        const rec = r.data.record;
        setRecord(rec);
        setForm({
          status:   rec.status   || "present",
          checkIn:  rec.checkIn  || "",
          checkOut: rec.checkOut || "",
          remarks:  rec.remarks  || "",
        });
      })
      .catch(() => setFetchError("Attendance record not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true);
    setApiError("");
    try {
      await updateAttendance(id, form);
      navigate("/attendance");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update record.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading record…" /></DashboardLayout>;

  if (fetchError) return (
    <DashboardLayout>
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">{fetchError}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Edit Attendance"
        action={
          <button
            onClick={() => navigate("/attendance")}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            ← Back
          </button>
        }
      />

      {/* Record info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-5">
        <p className="text-sm text-white font-medium">
          {record.employee?.firstName} {record.employee?.lastName}
          <span className="text-slate-500 font-mono text-xs ml-2">{record.employee?.employeeId}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">{fmt(record.date)}</p>
      </div>

      {apiError && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Update Attendance">
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half Day</option>
              <option value="leave">Leave</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
          <div />
          <div>
            <Label>Check In Time</Label>
            <input type="time" value={form.checkIn}  onChange={(e) => set("checkIn",  e.target.value)} className={inputCls(false)} />
          </div>
          <div>
            <Label>Check Out Time</Label>
            <input type="time" value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} className={inputCls(false)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Remarks</Label>
            <input value={form.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Optional notes…" className={inputCls(false)} />
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
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default EditAttendance;
