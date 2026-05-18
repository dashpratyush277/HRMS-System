import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import FormSection from "../../components/FormSection";
import { getJobOpeningById, updateJobOpening } from "../../api/recruitmentApi";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm`;

const selectCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm";

const toDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]       = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getJobOpeningById(id).then(({ data }) => {
      if (data.success) {
        const j = data.job;
        setForm({
          title: j.title, department: j.department, designation: j.designation || "",
          employmentType: j.employmentType || "full-time", location: j.location || "",
          openings: j.openings ?? 1, experienceRequired: j.experienceRequired || "",
          salaryRange: j.salaryRange || "", jobDescription: j.jobDescription,
          requirements: j.requirements || "", responsibilities: j.responsibilities || "",
          benefits: j.benefits || "", status: j.status, priority: j.priority,
          closingDate: toDate(j.closingDate),
        });
      }
    });
  }, [id]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.title)          e.title          = "Required";
    if (!form.department)     e.department     = "Required";
    if (!form.jobDescription) e.jobDescription = "Required";
    if (form.openings < 1)    e.openings       = "Must be at least 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.closingDate) delete payload.closingDate;
      await updateJobOpening(id, payload);
      navigate(`/recruitment/jobs/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating job");
    }
    setLoading(false);
  };

  if (!form) return (
    <DashboardLayout>
      <div className="p-6 text-slate-400">Loading...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Edit Job Opening</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Basic Information">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Job Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls(errors.title)} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Department *</label>
              <input value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls(errors.department)} />
              {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Designation</label>
              <input value={form.designation} onChange={(e) => set("designation", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Employment Type</label>
              <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={selectCls}>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="intern">Intern</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Location</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Number of Openings</label>
              <input type="number" min="1" value={form.openings} onChange={(e) => set("openings", Number(e.target.value))} className={inputCls(errors.openings)} />
              {errors.openings && <p className="text-red-400 text-xs mt-1">{errors.openings}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Experience Required</label>
              <input value={form.experienceRequired} onChange={(e) => set("experienceRequired", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Salary Range</label>
              <input value={form.salaryRange} onChange={(e) => set("salaryRange", e.target.value)} className={inputCls(false)} />
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
              <label className="block text-xs text-slate-400 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
                <option value="open">Open</option>
                <option value="on-hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Closing Date</label>
              <input type="date" value={form.closingDate} onChange={(e) => set("closingDate", e.target.value)} className={inputCls(false)} />
            </div>
          </FormSection>

          <FormSection title="Job Details">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Job Description *</label>
              <textarea rows={4} value={form.jobDescription} onChange={(e) => set("jobDescription", e.target.value)} className={inputCls(errors.jobDescription)} />
              {errors.jobDescription && <p className="text-red-400 text-xs mt-1">{errors.jobDescription}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Requirements</label>
              <textarea rows={3} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} className={inputCls(false)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Responsibilities</label>
              <textarea rows={3} value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} className={inputCls(false)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Benefits</label>
              <textarea rows={2} value={form.benefits} onChange={(e) => set("benefits", e.target.value)} className={inputCls(false)} />
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
