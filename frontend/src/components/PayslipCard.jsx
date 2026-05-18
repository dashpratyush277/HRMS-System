import { useNavigate } from "react-router-dom";
import PaymentStatusBadge from "./PaymentStatusBadge";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PayslipCard = ({ payroll }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-semibold text-white">
            {MONTHS[(payroll.month || 1) - 1]} {payroll.year}
          </p>
          {payroll.employee && (
            <p className="text-xs text-slate-500 mt-0.5">
              {payroll.employee.firstName} {payroll.employee.lastName}
            </p>
          )}
        </div>
        <PaymentStatusBadge status={payroll.paymentStatus} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        {[
          { label: "Gross",      value: payroll.grossSalary     },
          { label: "Deductions", value: payroll.totalDeductions },
          { label: "Net",        value: payroll.netSalary       },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/50 rounded-xl p-2">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-white">${Number(value || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(`/payroll/${payroll._id}`)}
        className="w-full py-2 text-xs font-medium text-blue-400 hover:text-blue-300 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700"
      >
        View Payslip
      </button>
    </div>
  );
};

export default PayslipCard;
