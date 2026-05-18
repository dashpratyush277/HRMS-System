import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import FormSection from "../../components/FormSection";
import { getGoalById, updateGoal } from "../../api/performanceApi";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm`;

const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm";
const toDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function EditGoal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]       = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGoalById(id).then(({ data }) => {
      if (data.success) {
        const g = data.goal;
        setForm({
          title: g.title, description: g.description || "", category: g.category,
          priority: g.priority, startDate: toDate(g.startDate), dueDate: toDate(g.dueDate),
          weight: g.weight ?? 0,
        });
      }
    });
  }, [id]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.title)     e.title     = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.dueDate)   e.dueDate   = "Required";
    if (form.dueDate && form.startDate && new Date(form.dueDate) < new Date(form.startDate))
      e.dueDate = "Due date cannot be before start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await updateGoal(id, { ...form, weight: Number(form.weight) || 0 });
      navigate(`/performance/goals/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating goal");
    }
    setLoading(false);
  };

  if (!form) return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Edit Goal</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Goal Information">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Goal Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls(errors.title)} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={selectCls}>
                {["productivity","quality","teamwork","leadership","learning","attendance","custom"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={selectCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls(errors.startDate)} />
              {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={inputCls(errors.dueDate)} />
              {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Weight</label>
              <input type="number" min="0" value={form.weight} onChange={(e) => set("weight", e.target.value)} className={inputCls(false)} />
            </div>
          </FormSection>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
