import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaves, updateLeaveStatus, cancelLeave } from "../../api/leaveApi";
import DashboardLayout  from "../../components/DashboardLayout";
import PageHeader       from "../../components/PageHeader";
import LeaveStatusBadge from "../../components/LeaveStatusBadge";
import LeaveTypeBadge   from "../../components/LeaveTypeBadge";
import ActionModal      from "../../components/ActionModal";
import LoadingSpinner   from "../../components/LoadingSpinner";
import EmptyState       from "../../components/EmptyState";

const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const LeaveList = () => {
  const navigate = useNavigate();

  const [leaves,     setLeaves]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState("");
  const [leaveType,  setLeaveType]  = useState("");
  const [month,      setMonth]      = useState("");
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);
  const [modal,      setModal]      = useState(null); // { action, leave }
  const [comment,    setComment]    = useState("");
  const [processing, setProcessing] = useState(false);
  const [apiError,   setApiError]   = useState("");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status)    params.status    = status;
      if (leaveType) params.leaveType = leaveType;
      if (month)     params.month     = month;
      if (year)      params.year      = year;
      const res = await getLeaves(params);
      setLeaves(res.data.leaves);
      setPagination({ total: res.data.total, pages: res.data.pages });
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [status, leaveType, month, year, page]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);
  useEffect(() => { setPage(1); }, [status, leaveType, month, year]);

  const openModal = (action, leave) => { setComment(""); setApiError(""); setModal({ action, leave }); };
  const closeModal = () => setModal(null);

  const handleConfirm = async () => {
    if (!modal) return;
    setProcessing(true);
    setApiError("");
    try {
      if (modal.action === "approve") {
        await updateLeaveStatus(modal.leave._id, { status: "approved", adminComment: comment });
      } else if (modal.action === "reject") {
        await updateLeaveStatus(modal.leave._id, { status: "rejected", adminComment: comment });
      } else if (modal.action === "cancel") {
        await cancelLeave(modal.leave._id);
      }
      closeModal();
      fetchLeaves();
    } catch (err) {
      setApiError(err.response?.data?.message || "Action failed.");
    } finally {
      setProcessing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <PageHeader
        title="Leave Requests"
        action={
          <button
            onClick={() => navigate("/leaves/apply")}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
          >
            + Apply Leave
          </button>
        }
      />

      {apiError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {apiError}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <select value={status}    onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Status</option>
          {["pending","approved","rejected","cancelled"].map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Types</option>
          {["casual","sick","earned","maternity","paternity","unpaid"].map((t) => (
            <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">All Months</option>
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? <LoadingSpinner message="Loading leave requests…" /> : leaves.length === 0 ? (
          <EmptyState message="No leave requests found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {["Employee","Type","Start","End","Days","Status","Reason","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{l.employee?.firstName} {l.employee?.lastName}</p>
                      <p className="text-xs text-slate-500 font-mono">{l.employee?.employeeId}</p>
                    </td>
                    <td className="px-4 py-3.5"><LeaveTypeBadge type={l.leaveType} /></td>
                    <td className="px-4 py-3.5 text-slate-400">{fmt(l.startDate)}</td>
                    <td className="px-4 py-3.5 text-slate-400">{fmt(l.endDate)}</td>
                    <td className="px-4 py-3.5 text-slate-400">{l.totalDays}</td>
                    <td className="px-4 py-3.5"><LeaveStatusBadge status={l.status} /></td>
                    <td className="px-4 py-3.5 text-slate-400 max-w-[160px] truncate">{l.reason}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => navigate(`/leaves/${l._id}`)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium">View</button>
                        {l.status === "pending" && (
                          <>
                            <button onClick={() => openModal("approve", l)}
                              className="text-xs text-green-400 hover:text-green-300 font-medium">Approve</button>
                            <button onClick={() => openModal("reject", l)}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">Reject</button>
                          </>
                        )}
                        {["pending","approved"].includes(l.status) && (
                          <button onClick={() => openModal("cancel", l)}
                            className="text-xs text-slate-400 hover:text-white font-medium">Cancel</button>
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

      {/* Pagination */}
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

      {modal && (
        <ActionModal
          title={modal.action === "approve" ? "Approve Leave" : modal.action === "reject" ? "Reject Leave" : "Cancel Leave"}
          message={
            modal.action === "cancel"
              ? `Cancel leave for ${modal.leave.employee?.firstName} ${modal.leave.employee?.lastName}?`
              : `${modal.action === "approve" ? "Approve" : "Reject"} the ${modal.leave.leaveType} leave request for ${modal.leave.employee?.firstName} ${modal.leave.employee?.lastName}?`
          }
          actionLabel={modal.action.charAt(0).toUpperCase() + modal.action.slice(1)}
          actionColor={modal.action === "approve" ? "green" : modal.action === "reject" ? "red" : "blue"}
          showComment={modal.action !== "cancel"}
          comment={comment}
          onCommentChange={setComment}
          onConfirm={handleConfirm}
          onCancel={closeModal}
          loading={processing}
        />
      )}
    </DashboardLayout>
  );
};

export default LeaveList;
