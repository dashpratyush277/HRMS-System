import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import FormSection from "../../components/FormSection";
import { getCandidateById, updateCandidate } from "../../api/recruitmentApi";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${err ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm`;

export default function EditCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]       = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCandidateById(id).then(({ data }) => {
      if (data.success) {
        const c = data.candidate;
        setForm({
          name: c.name, email: c.email, phone: c.phone, address: c.address || "",
          currentCompany: c.currentCompany || "", currentDesignation: c.currentDesignation || "",
          experienceYears: c.experienceYears ?? 0, expectedSalary: c.expectedSalary || "",
          noticePeriod: c.noticePeriod || "", skills: (c.skills || []).join(", "),
          resumeUrl: c.resumeUrl || "", portfolioUrl: c.portfolioUrl || "", linkedinUrl: c.linkedinUrl || "",
        });
      }
    });
  }, [id]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name)  e.name  = "Required";
    if (!form.email) e.email = "Required";
    if (!form.phone) e.phone = "Required";
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
      await updateCandidate(id, payload);
      navigate(`/recruitment/candidates/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating candidate");
    }
    setLoading(false);
  };

  if (!form) return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Edit Candidate</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Personal Information">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Phone *</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(errors.phone)} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Address</label>
              <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls(false)} />
            </div>
          </FormSection>

          <FormSection title="Professional Details">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Current Company</label>
              <input value={form.currentCompany} onChange={(e) => set("currentCompany", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Current Designation</label>
              <input value={form.currentDesignation} onChange={(e) => set("currentDesignation", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Experience (years)</label>
              <input type="number" min="0" value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Expected Salary</label>
              <input type="number" min="0" value={form.expectedSalary} onChange={(e) => set("expectedSalary", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Notice Period</label>
              <input value={form.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Skills (comma separated)</label>
              <input value={form.skills} onChange={(e) => set("skills", e.target.value)} className={inputCls(false)} />
            </div>
          </FormSection>

          <FormSection title="Links">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Resume URL</label>
              <input value={form.resumeUrl} onChange={(e) => set("resumeUrl", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Portfolio URL</label>
              <input value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} className={inputCls(false)} />
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
