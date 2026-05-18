import { useState, useEffect } from "react";
import { useNavigate }          from "react-router-dom";
import { generateBulkPayroll }  from "../../api/payrollApi";
import { getEmployees }         from "../../api/employeeApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import FormSection     from "../../components/FormSection";

const inputCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors";
const selectCls = inputCls;
const Label = ({ children }) => (
  <label className="block text-xs font-medium text-slate-400 mb-1.5">{children}</label>
);

const now = new Date();
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const INITIAL_DEFAULTS = {
  hra: "", allowances: 0, bonus: 0,
  tax: 0, providentFund: "", insurance: 0, otherDeductions: 0,
  totalWorkingDays: 26, paymentMethod: "bank-transfer", remarks: "",
};

const BulkPayroll = () => {
  const navigate = useNavigate();

  const [month,       setMonth]       = useState(now.getMonth() + 1);
  const [year,        setYear]        = useState(now.getFullYear());
  const [employees,   setEmployees]   = useState([]);
  const [allActive,   setAllActive]   = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [defaults,    setDefaults]    = useState(INITIAL_DEFAULTS);
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [apiError,    setApiError]    = useState("");

  useEffect(() => {
    getEmployees({ limit: 500, status: "active" }).then((r) => setEmployees(r.data.employees || [])).catch(() => {});
  }, []);

  const toggleEmployee = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const setDef = (field, value) => setDefaults((d) => ({ ...d, [field]: value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true); setApiError(""); setResult(null);
    try {
      const payload = {
        month, year,
        employeeIds: allActive ? [] : selectedIds,
        defaultValues: {
          ...defaults,
          hra:           defaults.hra           !== "" ? Number(defaults.hra)           : undefined,
          providentFund: defaults.providentFund !== "" ? Number(defaults.providentFund) : undefined,
        },
      };
      const res = await generateBulkPayroll(payload);
      setResult(res.data);
    } catch (err) {
      setApiError(err.response?.data?.message || "Bulk generation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i + 1);

  return (
    <DashboardLayout>
      <PageHeader title="Bulk Generate Payroll"
        action={<button onClick={() => navigate("/payroll")} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">← Back</button>}
      />

      {apiError && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{apiError}</div>}

      {result && (
        <div className="mb-5 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
          {result.message}
          {result.errors?.length > 0 && (
            <p className="text-yellow-400 mt-1 text-xs">{result.errors.length} error(s) — check server logs.</p>
          )}
          <button onClick={() => navigate("/payroll")} className="mt-2 text-xs text-green-300 underline">Go to Payroll List</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Period */}
        <FormSection title="Payroll Period">
          <div>
            <Label>Month</Label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={selectCls}>
              {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <Label>Year</Label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectCls}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </FormSection>

        {/* Employee selection */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-slate-800">Employee Selection</h3>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={allActive} onChange={() => setAllActive(true)} className="accent-blue-500" />
              <span className="text-sm text-slate-300">All active employees ({employees.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!allActive} onChange={() => setAllActive(false)} className="accent-blue-500" />
              <span className="text-sm text-slate-300">Select specific employees</span>
            </label>
          </div>
          {!allActive && (
            <div className="max-h-48 overflow-y-auto border border-slate-700 rounded-xl">
              {employees.map((emp) => (
                <label key={emp._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 cursor-pointer border-b border-slate-800 last:border-0">
                  <input type="checkbox" checked={selectedIds.includes(emp._id)} onChange={() => toggleEmployee(emp._id)} className="accent-blue-500" />
                  <span className="text-sm text-slate-300">{emp.firstName} {emp.lastName}</span>
                  <span className="text-xs text-slate-500 font-mono ml-auto">{emp.employeeId}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Default values */}
        <FormSection title="Default Values (applied to all)">
          {[
            ["hra","HRA (leave blank = 40% of basic)"],
            ["allowances","Allowances"],
            ["bonus","Bonus"],
            ["tax","Tax"],
            ["providentFund","Provident Fund (blank = 12% of basic)"],
            ["insurance","Insurance"],
            ["otherDeductions","Other Deductions"],
            ["totalWorkingDays","Total Working Days"],
          ].map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input type="number" min={0} value={defaults[key]} onChange={(e) => setDef(key, e.target.value)} placeholder="0" className={inputCls} />
            </div>
          ))}
          <div>
            <Label>Payment Method</Label>
            <select value={defaults.paymentMethod} onChange={(e) => setDef("paymentMethod", e.target.value)} className={selectCls}>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div>
            <Label>Remarks</Label>
            <input value={defaults.remarks} onChange={(e) => setDef("remarks", e.target.value)} placeholder="Optional" className={inputCls} />
          </div>
        </FormSection>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/payroll")}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting || (!allActive && selectedIds.length === 0)}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 transition-colors">
            {submitting ? "Generating…" : `Generate for ${allActive ? employees.length : selectedIds.length} employees`}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default BulkPayroll;
