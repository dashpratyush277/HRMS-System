import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPayrollById, updatePaymentStatus } from "../../api/payrollApi";
import { useAuth }           from "../../context/AuthContext";
import DashboardLayout       from "../../components/DashboardLayout";
import PaymentStatusBadge    from "../../components/PaymentStatusBadge";
import LoadingSpinner        from "../../components/LoadingSpinner";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

const PayrollDetails = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [payroll,    setPayroll]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [marking,    setMarking]    = useState(false);
  const [apiError,   setApiError]   = useState("");

  const isHRAdmin = user?.role === "admin" || user?.role === "hr";
  const backPath  = isHRAdmin ? "/payroll" : "/my-payslips";

  useEffect(() => {
    getPayrollById(id)
      .then((r) => setPayroll(r.data.payroll))
      .catch(() => setFetchError("Payroll record not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkPaid = async () => {
    setMarking(true); setApiError("");
    try {
      const res = await updatePaymentStatus(id, { paymentStatus: "paid" });
      setPayroll(res.data.payroll);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading payslip…" /></DashboardLayout>;
  if (fetchError) return (
    <DashboardLayout>
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">{fetchError}</div>
    </DashboardLayout>
  );

  const p   = payroll;
  const emp = p.employee;

  return (
    <DashboardLayout>
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => navigate(backPath)}
          className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">
          ← Back
        </button>
        <div className="flex gap-2">
          {isHRAdmin && (
            <>
              <button onClick={() => navigate(`/payroll/${id}/edit`)}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">
                Edit
              </button>
              {p.paymentStatus !== "paid" && (
                <button onClick={handleMarkPaid} disabled={marking}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-xl disabled:opacity-60 transition-colors">
                  {marking ? "Saving…" : "Mark as Paid"}
                </button>
              )}
            </>
          )}
          <button onClick={() => window.print()}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">
            Print Payslip
          </button>
        </div>
      </div>

      {apiError && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm print:hidden">{apiError}</div>}

      {/* ── Printable payslip ── */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none" id="payslip">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-xl font-bold">HRMS</span>
              </div>
              <p className="text-blue-200 text-sm">Payslip for {MONTHS[(p.month||1)-1]} {p.year}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 capitalize">
                {p.paymentStatus}
              </div>
              {p.paymentDate && (
                <p className="text-blue-200 text-xs mt-1">Paid on {fmt(p.paymentDate)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Employee info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Employee</p>
              <p className="font-semibold text-gray-900">{emp?.firstName} {emp?.lastName}</p>
              <p className="text-sm text-gray-500">{emp?.designation} · {emp?.department}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{emp?.employeeId}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Payment Info</p>
              <p className="text-sm text-gray-600 capitalize">{p.paymentMethod?.replace("-", " ")}</p>
              {p.transactionId && <p className="text-xs text-gray-400 font-mono">{p.transactionId}</p>}
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Attendance Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "Working Days", value: p.totalWorkingDays },
                { label: "Present",      value: p.presentDays      },
                { label: "Paid Leaves",  value: p.paidLeaves        },
                { label: "Unpaid",       value: p.unpaidLeaves      },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-lg font-bold text-gray-900">{value || 0}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Earnings</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Basic Salary",  p.basicSalary ],
                    ["HRA",           p.hra         ],
                    ["Allowances",    p.allowances  ],
                    ["Bonus",         p.bonus       ],
                  ].filter(([, v]) => Number(v) > 0).map(([label, val]) => (
                    <tr key={label}>
                      <td className="py-1.5 text-gray-600">{label}</td>
                      <td className="py-1.5 text-right font-medium text-gray-900">${Number(val||0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-300">
                    <td className="py-2 font-semibold text-gray-900">Gross Salary</td>
                    <td className="py-2 text-right font-bold text-green-600">${Number(p.grossSalary||0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Deductions</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Tax",              p.tax             ],
                    ["Provident Fund",   p.providentFund   ],
                    ["Insurance",        p.insurance       ],
                    ["Other Deductions", p.otherDeductions ],
                    ["Loss of Pay",      p.lossOfPay        ],
                  ].filter(([, v]) => Number(v) > 0).map(([label, val]) => (
                    <tr key={label}>
                      <td className="py-1.5 text-gray-600">{label}</td>
                      <td className="py-1.5 text-right font-medium text-red-500">-${Number(val||0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-300">
                    <td className="py-2 font-semibold text-gray-900">Total Deductions</td>
                    <td className="py-2 text-right font-bold text-red-500">-${Number(p.totalDeductions||0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net salary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5 flex items-center justify-between">
            <p className="font-semibold text-gray-900">Net Salary</p>
            <p className="text-2xl font-bold text-green-600">${Number(p.netSalary||0).toLocaleString()}</p>
          </div>

          {p.remarks && (
            <p className="text-xs text-gray-400 mt-4">Remarks: {p.remarks}</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PayrollDetails;
