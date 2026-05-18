import { useState, useEffect } from "react";
import { useNavigate }  from "react-router-dom";
import { useAuth }      from "../../context/AuthContext";
import { applyLeave, getMyLeaveBalance, getLeaveBalance } from "../../api/leaveApi";
import { getEmployees } from "../../api/employeeApi";
import DashboardLayout  from "../../components/DashboardLayout";
import PageHeader       from "../../components/PageHeader";
import FormSection      from "../../components/FormSection";
import LeaveBalanceCard from "../../components/LeaveBalanceCard";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`;

const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors";
const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-400 mb-1.5">{children}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
);

const LEAVE_TYPES = ["casual","sick","earned","maternity","paternity","unpaid"];
const INITIAL = { employeeId: "", leaveType: "", startDate: "", endDate: "", reason: "" };

const ApplyLeave = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const isHRAdmin = user?.role === "admin" || user?.role === "hr";

  const [form,       setForm]       = useState(INITIAL);
  const [errors,     setErrors]     = useState({});
  const [apiError,   setApiError]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [employees,  setEmployees]  = useState([]);
  const [balance,    setBalance]    = useState(null);
  const [totalDays,  setTotalDays]  = useState(0);

  useEffect(() => {
    if (isHRAdmin) {
      getEmployees({ limit: 500, status: "active" })
        .then((r) => setEmployees(r.data.employees || []))
        .catch(() => {});
    } else {
      // Load own balance
      getMyLeaveBalance().then((r) => setBalance(r.data.balance)).catch(() => {});
    }
  }, [isHRAdmin]);

  // Calculate total days when dates change
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const s = new Date(form.startDate);
      const e = new Date(form.endDate);
      if (e >= s) {
        setTotalDays(Math.round((e - s) / 86400000) + 1);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [form.startDate, form.endDate]);

  // Load balance when HR/Admin selects an employee
  useEffect(() => {
    if (isHRAdmin && form.employeeId) {
      getLeaveBalance(form.employeeId).then((r) => setBalance(r.data.balance)).catch(() => setBalance(null));
    }
  }, [isHRAdmin, form.employeeId]);

  const set = (field, value) => { setForm((f) => ({ ...f, [field]: value })); setErrors((e) => ({ ...e, [field]: "" })); };

  const validate = () => {
    const e = {};
    if (isHRAdmin && !form.employeeId) e.employeeId = "Select an employee.";
    if (!form.leaveType)  e.leaveType  = "Leave type is required.";
    if (!form.startDate)  e.startDate  = "Start date is required.";
    if (!form.endDate)    e.endDate    = "End date is required.";
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate))
      e.endDate = "End date cannot be before start date.";
    if (!form.reason.trim()) e.reason  = "Reason is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true); setApiError("");
    try {
      await applyLeave(isHRAdmin ? form : { leaveType: form.leaveType, startDate: form.startDate, endDate: form.endDate, reason: form.reason });
      navigate(isHRAdmin ? "/leaves" : "/my-leaves");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to apply leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const BALANCE_CARDS = balance ? [
    { key: "casual",    title: "Casual",    total: balance.casual,    used: balance.usedCasual,    available: balance.availableCasual,    color: "blue"   },
    { key: "sick",      title: "Sick",      total: balance.sick,      used: balance.usedSick,      available: balance.availableSick,      color: "red"    },
    { key: "earned",    title: "Earned",    total: balance.earned,    used: balance.usedEarned,    available: balance.availableEarned,    color: "green"  },
    { key: "maternity", title: "Maternity", total: balance.maternity, used: balance.usedMaternity, available: balance.availableMaternity, color: "pink"   },
    { key: "paternity", title: "Paternity", total: balance.paternity, used: balance.usedPaternity, available: balance.availablePaternity, color: "indigo" },
  ] : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Apply for Leave"
        action={
          <button onClick={() => navigate(isHRAdmin ? "/leaves" : "/my-leaves")}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">
            ← Back
          </button>
        }
      />

      {apiError && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{apiError}</div>
      )}

      {/* Balance cards */}
      {balance && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {BALANCE_CARDS.map((b) => <LeaveBalanceCard key={b.key} {...b} />)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Leave Details">
          {isHRAdmin && (
            <div>
              <Label required>Employee</Label>
              <select value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)}
                className={errors.employeeId ? `${selectCls} border-red-500` : selectCls}>
                <option value="">— Select employee —</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                ))}
              </select>
              {errors.employeeId && <p className="text-red-400 text-xs mt-1">{errors.employeeId}</p>}
            </div>
          )}

          <div>
            <Label required>Leave Type</Label>
            <select value={form.leaveType} onChange={(e) => set("leaveType", e.target.value)}
              className={errors.leaveType ? `${selectCls} border-red-500` : selectCls}>
              <option value="">— Select type —</option>
              {LEAVE_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
            {errors.leaveType && <p className="text-red-400 text-xs mt-1">{errors.leaveType}</p>}
          </div>

          <div>
            <Label required>Start Date</Label>
            <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls(errors.startDate)} />
            {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <Label required>End Date</Label>
            <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls(errors.endDate)} />
            {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
          </div>

          {totalDays > 0 && (
            <div className="sm:col-span-2">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-sm">
                Total days: <span className="font-bold">{totalDays}</span>
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <Label required>Reason</Label>
            <textarea value={form.reason} onChange={(e) => set("reason", e.target.value)}
              rows={3} placeholder="Briefly describe the reason for your leave…"
              className={`${inputCls(errors.reason)} resize-none`} />
            {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason}</p>}
          </div>
        </FormSection>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(isHRAdmin ? "/leaves" : "/my-leaves")}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 transition-colors">
            {submitting ? "Submitting…" : "Apply Leave"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default ApplyLeave;
