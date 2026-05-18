import { useState, useEffect, useCallback } from "react";
import { getMyPayslips } from "../../api/payrollApi";
import DashboardLayout    from "../../components/DashboardLayout";
import PageHeader         from "../../components/PageHeader";
import PayslipCard        from "../../components/PayslipCard";
import LoadingSpinner     from "../../components/LoadingSpinner";
import EmptyState         from "../../components/EmptyState";

const MyPayslips = () => {
  const [payslips,   setPayslips]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [payStatus,  setPayStatus]  = useState("");
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (year)      params.year          = year;
      if (payStatus) params.paymentStatus = payStatus;
      const res = await getMyPayslips(params);
      setPayslips(res.data.payslips);
      setPagination({ total: res.data.total, pages: res.data.pages });
    } catch {
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  }, [year, payStatus, page]);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);
  useEffect(() => { setPage(1); }, [year, payStatus]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <PageHeader title="My Payslips" />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? <LoadingSpinner message="Loading payslips…" /> : payslips.length === 0 ? (
        <EmptyState message="No payslips found." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {payslips.map((p) => <PayslipCard key={p._id} payroll={p} />)}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-slate-500">Page {page} of {pagination.pages}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage((p) => p-1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors">Previous</button>
            <button disabled={page>=pagination.pages} onClick={() => setPage((p) => p+1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyPayslips;
