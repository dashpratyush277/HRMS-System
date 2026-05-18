import { useState, useEffect, useCallback } from "react";
import { useNavigate }  from "react-router-dom";
import { getMyLeaves, cancelLeave, getMyLeaveBalance } from "../../api/leaveApi";
import DashboardLayout  from "../../components/DashboardLayout";
import PageHeader       from "../../components/PageHeader";
import LeaveStatusBadge from "../../components/LeaveStatusBadge";
import LeaveTypeBadge   from "../../components/LeaveTypeBadge";
import LeaveBalanceCard from "../../components/LeaveBalanceCard";
import ConfirmModal     from "../../components/ConfirmModal";
import LoadingSpinner   from "../../components/LoadingSpinner";
import EmptyState       from "../../components/EmptyState";

const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const MyLeaves = () => {
  const navigate = useNavigate();

  const [leaves,     setLeaves]     = useState([]);
  const [balance,    setBalance]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState("");
  const [leaveType,  setLeaveType]  = useState("");
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);
  const [toCancel,   setToCancel]   = useState(null);
  const [cancelErr,  setCancelErr]  = useState("");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status)    params.status    = status;
      if (leaveType) params.leaveType = leaveType;
      if (year)      params.year      = year;
      const res = await getMyLeaves(params);
      setLeaves(res.data.leaves);
      setPagination({ total: res.data.total, pages: res.data.pages });
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [status, leaveType, year, page]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);
  useEffect(() => { setPage(1); }, [status, leaveType, year]);

  useEffect(() => {
    getMyLeaveBalance({ year }).then((r) => setBalance(r.data.balance)).catch(() => {});
  }, [year]);

  const handleCancel = async () => {
    try {
      await cancelLeave(toCancel._id);
      setToCancel(null);
      fetchLeaves();
      getMyLeaveBalance({ year }).then((r) => setBalance(r.data.balance)).catch(() => {});
    } catch (err) {
      setCancelErr(err.response?.data?.message || "Failed to cancel leave.");
      setToCancel(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

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
        title="My Leaves"
        action={
          <button onClick={() => navigate("/apply-leave")}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">
            + Apply Leave
          </button>
        }
      />

      {cancelErr && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{cancelErr}</div>
      )}

      {/* Balance cards */}
      {balance && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {BALANCE_CARDS.map((b) => <LeaveBalanceCard key={b.key} {...b} />)}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select value={status}   onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Status</option>
          {["pending","approved","rejected","cancelled"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Types</option>
          {["casual","sick","earned","maternity","paternity","unpaid"].map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? <LoadingSpinner message="Loading leaves…" /> : leaves.length === 0 ? (
          <EmptyState message="No leave requests found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {["Type","Start","End","Days","Status","Reason","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5"><LeaveTypeBadge type={l.leaveType} /></td>
                    <td className="px-4 py-3.5 text-slate-400">{fmt(l.startDate)}</td>
                    <td className="px-4 py-3.5 text-slate-400">{fmt(l.endDate)}</td>
                    <td className="px-4 py-3.5 text-slate-400">{l.totalDays}</td>
                    <td className="px-4 py-3.5"><LeaveStatusBadge status={l.status} /></td>
                    <td className="px-4 py-3.5 text-slate-400 max-w-[160px] truncate">{l.reason}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/leaves/${l._id}`)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium">View</button>
                        {l.status === "pending" && (
                          <button onClick={() => { setCancelErr(""); setToCancel(l); }}
                            className="text-xs text-red-400 hover:text-red-300 font-medium">Cancel</button>
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
          <p className="text-xs text-slate-500">Page {page} of {pagination.pages}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage((p) => p-1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors">Previous</button>
            <button disabled={page>=pagination.pages} onClick={() => setPage((p) => p+1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}

      {toCancel && (
        <ConfirmModal
          title="Cancel Leave"
          message={`Cancel your ${toCancel.leaveType} leave request (${toCancel.totalDays} day(s))?`}
          onConfirm={handleCancel}
          onCancel={() => setToCancel(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default MyLeaves;
