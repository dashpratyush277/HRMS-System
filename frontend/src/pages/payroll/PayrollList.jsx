import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../../context/AuthContext";
import { getPayrolls, deletePayroll, updatePaymentStatus } from "../../api/payrollApi";
import { getDepartments } from "../../api/departmentApi";
import DashboardLayout    from "../../components/DashboardLayout";
import PageHeader         from "../../components/PageHeader";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import ConfirmModal       from "../../components/ConfirmModal";
import LoadingSpinner     from "../../components/LoadingSpinner";
import EmptyState         from "../../components/EmptyState";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PayrollList = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [payrolls,    setPayrolls]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [month,       setMonth]       = useState("");
  const [year,        setYear]        = useState(new Date().getFullYear());
  const [payStatus,   setPayStatus]   = useState("");
  const [department,  setDepartment]  = useState("");
  const [departments, setDepartments] = useState([]);
  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState(null);
  const [toDelete,    setToDelete]    = useState(null);
  const [apiError,    setApiError]    = useState("");

  useEffect(() => {
    getDepartments({ limit: 100 }).then((r) => setDepartments(r.data.departments || [])).catch(() => {});
  }, []);

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (month)      params.month         = month;
      if (year)       params.year          = year;
      if (payStatus)  params.paymentStatus = payStatus;
      if (department) params.department    = department;
      const res = await getPayrolls(params);
      setPayrolls(res.data.payrolls);
      setPagination({ total: res.data.total, pages: res.data.pages });
    } catch {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, [month, year, payStatus, department, page]);

  useEffect(() => { fetchPayrolls(); }, [fetchPayrolls]);
  useEffect(() => { setPage(1); }, [month, year, payStatus, department]);

  const handleMarkPaid = async (id) => {
    try {
      await updatePaymentStatus(id, { paymentStatus: "paid" });
      fetchPayrolls();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePayroll(toDelete._id);
      setToDelete(null);
      fetchPayrolls();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to delete payroll.");
      setToDelete(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <PageHeader
        title="Payroll"
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate("/payroll/bulk")}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">
              Bulk Generate
            </button>
            <button onClick={() => navigate("/payroll/generate")}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">
              + Generate
            </button>
          </div>
        }
      />

      {apiError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{apiError}</div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <select value={month} onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Depts</option>
          {departments.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? <LoadingSpinner message="Loading payroll…" /> : payrolls.length === 0 ? (
          <EmptyState message="No payroll records found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {["Employee","Period","Basic","Gross","Deductions","Net","Status","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{p.employee?.firstName} {p.employee?.lastName}</p>
                      <p className="text-xs text-slate-500 font-mono">{p.employee?.employeeId}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{MONTHS[(p.month||1)-1]} {p.year}</td>
                    <td className="px-4 py-3.5 text-slate-400">${Number(p.basicSalary||0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-slate-400">${Number(p.grossSalary||0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-red-400">-${Number(p.totalDeductions||0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-green-400 font-medium">${Number(p.netSalary||0).toLocaleString()}</td>
                    <td className="px-4 py-3.5"><PaymentStatusBadge status={p.paymentStatus} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => navigate(`/payroll/${p._id}`)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium">View</button>
                        <button onClick={() => navigate(`/payroll/${p._id}/edit`)}
                          className="text-xs text-slate-400 hover:text-white font-medium">Edit</button>
                        {p.paymentStatus !== "paid" && (
                          <button onClick={() => handleMarkPaid(p._id)}
                            className="text-xs text-green-400 hover:text-green-300 font-medium">Mark Paid</button>
                        )}
                        {user?.role === "admin" && p.paymentStatus !== "paid" && (
                          <button onClick={() => { setApiError(""); setToDelete(p); }}
                            className="text-xs text-red-400 hover:text-red-300 font-medium">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-slate-500">Page {page} of {pagination.pages} · {pagination.total} records</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage((p) => p-1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors">Previous</button>
            <button disabled={page>=pagination.pages} onClick={() => setPage((p) => p+1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete Payroll"
          message={`Delete payroll for ${toDelete.employee?.firstName} ${toDelete.employee?.lastName} (${MONTHS[(toDelete.month||1)-1]} ${toDelete.year})?`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default PayrollList;
