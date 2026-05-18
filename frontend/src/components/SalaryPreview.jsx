const Row = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center py-2 ${highlight ? "border-t border-slate-700 mt-1 pt-3" : ""}`}>
    <span className={`text-sm ${highlight ? "font-semibold text-white" : "text-slate-400"}`}>{label}</span>
    <span className={`text-sm font-semibold ${highlight ? "text-green-400 text-base" : "text-white"}`}>
      ${Number(value || 0).toLocaleString()}
    </span>
  </div>
);

const SalaryPreview = ({ grossSalary = 0, totalDeductions = 0, netSalary = 0 }) => (
  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Salary Preview</p>
    <Row label="Gross Salary"      value={grossSalary}     />
    <Row label="Total Deductions"  value={totalDeductions} />
    <Row label="Net Salary"        value={netSalary}       highlight />
  </div>
);

export default SalaryPreview;
