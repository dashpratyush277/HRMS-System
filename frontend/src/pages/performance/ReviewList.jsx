import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ReviewStatusBadge from "../../components/ReviewStatusBadge";
import RatingStars from "../../components/RatingStars";
import { getReviews, deleteReview } from "../../api/performanceApi";

export default function ReviewList() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState("");
  const [page, setPage]       = useState(1);
  const limit = 15;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getReviews({ status, page, limit });
      if (data.success) { setReviews(data.reviews); setTotal(data.total); }
    } catch { /* handled */ }
    setLoading(false);
  }, [status, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setPage(1); }, [status]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try { await deleteReview(id); fetchReviews(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Performance Reviews</h1>
            <p className="text-slate-400 text-sm mt-1">{total} reviews</p>
          </div>
          <button onClick={() => navigate("/performance/reviews/new")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            + New Review
          </button>
        </div>

        <div className="flex gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No reviews found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Employee</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Review Period</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Overall Rating</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Goals</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <button onClick={() => navigate(`/performance/reviews/${r._id}`)} className="text-white font-medium hover:text-blue-400 transition-colors text-left">
                        {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : "—"}
                      </button>
                      {r.employee?.department && <p className="text-slate-500 text-xs mt-0.5">{r.employee.department}</p>}
                    </td>
                    <td className="p-4 text-slate-300">{r.reviewPeriod}</td>
                    <td className="p-4"><RatingStars rating={r.overallRating} /></td>
                    <td className="p-4 text-slate-400">{r.goals?.length ?? 0}</td>
                    <td className="p-4"><ReviewStatusBadge status={r.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/performance/reviews/${r._id}/edit`)} className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(r._id)} className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40">Prev</button>
            <span className="text-slate-400 text-sm">Page {page} of {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
