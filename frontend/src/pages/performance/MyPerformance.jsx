import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import GoalStatusBadge from "../../components/GoalStatusBadge";
import ReviewStatusBadge from "../../components/ReviewStatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import ProgressBar from "../../components/ProgressBar";
import RatingStars from "../../components/RatingStars";
import { getMyGoals, getMyReviews } from "../../api/performanceApi";

export default function MyPerformance() {
  const navigate = useNavigate();
  const [goals, setGoals]       = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [goalStatus, setGoalStatus] = useState("");
  const [loading, setLoading]   = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, reviewsRes] = await Promise.all([
        getMyGoals({ status: goalStatus, limit: 20 }),
        getMyReviews({ limit: 10 }),
      ]);
      if (goalsRes.data.success)   setGoals(goalsRes.data.goals);
      if (reviewsRes.data.success) setReviews(reviewsRes.data.reviews);
    } catch { /* handled */ }
    setLoading(false);
  }, [goalStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Performance</h1>
          <p className="text-slate-400 text-sm mt-1">Your goals and performance reviews</p>
        </div>

        {/* Goals */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Goals</h2>
            <select value={goalStatus} onChange={(e) => setGoalStatus(e.target.value)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none">
              <option value="">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm">Loading...</div>
          ) : goals.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">No goals found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map((g) => (
                <button
                  key={g._id}
                  onClick={() => navigate(`/performance/goals/${g._id}/progress`)}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-medium text-sm leading-snug">{g.title}</h3>
                    <GoalStatusBadge status={g.status} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <PriorityBadge priority={g.priority} />
                    <span className="text-slate-500 text-xs">{g.category}</span>
                  </div>
                  <ProgressBar value={g.progress} height="h-1.5" />
                  <p className="text-slate-500 text-xs mt-2">Due: {new Date(g.dueDate).toLocaleDateString()}</p>
                  {g.managerComment && (
                    <p className="text-slate-400 text-xs mt-2 line-clamp-1">Manager: {g.managerComment}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">My Reviews</h2>
          {reviews.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">No reviews found</div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-400 font-medium">Period</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Overall Rating</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Goals</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 font-medium">View</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-white">{r.reviewPeriod}</td>
                      <td className="p-4"><RatingStars rating={r.overallRating} /></td>
                      <td className="p-4 text-slate-400">{r.goals?.length ?? 0}</td>
                      <td className="p-4"><ReviewStatusBadge status={r.status} /></td>
                      <td className="p-4">
                        <button onClick={() => navigate(`/performance/reviews/${r._id}`)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
