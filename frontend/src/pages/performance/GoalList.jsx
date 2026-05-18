import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import GoalStatusBadge from "../../components/GoalStatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import ProgressBar from "../../components/ProgressBar";
import { getGoals, deleteGoal } from "../../api/performanceApi";

export default function GoalList() {
  const navigate = useNavigate();
  const [goals, setGoals]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage]       = useState(1);
  const limit = 15;

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getGoals({ search, status, category, page, limit });
      if (data.success) { setGoals(data.goals); setTotal(data.total); }
    } catch { /* handled */ }
    setLoading(false);
  }, [search, status, category, page]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);
  useEffect(() => { setPage(1); }, [search, status, category]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try { await deleteGoal(id); fetchGoals(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Goals</h1>
            <p className="text-slate-400 text-sm mt-1">{total} goals</p>
          </div>
          <button onClick={() => navigate("/performance/goals/new")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            + New Goal
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, description..." className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm w-64 focus:outline-none focus:border-blue-500" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Categories</option>
            {["productivity","quality","teamwork","leadership","learning","attendance","custom"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : goals.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No goals found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Goal</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Employee</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Progress</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Priority</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Due</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((g) => (
                  <tr key={g._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <button onClick={() => navigate(`/performance/goals/${g._id}`)} className="text-white font-medium hover:text-blue-400 transition-colors text-left">
                        {g.title}
                      </button>
                      {g.category && <p className="text-slate-500 text-xs mt-0.5">{g.category}</p>}
                    </td>
                    <td className="p-4">
                      {g.employee ? (
                        <span className="text-slate-300 text-sm">{g.employee.firstName} {g.employee.lastName}</span>
                      ) : "—"}
                    </td>
                    <td className="p-4 w-36">
                      <ProgressBar value={g.progress} height="h-1.5" showLabel={false} />
                      <span className="text-xs text-slate-400 mt-0.5 block">{g.progress}%</span>
                    </td>
                    <td className="p-4"><PriorityBadge priority={g.priority} /></td>
                    <td className="p-4"><GoalStatusBadge status={g.status} /></td>
                    <td className="p-4 text-slate-400 text-xs">{new Date(g.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/performance/goals/${g._id}/progress`)} className="px-2 py-1 text-xs text-green-400 hover:text-green-300 transition-colors">Progress</button>
                        <button onClick={() => navigate(`/performance/goals/${g._id}/edit`)} className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(g._id)} className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors">Del</button>
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
