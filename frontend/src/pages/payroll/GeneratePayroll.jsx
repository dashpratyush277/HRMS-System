import { useState, useEffect } from "react";
import { useNavigate }    from "react-router-dom";
import { generatePayroll } from "../../api/payrollApi";
import { getEmployees }    from "../../api/employeeApi";
import DashboardLayout  from "../../components/DashboardLayout";
import PageHeader       from "../../components/PageHeader";
import FormSection      from "../../components/FormSection";
import SalaryPreview    from "../../components/SalaryPreview";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`;
const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors";
const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-400 mb-1.5">{children}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
);

const now = new Date();
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const INITIAL = {
  employee: "", month: now.getMonth() + 1, year: now.getFullYear(),
  hra: 0, allowances: 0, bonus: 0,
  tax: 0, providentFund: 0, insurance: 0, otherDeductions: 0,
  totalWorkingDays: 26, presentDays: 26, paidLeaves: 0, unpaidLeaves: 0, lossOfPay: 0,
  paymentMethod: "bank-transfer", remarks: "",
};

const GeneratePayroll = () => {
  const navigate = useNavigate();
  const [form,       setForm]       = useState(INITIAL);
  const [errors,     setErrors]     = useState({});
  const [apiError,   setApiError]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [employees,  setEmployees]  = useState([]);
  const [basicSalary, setBasicSalary] = useState(0);

  useEffect(() => {
    getEmployees({ limit: 500, status: "active" }).then((r) => setEmployees(r.data.employees || [])).catch(() => {});
  }, []);

  const set = (field, value) => { setForm((f) => ({ ...f, [field]: value })); setErrors((e) => ({ ...e, [field]: "" })); };

  // Auto-suggest HRA + PF when employee changes
  const handleEmployeeChange = (empId) => {
    set("employee", empId);
    const emp = employees.find((e) => e._id === empId);
    if (emp?.basicSalary) {
      const basic = emp.basicSalary;
      setBasicSalary(basic);
      setForm((f) => ({
        ...f,
        employee:      empId,
        hra:           Math.round(basic * 0.4),
        providentFund: Math.round(basic * 0.12),
      }));
    } else {
      setBasicSalary(0);
    }
  };

  // Live calculations
  const n = (v) => Number(v) || 0;
  const gross = basicSalary + n(form.hra) + n(form.allowances) + n(form.bonus);
  const deductions = n(form.tax) + n(form.providentFund) + n(form.insurance) + n(form.otherDeductions) + n(form.lossOfPay);
  const net = Math.max(0, gross - deductions);

  const validate = () => {
    const e = {};
    if (!form.employee) e.employee = "Select an employee.";
    if (!form.month)    e.month    = "Month is required.";
    if (!form.year)     e.year     = "Year is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true); setApiError("");
    try {
      await generatePayroll(form);
      navigate("/payroll");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to generate payroll.");
    } finally {
      setSubmitting(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i + 1);

  return (
    <DashboardLayout>
      <PageHeader title="Generate Payroll"
        action={<button onClick={() => navigate("/payroll")} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">← Back</button>}
      />

      {apiError && <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{apiError}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Employee & Period */}
        <FormSection title="Employee & Period">
          <div>
            <Label required>Employee</Label>
            <select value={form.employee} onChange={(e) => handleEmployeeChange(e.target.value)}
              className={errors.employee ? `${selectCls} border-red-500` : selectCls}>
              <option value="">— Select employee —</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
              ))}
            </select>
            {errors.employee && <p className="text-red-400 text-xs mt-1">{errors.employee}</p>}
          </div>
          {basicSalary > 0 && (
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400">Basic Salary:</span>
              <span className="text-sm font-semibold text-white">${Number(basicSalary).toLocaleString()}</span>
            </div>
          )}
          <div>
            <Label required>Month</Label>
            <select value={form.month} onChange={(e) => set("month", e.target.value)} className={selectCls}>
              {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <Label required>Year</Label>
            <select value={form.year} onChange={(e) => set("year", e.target.value)} className={selectCls}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </FormSection>

        {/* Earnings */}
        <FormSection title="Earnings">
          {[["hra","HRA"],["allowances","Allowances"],["bonus","Bonus"]].map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input type="number" min={0} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputCls(false)} />
            </div>
          ))}
        </FormSection>

        {/* Deductions */}
        <FormSection title="Deductions">
          {[["tax","Tax"],["providentFund","Provident Fund"],["insurance","Insurance"],["otherDeductions","Other Deductions"],["lossOfPay","Loss of Pay"]].map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input type="number" min={0} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputCls(false)} />
            </div>
          ))}
        </FormSection>

        {/* Attendance */}
        <FormSection title="Attendance Summary">
          {[["totalWorkingDays","Total Working Days"],["presentDays","Present Days"],["paidLeaves","Paid Leaves"],["unpaidLeaves","Unpaid Leaves"]].map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input type="number" min={0} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputCls(false)} />
            </div>
          ))}
        </FormSection>

        {/* Payment */}
        <FormSection title="Payment Details">
          <div>
            <Label>Payment Method</Label>
            <select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} className={selectCls}>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Remarks</Label>
            <input value={form.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Optional" className={inputCls(false)} />
          </div>
        </FormSection>

        {/* Live preview */}
        <SalaryPreview grossSalary={gross} totalDeductions={deductions} netSalary={net} />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/payroll")}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 transition-colors">
            {submitting ? "Generating…" : "Generate Payroll"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default GeneratePayroll;
