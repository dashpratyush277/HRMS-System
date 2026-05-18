import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import GoalStatusBadge from "../../components/GoalStatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import ProgressBar from "../../components/ProgressBar";
import { getGoalById, deleteGoal } from "../../api/performanceApi";

export default function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGoalById(id).then(({ data }) => { if (data.success) setGoal(data.goal); }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this goal?")) return;
    try { await deleteGoal(id); navigate("/performance/goals"); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  if (loading) return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;
  if (!goal)   return <DashboardLayout><div className="p-6 text-slate-400">Goal not found.</div></DashboardLayout>;

  const g = goal;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
            <div>
              <h1 className="text-2xl font-bold text-white">{g.title}</h1>
              {g.employee && <p className="text-slate-400 text-sm mt-1">{g.employee.firstName} {g.employee.lastName} · {g.employee.department}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/performance/goals/${id}/progress`)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">Update Progress</button>
            <button onClick={() => navigate(`/performance/goals/${id}/edit`)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Edit</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm transition-colors">Delete</button>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap gap-3">
            <GoalStatusBadge status={g.status} />
            <PriorityBadge priority={g.priority} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">{g.category}</span>
          </div>

          <ProgressBar value={g.progress} height="h-2.5" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-slate-500">Start Date</p><p className="text-white">{new Date(g.startDate).toLocaleDateString()}</p></div>
            <div><p className="text-slate-500">Due Date</p><p className="text-white">{new Date(g.dueDate).toLocaleDateString()}</p></div>
            {g.weight > 0 && <div><p className="text-slate-500">Weight</p><p className="text-white">{g.weight}</p></div>}
            {g.score != null && <div><p className="text-slate-500">Score</p><p className="text-white">{g.score}/10</p></div>}
          </div>

          {g.description && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{g.description}</p>
            </div>
          )}

          {g.managerComment && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Manager Comment</p>
              <p className="text-slate-300 text-sm">{g.managerComment}</p>
            </div>
          )}

          {g.employeeComment && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Employee Comment</p>
              <p className="text-slate-300 text-sm">{g.employeeComment}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
