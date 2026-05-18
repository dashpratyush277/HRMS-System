import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import JobStatusBadge from "../../components/JobStatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import { getJobOpenings, updateJobStatus, deleteJobOpening } from "../../api/recruitmentApi";

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage]       = useState(1);
  const limit = 15;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getJobOpenings({ search, status, priority, page, limit });
      if (data.success) { setJobs(data.jobs); setTotal(data.total); }
    } catch { /* handled */ }
    setLoading(false);
  }, [search, status, priority, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { setPage(1); }, [search, status, priority]);

  const handleStatusChange = async (id, newStatus) => {
    try { await updateJobStatus(id, newStatus); fetchJobs(); } catch { /* handled */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job opening?")) return;
    try { await deleteJobOpening(id); fetchJobs(); } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Job Openings</h1>
            <p className="text-slate-400 text-sm mt-1">{total} openings found</p>
          </div>
          <button
            onClick={() => navigate("/recruitment/jobs/new")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            + New Job
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, department..."
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm w-64 focus:outline-none focus:border-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="on-hold">On Hold</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No job openings found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Title</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Department</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Type</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Openings</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Candidates</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Priority</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/recruitment/jobs/${job._id}`)}
                        className="text-white font-medium hover:text-blue-400 transition-colors text-left"
                      >
                        {job.title}
                      </button>
                      {job.location && <p className="text-slate-500 text-xs mt-0.5">{job.location}</p>}
                    </td>
                    <td className="p-4 text-slate-300">{job.department}</td>
                    <td className="p-4 text-slate-300">{job.employmentType || "—"}</td>
                    <td className="p-4 text-slate-300">{job.openings ?? "—"}</td>
                    <td className="p-4 text-slate-300">{job.candidateCount}</td>
                    <td className="p-4"><PriorityBadge priority={job.priority} /></td>
                    <td className="p-4"><JobStatusBadge status={job.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job._id, e.target.value)}
                          className="px-2 py-1 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                        <button
                          onClick={() => navigate(`/recruitment/jobs/${job._id}/edit`)}
                          className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-slate-400 text-sm">Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
