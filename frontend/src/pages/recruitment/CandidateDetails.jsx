import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import CandidateStageBadge from "../../components/CandidateStageBadge";
import CandidateStatusBadge from "../../components/CandidateStatusBadge";
import RatingStars from "../../components/RatingStars";
import { getCandidateById, deleteCandidate } from "../../api/recruitmentApi";

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getCandidateById(id)
      .then(({ data }) => { if (data.success) setCandidate(data.candidate); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this candidate?")) return;
    try { await deleteCandidate(id); navigate("/recruitment/candidates"); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  if (loading)    return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;
  if (!candidate) return <DashboardLayout><div className="p-6 text-slate-400">Candidate not found.</div></DashboardLayout>;

  const c = candidate;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
            <div>
              <h1 className="text-2xl font-bold text-white">{c.name}</h1>
              <p className="text-slate-400 text-sm mt-1">{c.email} · {c.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/recruitment/candidates/${id}/stage`)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">Update Stage</button>
            <button onClick={() => navigate(`/recruitment/candidates/${id}/edit`)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Edit</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm transition-colors">Delete</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap gap-3 mb-5">
                <CandidateStageBadge stage={c.stage} />
                <CandidateStatusBadge status={c.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                {c.currentCompany    && <div><p className="text-slate-500">Current Company</p><p className="text-white">{c.currentCompany}</p></div>}
                {c.currentDesignation&& <div><p className="text-slate-500">Current Role</p><p className="text-white">{c.currentDesignation}</p></div>}
                <div><p className="text-slate-500">Experience</p><p className="text-white">{c.experienceYears ?? 0} years</p></div>
                {c.expectedSalary   && <div><p className="text-slate-500">Expected Salary</p><p className="text-white">₹{c.expectedSalary.toLocaleString()}</p></div>}
                {c.noticePeriod     && <div><p className="text-slate-500">Notice Period</p><p className="text-white">{c.noticePeriod}</p></div>}
                {c.address          && <div><p className="text-slate-500">Address</p><p className="text-white">{c.address}</p></div>}
              </div>
              {c.skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {c.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {c.notes && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{c.notes}</p>
                </div>
              )}
            </div>

            {/* Interview Info */}
            {(c.interviewDate || c.interviewFeedback) && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Interview Details</h3>
                <div className="space-y-3 text-sm">
                  {c.interviewDate && <div><span className="text-slate-400">Interview Date: </span><span className="text-white">{new Date(c.interviewDate).toLocaleDateString()}</span></div>}
                  {c.interviewer   && <div><span className="text-slate-400">Interviewer: </span><span className="text-white">{c.interviewer.name || c.interviewer}</span></div>}
                  {c.rating        && <div className="flex items-center gap-2"><span className="text-slate-400">Rating: </span><RatingStars rating={c.rating} /></div>}
                  {c.interviewFeedback && (
                    <div>
                      <p className="text-slate-400 mb-1">Feedback</p>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{c.interviewFeedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Job info */}
            {c.jobOpening && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Applied For</h3>
                <button onClick={() => navigate(`/recruitment/jobs/${c.jobOpening._id}`)} className="text-blue-400 hover:text-blue-300 text-sm transition-colors text-left">
                  {c.jobOpening.title}
                  <span className="block text-slate-500 text-xs mt-0.5">{c.jobOpening.department}</span>
                </button>
              </div>
            )}

            {/* Links */}
            {(c.resumeUrl || c.linkedinUrl || c.portfolioUrl) && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Links</h3>
                <div className="space-y-2">
                  {c.resumeUrl    && <a href={c.resumeUrl}    target="_blank" rel="noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm transition-colors">Resume</a>}
                  {c.linkedinUrl  && <a href={c.linkedinUrl}  target="_blank" rel="noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm transition-colors">LinkedIn</a>}
                  {c.portfolioUrl && <a href={c.portfolioUrl} target="_blank" rel="noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm transition-colors">Portfolio</a>}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Meta</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Added: </span><span className="text-slate-300">{new Date(c.createdAt).toLocaleDateString()}</span></div>
                <div><span className="text-slate-400">Updated: </span><span className="text-slate-300">{new Date(c.updatedAt).toLocaleDateString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
