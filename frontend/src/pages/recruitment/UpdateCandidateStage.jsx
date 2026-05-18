import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getCandidateById, updateCandidateStage } from "../../api/recruitmentApi";

const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm";
const inputCls  = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm";

const STAGES = ["applied","screening","interview","technical","hr-round","selected","rejected","offered","joined"];

export default function UpdateCandidateStage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [form, setForm]   = useState({ stage: "", notes: "", interviewDate: "", interviewFeedback: "", rating: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    getCandidateById(id).then(({ data }) => {
      if (data.success) {
        setCandidate(data.candidate);
        setForm((f) => ({ ...f, stage: data.candidate.stage }));
      }
    });
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { stage: form.stage };
      if (form.notes)            payload.notes            = form.notes;
      if (form.interviewDate)    payload.interviewDate    = form.interviewDate;
      if (form.interviewFeedback) payload.interviewFeedback = form.interviewFeedback;
      if (form.rating)           payload.rating           = Number(form.rating);
      await updateCandidateStage(id, payload);
      navigate(`/recruitment/candidates/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating stage");
    }
    setLoading(false);
  };

  if (!candidate) return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <div>
            <h1 className="text-xl font-bold text-white">Update Stage</h1>
            <p className="text-slate-400 text-sm">{candidate.name}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Stage</label>
              <select value={form.stage} onChange={(e) => set("stage", e.target.value)} className={selectCls}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={inputCls} placeholder="Internal notes..." />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Interview Date</label>
              <input type="datetime-local" value={form.interviewDate} onChange={(e) => set("interviewDate", e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Interview Feedback</label>
              <textarea rows={3} value={form.interviewFeedback} onChange={(e) => set("interviewFeedback", e.target.value)} className={inputCls} placeholder="Interview feedback..." />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Rating (1–5)</label>
              <select value={form.rating} onChange={(e) => set("rating", e.target.value)} className={selectCls}>
                <option value="">No rating</option>
                <option value="1">1 — Poor</option>
                <option value="2">2 — Below Average</option>
                <option value="3">3 — Average</option>
                <option value="4">4 — Good</option>
                <option value="5">5 — Excellent</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Update Stage"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
