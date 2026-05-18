import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import FormSection from "../../components/FormSection";
import { createReview } from "../../api/performanceApi";
import { getGoals } from "../../api/performanceApi";
import { getEmployees } from "../../api/employeeApi";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm`;

const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm";

const RATING_FIELDS = [
  { key: "productivityRating", label: "Productivity" },
  { key: "qualityRating",      label: "Quality" },
  { key: "teamworkRating",     label: "Teamwork" },
  { key: "communicationRating",label: "Communication" },
  { key: "leadershipRating",   label: "Leadership" },
];

export default function AddReview() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [employeeGoals, setEmployeeGoals] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const [form, setForm] = useState({
    employee: "", reviewPeriod: "", startDate: "", endDate: "",
    productivityRating: "", qualityRating: "", teamworkRating: "",
    communicationRating: "", leadershipRating: "",
    strengths: "", improvements: "", managerFeedback: "", employeeFeedback: "",
    status: "draft",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmployees({ limit: 200, status: "active" }).then(({ data }) => {
      if (data.success) setEmployees(data.employees);
    });
  }, []);

  useEffect(() => {
    if (!form.employee) { setEmployeeGoals([]); return; }
    getGoals({ employee: form.employee, limit: 100 }).then(({ data }) => {
      if (data.success) setEmployeeGoals(data.goals);
    });
  }, [form.employee]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const toggleGoal = (id) => setSelectedGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);

  const validate = () => {
    const e = {};
    if (!form.employee)     e.employee     = "Required";
    if (!form.reviewPeriod) e.reviewPeriod = "Required";
    if (!form.startDate)    e.startDate    = "Required";
    if (!form.endDate)      e.endDate      = "Required";
    if (form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate))
      e.endDate = "End date cannot be before start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, goals: selectedGoals };
      RATING_FIELDS.forEach(({ key }) => { if (payload[key] === "") delete payload[key]; else payload[key] = Number(payload[key]); });
      await createReview(payload);
      navigate("/performance/reviews");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating review");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">New Performance Review</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Review Setup">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Employee *</label>
              <select value={form.employee} onChange={(e) => set("employee", e.target.value)} className={`${selectCls} ${errors.employee ? "border-red-500" : ""}`}>
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                ))}
              </select>
              {errors.employee && <p className="text-red-400 text-xs mt-1">{errors.employee}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Review Period *</label>
              <input value={form.reviewPeriod} onChange={(e) => set("reviewPeriod", e.target.value)} className={inputCls(errors.reviewPeriod)} placeholder="e.g. Q1 2025 / Jan–Mar 2025" />
              {errors.reviewPeriod && <p className="text-red-400 text-xs mt-1">{errors.reviewPeriod}</p>}
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
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
          </FormSection>

          {/* Goals selection */}
          {employeeGoals.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Link Goals</h3>
              <div className="space-y-2">
                {employeeGoals.map((g) => (
                  <label key={g._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedGoals.includes(g._id)}
                      onChange={() => toggleGoal(g._id)}
                      className="accent-blue-500"
                    />
                    <span className="text-slate-300 text-sm">{g.title}</span>
                    <span className="text-slate-500 text-xs">({g.status}, {g.progress}%)</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
              <textarea rows={3} value={form.strengths} onChange={(e) => set("strengths", e.target.value)} className={inputCls(false)} placeholder="Key strengths..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Areas for Improvement</label>
              <textarea rows={3} value={form.improvements} onChange={(e) => set("improvements", e.target.value)} className={inputCls(false)} placeholder="Areas to work on..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Manager Feedback</label>
              <textarea rows={3} value={form.managerFeedback} onChange={(e) => set("managerFeedback", e.target.value)} className={inputCls(false)} placeholder="Manager's overall feedback..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Employee Feedback</label>
              <textarea rows={3} value={form.employeeFeedback} onChange={(e) => set("employeeFeedback", e.target.value)} className={inputCls(false)} placeholder="Employee's self-assessment..." />
            </div>
          </FormSection>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? "Creating..." : "Create Review"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
