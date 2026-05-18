import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import CandidateStageBadge from "../../components/CandidateStageBadge";
import CandidateStatusBadge from "../../components/CandidateStatusBadge";
import RatingStars from "../../components/RatingStars";
import { getCandidates, deleteCandidate } from "../../api/recruitmentApi";

export default function CandidateList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [stage, setStage]           = useState("");
  const [status, setStatus]         = useState("");
  const [page, setPage]             = useState(1);
  const limit = 15;
  const jobFilter = searchParams.get("job") || "";

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, stage, status, page, limit };
      if (jobFilter) params.jobOpening = jobFilter;
      const { data } = await getCandidates(params);
      if (data.success) { setCandidates(data.candidates); setTotal(data.total); }
    } catch { /* handled */ }
    setLoading(false);
  }, [search, stage, status, page, jobFilter]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);
  useEffect(() => { setPage(1); }, [search, stage, status]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try { await deleteCandidate(id); fetchCandidates(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Candidates</h1>
            <p className="text-slate-400 text-sm mt-1">{total} candidates found</p>
          </div>
          <button
            onClick={() => navigate("/recruitment/candidates/new")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            + Add Candidate
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, skills..."
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm w-64 focus:outline-none focus:border-blue-500"
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Stages</option>
            {["applied","screening","interview","technical","hr-round","selected","rejected","offered","joined"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : candidates.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No candidates found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Candidate</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Job</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Experience</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Stage</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Rating</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/recruitment/candidates/${c._id}`)}
                        className="text-white font-medium hover:text-blue-400 transition-colors text-left"
                      >
                        {c.name}
                      </button>
                      <p className="text-slate-500 text-xs">{c.email}</p>
                      {c.phone && <p className="text-slate-500 text-xs">{c.phone}</p>}
                    </td>
                    <td className="p-4">
                      {c.jobOpening ? (
                        <button onClick={() => navigate(`/recruitment/jobs/${c.jobOpening._id}`)} className="text-slate-300 hover:text-blue-400 text-xs transition-colors text-left">
                          {c.jobOpening.title}
                          <span className="block text-slate-500">{c.jobOpening.department}</span>
                        </button>
                      ) : "—"}
                    </td>
                    <td className="p-4 text-slate-300">{c.experienceYears != null ? `${c.experienceYears} yrs` : "—"}</td>
                    <td className="p-4"><CandidateStageBadge stage={c.stage} /></td>
                    <td className="p-4"><CandidateStatusBadge status={c.status} /></td>
                    <td className="p-4"><RatingStars rating={c.rating} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/recruitment/candidates/${c._id}/stage`)} className="px-2 py-1 text-xs text-green-400 hover:text-green-300 transition-colors">Stage</button>
                        <button onClick={() => navigate(`/recruitment/candidates/${c._id}/edit`)} className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(c._id)} className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40">Prev</button>
            <span className="text-slate-400 text-sm">Page {page} of {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
