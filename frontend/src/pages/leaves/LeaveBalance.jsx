import { useState, useEffect } from "react";
import { getEmployees }       from "../../api/employeeApi";
import { getLeaveBalance, updateLeaveBalance } from "../../api/leaveApi";
import DashboardLayout  from "../../components/DashboardLayout";
import PageHeader       from "../../components/PageHeader";
import LeaveBalanceCard from "../../components/LeaveBalanceCard";
import LoadingSpinner   from "../../components/LoadingSpinner";

const inputCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors";

const LEAVE_FIELDS = [
  { key: "casual",    label: "Casual Leaves",    color: "blue"   },
  { key: "sick",      label: "Sick Leaves",      color: "red"    },
  { key: "earned",    label: "Earned Leaves",    color: "green"  },
  { key: "maternity", label: "Maternity Leaves", color: "pink"   },
  { key: "paternity", label: "Paternity Leaves", color: "indigo" },
  { key: "unpaid",    label: "Unpaid Leaves",    color: "orange" },
];

const LeaveBalance = () => {
  const [employees,   setEmployees]   = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [year,        setYear]        = useState(new Date().getFullYear());
  const [balance,     setBalance]     = useState(null);
  const [form,        setForm]        = useState({});
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState("");
  const [apiError,    setApiError]    = useState("");

  useEffect(() => {
    getEmployees({ limit: 500 }).then((r) => setEmployees(r.data.employees || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEmp) return;
    setLoading(true); setBalance(null); setSuccess(""); setApiError("");
    getLeaveBalance(selectedEmp, { year })
      .then((r) => {
        const b = r.data.balance;
        setBalance(b);
        setForm({ casual: b.casual, sick: b.sick, earned: b.earned, maternity: b.maternity, paternity: b.paternity, unpaid: b.unpaid });
      })
      .catch(() => setApiError("Failed to load balance."))
      .finally(() => setLoading(false));
  }, [selectedEmp, year]);

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaving(true); setSuccess(""); setApiError("");
    try {
      const res = await updateLeaveBalance(selectedEmp, form, { year });
      setBalance(res.data.balance);
      setSuccess("Leave balance updated successfully.");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update balance.");
    } finally {
      setSaving(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i + 1);

  return (
    <DashboardLayout>
      <PageHeader title="Leave Balance Management" />

      {/* Employee + Year picker */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Employee</label>
          <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}
            className={inputCls}>
            <option value="">— Select an employee —</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Year</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className={inputCls}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading balance…" />}

      {apiError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{apiError}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">{success}</div>
      )}

      {balance && !loading && (
        <>
          {/* Balance overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {LEAVE_FIELDS.map((f) => (
              <LeaveBalanceCard
                key={f.key}
                title={f.label}
                total={balance[f.key] || 0}
                used={balance[`used${f.key.charAt(0).toUpperCase()+f.key.slice(1)}`] || 0}
                available={(balance[`available${f.key.charAt(0).toUpperCase()+f.key.slice(1)}`]) || 0}
                color={f.color}
              />
            ))}
          </div>

          {/* Edit form */}
          <form onSubmit={handleSave}>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-5">
              <h3 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-slate-800">
                Update Allocated Days
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {LEAVE_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 capitalize">{f.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={form[f.key] ?? 0}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 transition-colors">
                {saving ? "Saving…" : "Save Balance"}
              </button>
            </div>
          </form>
        </>
      )}

      {!selectedEmp && !loading && (
        <div className="text-center py-16 text-slate-500 text-sm">
          Select an employee above to view and edit their leave balance.
        </div>
      )}
    </DashboardLayout>
  );
};

export default LeaveBalance;
