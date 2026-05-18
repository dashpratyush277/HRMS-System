import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import JobStatusBadge from "../../components/JobStatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import CandidateStageBadge from "../../components/CandidateStageBadge";
import CandidateStatusBadge from "../../components/CandidateStatusBadge";
import RatingStars from "../../components/RatingStars";
import { getJobOpeningById, deleteJobOpening } from "../../api/recruitmentApi";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob]               = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    getJobOpeningById(id)
      .then(({ data }) => { if (data.success) { setJob(data.job); setCandidates(data.candidates); } })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this job opening?")) return;
    try { await deleteJobOpening(id); navigate("/recruitment/jobs"); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  if (loading) return <DashboardLayout><div className="p-6 text-slate-400">Loading...</div></DashboardLayout>;
  if (!job)    return <DashboardLayout><div className="p-6 text-slate-400">Job not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
            <div>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              <p className="text-slate-400 text-sm mt-1">{job.department} {job.designation && `· ${job.designation}`} {job.location && `· ${job.location}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/recruitment/candidates/new?job=${job._id}`)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
              + Add Candidate
            </button>
            <button onClick={() => navigate(`/recruitment/jobs/${id}/edit`)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              Edit
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-colors">
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <JobStatusBadge status={job.status} />
                <PriorityBadge priority={job.priority} />
                {job.employmentType && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                    {job.employmentType}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6">
                <div><p className="text-slate-500">Openings</p><p className="text-white font-semibold">{job.openings}</p></div>
                <div><p className="text-slate-500">Candidates</p><p className="text-white font-semibold">{job.candidateCount}</p></div>
                {job.experienceRequired && <div><p className="text-slate-500">Experience</p><p className="text-white font-semibold">{job.experienceRequired}</p></div>}
                {job.salaryRange && <div><p className="text-slate-500">Salary</p><p className="text-white font-semibold">{job.salaryRange}</p></div>}
                {job.closingDate && <div><p className="text-slate-500">Closes</p><p className="text-white font-semibold">{new Date(job.closingDate).toLocaleDateString()}</p></div>}
              </div>
              {job.jobDescription && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{job.jobDescription}</p>
                </div>
              )}
              {job.requirements && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Requirements</h3>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{job.requirements}</p>
                </div>
              )}
              {job.responsibilities && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Responsibilities</h3>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{job.responsibilities}</p>
                </div>
              )}
              {job.benefits && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Benefits</h3>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{job.benefits}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Meta */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Job Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Posted</span><span className="text-slate-300">{new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span></div>
                {job.location && <div className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-slate-300">{job.location}</span></div>}
                {job.designation && <div className="flex justify-between"><span className="text-slate-400">Designation</span><span className="text-slate-300">{job.designation}</span></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Candidates ({candidates.length})</h3>
            <button onClick={() => navigate(`/recruitment/candidates?job=${id}`)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">View All →</button>
          </div>
          {candidates.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No candidates yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Name</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Stage</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Rating</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 10).map((c) => (
                  <tr key={c._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-slate-500 text-xs">{c.email}</p>
                    </td>
                    <td className="p-4"><CandidateStageBadge stage={c.stage} /></td>
                    <td className="p-4"><CandidateStatusBadge status={c.status} /></td>
                    <td className="p-4"><RatingStars rating={c.rating} /></td>
                    <td className="p-4">
                      <button onClick={() => navigate(`/recruitment/candidates/${c._id}`)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
