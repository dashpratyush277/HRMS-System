import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import FormSection from "../../components/FormSection";
import { getReviewById, updateReview } from "../../api/performanceApi";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm`;

const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm";
const toDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const RATING_FIELDS = [
  { key: "productivityRating", label: "Productivity" },
  { key: "qualityRating",      label: "Quality" },
  { key: "teamworkRating",     label: "Teamwork" },
  { key: "communicationRating",label: "Communication" },
  { key: "leadershipRating",   label: "Leadership" },
];

export default function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]       = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getReviewById(id).then(({ data }) => {
      if (data.success) {
        const r = data.review;
        setForm({
          reviewPeriod: r.reviewPeriod, startDate: toDate(r.startDate), endDate: toDate(r.endDate),
          productivityRating:  r.productivityRating  ?? "",
          qualityRating:       r.qualityRating       ?? "",
          teamworkRating:      r.teamworkRating      ?? "",
          communicationRating: r.communicationRating ?? "",
          leadershipRating:    r.leadershipRating    ?? "",
          strengths: r.strengths || "", improvements: r.improvements || "",
          managerFeedback: r.managerFeedback || "", employeeFeedback: r.employeeFeedback || "",
          status: r.status,
        });
      }
    });
  }, [id]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.reviewPeriod) e.reviewPeriod = "Required";
    if (!form.startDate)    e.startDate    = "Required";
    if (!form.endDate)      e.endDate      = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form };
      RATING_FIELDS.forEach(({ key }) => { if (payload[key] === "") delete payload[key]; else payload[key] = Number(payload[key]); });
      await updateReview(id, payload);
      navigate(`/performance/reviews/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating review");
    }
    setLoading(false);
  };

  if (!form) return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Edit Review</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Review Setup">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Review Period *</label>
              <input value={form.reviewPeriod} onChange={(e) => set("reviewPeriod", e.target.value)} className={inputCls(errors.reviewPeriod)} />
              {errors.reviewPeriod && <p className="text-red-400 text-xs mt-1">{errors.reviewPeriod}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls(errors.startDate)} />
              {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls(errors.endDate)} />
              {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </FormSection>

          <FormSection title="Ratings (1–5)">
            {RATING_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                <select value={form[key]} onChange={(e) => set(key, e.target.value)} className={selectCls}>
                  <option value="">Not rated</option>
                  <option value="1">1 — Poor</option>
                  <option value="2">2 — Below Average</option>
                  <option value="3">3 — Average</option>
                  <option value="4">4 — Good</option>
                  <option value="5">5 — Excellent</option>
                </select>
              </div>
            ))}
          </FormSection>

          <FormSection title="Feedback">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Strengths</label>
              <textarea rows={3} value={form.strengths} onChange={(e) => set("strengths", e.target.value)} className={inputCls(false)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Areas for Improvement</label>
              <textarea rows={3} value={form.improvements} onChange={(e) => set("improvements", e.target.value)} className={inputCls(false)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Manager Feedback</label>
              <textarea rows={3} value={form.managerFeedback} onChange={(e) => set("managerFeedback", e.target.value)} className={inputCls(false)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Employee Feedback</label>
              <textarea rows={3} value={form.employeeFeedback} onChange={(e) => set("employeeFeedback", e.target.value)} className={inputCls(false)} />
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
