import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPayrollById, updatePayroll } from "../../api/payrollApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import FormSection     from "../../components/FormSection";
import SalaryPreview   from "../../components/SalaryPreview";
import LoadingSpinner  from "../../components/LoadingSpinner";

const inputCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors";
const selectCls = inputCls;
const Label = ({ children }) => <label className="block text-xs font-medium text-slate-400 mb-1.5">{children}</label>;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const EditPayroll = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form,       setForm]       = useState(null);
  const [basicSalary, setBasicSalary] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState("");

  useEffect(() => {
    getPayrollById(id)
      .then((r) => {
        const p = r.data.payroll;
        setBasicSalary(p.basicSalary || 0);
        setForm({
          hra:              p.hra              || 0,
          allowances:       p.allowances       || 0,
          bonus:            p.bonus            || 0,
          tax:              p.tax              || 0,
          providentFund:    p.providentFund    || 0,
          insurance:        p.insurance        || 0,
          otherDeductions:  p.otherDeductions  || 0,
          totalWorkingDays: p.totalWorkingDays || 0,
          presentDays:      p.presentDays      || 0,
          paidLeaves:       p.paidLeaves        || 0,
          unpaidLeaves:     p.unpaidLeaves      || 0,
          lossOfPay:        p.lossOfPay         || 0,
          paymentMethod:    p.paymentMethod    || "bank-transfer",
          remarks:          p.remarks          || "",
        });
      })
      .catch(() => setFetchError("Payroll record not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const n = (v) => Number(v) || 0;
  const gross      = form ? basicSalary + n(form.hra) + n(form.allowances) + n(form.bonus) : 0;
  const deductions = form ? n(form.tax) + n(form.providentFund) + n(form.insurance) + n(form.otherDeductions) + n(form.lossOfPay) : 0;
  const net        = Math.max(0, gross - deductions);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true); setApiError("");
    try {
      await updatePayroll(id, form);
      navigate(`/payroll/${id}`);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update payroll.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading payroll…" /></DashboardLayout>;
  if (fetchError) return (
    <DashboardLayout>
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">{fetchError}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <PageHeader title="Edit Payroll"
        action={<button onClick={() => navigate(`/payroll/${id}`)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">← Back</button>}
      />

      {apiError && <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{apiError}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Earnings">
          {[["hra","HRA"],["allowances","Allowances"],["bonus","Bonus"]].map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input type="number" min={0} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputCls} />
            </div>
          ))}
        </FormSection>

        <FormSection title="Deductions">
          {[["tax","Tax"],["providentFund","Provident Fund"],["insurance","Insurance"],["otherDeductions","Other Deductions"],["lossOfPay","Loss of Pay"]].map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input type="number" min={0} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputCls} />
            </div>
          ))}
        </FormSection>

        <FormSection title="Attendance Summary">
          {[["totalWorkingDays","Total Working Days"],["presentDays","Present Days"],["paidLeaves","Paid Leaves"],["unpaidLeaves","Unpaid Leaves"]].map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input type="number" min={0} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputCls} />
            </div>
          ))}
        </FormSection>

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
          <div>
            <Label>Remarks</Label>
            <input value={form.remarks} onChange={(e) => set("remarks", e.target.value)} className={inputCls} />
          </div>
        </FormSection>

        <SalaryPreview grossSalary={gross} totalDeductions={deductions} netSalary={net} />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(`/payroll/${id}`)}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 transition-colors">
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default EditPayroll;
