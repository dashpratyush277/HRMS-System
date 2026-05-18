import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLeaveById, updateLeaveStatus, cancelLeave } from "../../api/leaveApi";
import { useAuth }        from "../../context/AuthContext";
import DashboardLayout    from "../../components/DashboardLayout";
import PageHeader         from "../../components/PageHeader";
import LeaveStatusBadge   from "../../components/LeaveStatusBadge";
import LeaveTypeBadge     from "../../components/LeaveTypeBadge";
import ActionModal        from "../../components/ActionModal";
import LoadingSpinner     from "../../components/LoadingSpinner";

const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-white font-medium">{value || "—"}</span>
  </div>
);

const LeaveDetails = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leave,      setLeave]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal,      setModal]      = useState(null);
  const [comment,    setComment]    = useState("");
  const [processing, setProcessing] = useState(false);
  const [apiError,   setApiError]   = useState("");

  const isHRAdmin = user?.role === "admin" || user?.role === "hr";

  const load = async () => {
    try {
      const res = await getLeaveById(id);
      setLeave(res.data.leave);
    } catch {
      setFetchError("Leave request not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleConfirm = async () => {
    setProcessing(true); setApiError("");
    try {
      if (modal === "approve") await updateLeaveStatus(id, { status: "approved", adminComment: comment });
      else if (modal === "reject")  await updateLeaveStatus(id, { status: "rejected", adminComment: comment });
      else if (modal === "cancel")  await cancelLeave(id);
      setModal(null);
      load();
    } catch (err) {
      setApiError(err.response?.data?.message || "Action failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading leave details…" /></DashboardLayout>;

  if (fetchError) return (
    <DashboardLayout>
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">{fetchError}</div>
    </DashboardLayout>
  );

  const backPath = isHRAdmin ? "/leaves" : "/my-leaves";

  return (
    <DashboardLayout>
      <PageHeader
        title="Leave Details"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(backPath)}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">
              ← Back
            </button>
            {isHRAdmin && leave.status === "pending" && (
              <>
                <button onClick={() => { setComment(""); setModal("approve"); }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-xl transition-colors">
                  Approve
                </button>
                <button onClick={() => { setComment(""); setModal("reject"); }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors">
                  Reject
                </button>
              </>
            )}
            {(leave.status === "pending" || (isHRAdmin && leave.status === "approved")) && (
              <button onClick={() => setModal("cancel")}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-500 rounded-xl transition-colors">
                Cancel
              </button>
            )}
          </div>
        }
      />

      {apiError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{apiError}</div>
      )}

      {/* Status banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-white">
              {leave.employee?.firstName} {leave.employee?.lastName}
            </h2>
            <LeaveStatusBadge status={leave.status} />
            <LeaveTypeBadge   type={leave.leaveType} />
          </div>
          <p className="text-sm text-slate-400">{leave.employee?.department} · {leave.employee?.designation}</p>
        </div>
        <div className="text-center bg-slate-800/50 rounded-xl px-5 py-3">
          <p className="text-2xl font-bold text-white">{leave.totalDays}</p>
          <p className="text-xs text-slate-400">Day(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leave Info */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">Leave Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Leave Type" value={leave.leaveType?.charAt(0).toUpperCase()+leave.leaveType?.slice(1)} />
            <InfoRow label="Total Days"  value={leave.totalDays} />
            <InfoRow label="Start Date"  value={fmt(leave.startDate)} />
            <InfoRow label="End Date"    value={fmt(leave.endDate)} />
            <InfoRow label="Applied On"  value={fmt(leave.createdAt)} />
            <InfoRow label="Status"      value={leave.status?.charAt(0).toUpperCase()+leave.status?.slice(1)} />
            <div className="sm:col-span-2">
              <InfoRow label="Reason" value={leave.reason} />
            </div>
          </div>
        </div>

        {/* Approval Info */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">Review Information</h3>
          {leave.reviewedBy ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Reviewed By"  value={leave.reviewedBy?.name} />
              <InfoRow label="Reviewed On"  value={fmt(leave.reviewedAt)} />
              {leave.adminComment && (
                <div className="sm:col-span-2">
                  <InfoRow label="Admin Comment" value={leave.adminComment} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">This leave has not been reviewed yet.</p>
          )}
        </div>
      </div>

      {modal && (
        <ActionModal
          title={modal === "approve" ? "Approve Leave" : modal === "reject" ? "Reject Leave" : "Cancel Leave"}
          message={`${modal.charAt(0).toUpperCase()+modal.slice(1)} this ${leave.leaveType} leave request (${leave.totalDays} day(s))?`}
          actionLabel={modal.charAt(0).toUpperCase()+modal.slice(1)}
          actionColor={modal === "approve" ? "green" : modal === "reject" ? "red" : "blue"}
          showComment={modal !== "cancel"}
          comment={comment}
          onCommentChange={setComment}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          loading={processing}
        />
      )}
    </DashboardLayout>
  );
};

export default LeaveDetails;
