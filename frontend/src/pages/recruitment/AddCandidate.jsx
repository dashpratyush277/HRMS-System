import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import FormSection from "../../components/FormSection";
import { addCandidate } from "../../api/recruitmentApi";
import { getJobOpenings } from "../../api/recruitmentApi";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm`;

const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm";

export default function AddCandidate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedJob = searchParams.get("job") || "";

  const [jobs, setJobs]   = useState([]);
  const [form, setForm]   = useState({
    jobOpening: preselectedJob, name: "", email: "", phone: "", address: "",
    currentCompany: "", currentDesignation: "", experienceYears: 0,
    expectedSalary: "", noticePeriod: "", skills: "",
    resumeUrl: "", portfolioUrl: "", linkedinUrl: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getJobOpenings({ status: "open", limit: 100 }).then(({ data }) => {
      if (data.success) setJobs(data.jobs);
    });
  }, []);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.jobOpening) e.jobOpening = "Required";
    if (!form.name)       e.name       = "Required";
    if (!form.email)      e.email      = "Required";
    if (!form.phone)      e.phone      = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears) || 0,
        expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : undefined,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      await addCandidate(payload);
      navigate("/recruitment/candidates");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding candidate");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Add Candidate</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Application">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Job Opening *</label>
              <select value={form.jobOpening} onChange={(e) => set("jobOpening", e.target.value)} className={`${selectCls} ${errors.jobOpening ? "border-red-500" : ""}`}>
                <option value="">Select a job</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.title} — {j.department}</option>
                ))}
              </select>
              {errors.jobOpening && <p className="text-red-400 text-xs mt-1">{errors.jobOpening}</p>}
            </div>
          </FormSection>

          <FormSection title="Personal Information">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} placeholder="John Doe" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} placeholder="john@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Phone *</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(errors.phone)} placeholder="+91 98765 43210" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Address</label>
              <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls(false)} placeholder="City, State" />
            </div>
          </FormSection>

          <FormSection title="Professional Details">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Current Company</label>
              <input value={form.currentCompany} onChange={(e) => set("currentCompany", e.target.value)} className={inputCls(false)} placeholder="Company name" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Current Designation</label>
              <input value={form.currentDesignation} onChange={(e) => set("currentDesignation", e.target.value)} className={inputCls(false)} placeholder="Current role" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Experience (years)</label>
              <input type="number" min="0" value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Expected Salary</label>
              <input type="number" min="0" value={form.expectedSalary} onChange={(e) => set("expectedSalary", e.target.value)} className={inputCls(false)} placeholder="Annual in ₹" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Notice Period</label>
              <input value={form.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} className={inputCls(false)} placeholder="e.g. 30 days" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Skills (comma separated)</label>
              <input value={form.skills} onChange={(e) => set("skills", e.target.value)} className={inputCls(false)} placeholder="React, Node.js, MongoDB" />
            </div>
          </FormSection>

          <FormSection title="Links">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Resume URL</label>
              <input value={form.resumeUrl} onChange={(e) => set("resumeUrl", e.target.value)} className={inputCls(false)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} className={inputCls(false)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Portfolio URL</label>
              <input value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} className={inputCls(false)} placeholder="https://..." />
            </div>
          </FormSection>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? "Adding..." : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
