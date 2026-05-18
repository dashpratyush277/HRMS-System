import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ReviewStatusBadge from "../../components/ReviewStatusBadge";
import RatingStars from "../../components/RatingStars";
import RatingDisplay from "../../components/RatingDisplay";
import GoalStatusBadge from "../../components/GoalStatusBadge";
import ProgressBar from "../../components/ProgressBar";
import ActionModal from "../../components/ActionModal";
import { getReviewById, updateReviewStatus, deleteReview } from "../../api/performanceApi";
import { useAuth } from "../../context/AuthContext";

export default function ReviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");

  const fetch = () => {
    getReviewById(id)
      .then(({ data }) => { if (data.success) setReview(data.review); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [id]);

  const handleStatusUpdate = async (status) => {
    setActionLoading(true);
    try {
      await updateReviewStatus(id, { status, finalComments: comment });
      setModal(null);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    try { await deleteReview(id); navigate("/performance/reviews"); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  if (loading)  return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;
  if (!review)  return <DashboardLayout><div className="p-6 text-slate-400">Review not found.</div></DashboardLayout>;

  const r = review;
  const isAdminOrHr = ["admin","hr"].includes(user?.role);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : "Review"}
              </h1>
              <p className="text-slate-400 text-sm">{r.reviewPeriod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdminOrHr && r.status === "submitted" && (
              <>
                <button onClick={() => { setComment(""); setModal("approve"); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">Approve</button>
                <button onClick={() => { setComment(""); setModal("reject"); }}  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm transition-colors">Reject</button>
              </>
            )}
            {isAdminOrHr && r.status === "draft" && (
              <button onClick={() => handleStatusUpdate("submitted")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Submit</button>
            )}
            {isAdminOrHr && r.status !== "approved" && (
              <>
                <button onClick={() => navigate(`/performance/reviews/${id}/edit`)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">Edit</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm transition-colors">Delete</button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <ReviewStatusBadge status={r.status} />
                {r.overallRating && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">Overall</span>
                    <RatingStars rating={r.overallRating} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <RatingDisplay label="Productivity"   value={r.productivityRating} />
                <RatingDisplay label="Quality"        value={r.qualityRating} />
                <RatingDisplay label="Teamwork"       value={r.teamworkRating} />
                <RatingDisplay label="Communication"  value={r.communicationRating} />
                <RatingDisplay label="Leadership"     value={r.leadershipRating} />
              </div>
            </div>

            {/* Feedback sections */}
            {[
              { label: "Strengths",            value: r.strengths },
              { label: "Areas for Improvement",value: r.improvements },
              { label: "Manager Feedback",     value: r.managerFeedback },
              { label: "Employee Feedback",    value: r.employeeFeedback },
              { label: "Final Comments",       value: r.finalComments },
            ].filter((s) => s.value).map((s) => (
              <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs text-slate-400 mb-2">{s.label}</h3>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Review Info</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Period: </span><span className="text-white">{r.reviewPeriod}</span></div>
                <div><span className="text-slate-400">From: </span><span className="text-white">{new Date(r.startDate).toLocaleDateString()}</span></div>
                <div><span className="text-slate-400">To: </span><span className="text-white">{new Date(r.endDate).toLocaleDateString()}</span></div>
                {r.reviewedBy && <div><span className="text-slate-400">Reviewer: </span><span className="text-white">{r.reviewedBy.name}</span></div>}
                {r.approvedBy && <div><span className="text-slate-400">Approved by: </span><span className="text-white">{r.approvedBy.name}</span></div>}
                {r.approvedAt && <div><span className="text-slate-400">Approved: </span><span className="text-white">{new Date(r.approvedAt).toLocaleDateString()}</span></div>}
              </div>
            </div>

            {r.goals?.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Linked Goals</h3>
                <div className="space-y-3">
                  {r.goals.map((g) => (
                    <div key={g._id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <button onClick={() => navigate(`/performance/goals/${g._id}`)} className="text-blue-400 hover:text-blue-300 text-sm transition-colors text-left">{g.title}</button>
                        <GoalStatusBadge status={g.status} />
                      </div>
                      <ProgressBar value={g.progress} height="h-1" showLabel={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === "approve" && (
        <ActionModal
          title="Approve Review"
          message="Are you sure you want to approve this performance review?"
          actionLabel="Approve"
          actionColor="green"
          showComment
          comment={comment}
          onCommentChange={setComment}
          onConfirm={() => handleStatusUpdate("approved")}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "reject" && (
        <ActionModal
          title="Reject Review"
          message="Provide a reason for rejecting this review."
          actionLabel="Reject"
          actionColor="red"
          showComment
          comment={comment}
          onCommentChange={setComment}
          onConfirm={() => handleStatusUpdate("rejected")}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
    </DashboardLayout>
  );
}
