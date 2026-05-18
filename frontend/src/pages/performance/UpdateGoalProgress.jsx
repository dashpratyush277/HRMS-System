import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ProgressBar from "../../components/ProgressBar";
import { getGoalById, updateGoalProgress } from "../../api/performanceApi";
import { useAuth } from "../../context/AuthContext";

const inputCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm";
const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm";

export default function UpdateGoalProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";

  const [goal, setGoal] = useState(null);
  const [form, setForm] = useState({ progress: 0, employeeComment: "", managerComment: "", score: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    getGoalById(id).then(({ data }) => {
      if (data.success) {
        setGoal(data.goal);
        setForm((f) => ({
          ...f,
          progress: data.goal.progress,
          employeeComment: data.goal.employeeComment || "",
          managerComment: data.goal.managerComment || "",
          score: data.goal.score ?? "",
          status: data.goal.status,
        }));
      }
    });
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        progress: Number(form.progress),
        employeeComment: form.employeeComment,
      };
      if (!isEmployee) {
        payload.managerComment = form.managerComment;
        if (form.score !== "") payload.score = Number(form.score);
        if (form.status === "cancelled") payload.status = "cancelled";
      }
      await updateGoalProgress(id, payload);
      navigate(`/performance/goals/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating progress");
    }
    setLoading(false);
  };

  if (!goal) return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <div>
            <h1 className="text-xl font-bold text-white">Update Progress</h1>
            <p className="text-slate-400 text-sm">{goal.title}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Progress: {form.progress}%</label>
              <input
                type="range" min="0" max="100" step="5"
                value={form.progress}
                onChange={(e) => set("progress", Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="mt-2">
                <ProgressBar value={form.progress} showLabel={false} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">My Comment</label>
              <textarea rows={3} value={form.employeeComment} onChange={(e) => set("employeeComment", e.target.value)} className={inputCls} placeholder="Add your progress update..." />
            </div>

            {!isEmployee && (
              <>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Manager Comment</label>
                  <textarea rows={3} value={form.managerComment} onChange={(e) => set("managerComment", e.target.value)} className={inputCls} placeholder="Feedback for employee..." />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Score (0–10)</label>
                  <input type="number" min="0" max="10" step="0.5" value={form.score} onChange={(e) => set("score", e.target.value)} className={inputCls} placeholder="Leave blank to not score" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Mark as Cancelled</label>
                  <select value={form.status === "cancelled" ? "cancelled" : ""} onChange={(e) => set("status", e.target.value)} className={selectCls}>
                    <option value="">No change</option>
                    <option value="cancelled">Cancel this goal</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
