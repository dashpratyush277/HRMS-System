import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDepartments, deleteDepartment } from "../../api/departmentApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import StatusBadge     from "../../components/StatusBadge";
import ConfirmModal    from "../../components/ConfirmModal";
import LoadingSpinner  from "../../components/LoadingSpinner";
import EmptyState      from "../../components/EmptyState";

const DepartmentList = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("");
  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState(null);
  const [toDelete,    setToDelete]    = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDepartments({ search, status, page, limit: 10 });
      setDepartments(res.data.departments);
      setPagination(res.data.pagination);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);
  useEffect(() => { setPage(1); }, [search, status]);

  const handleDelete = async () => {
    try {
      await deleteDepartment(toDelete._id);
      setToDelete(null);
      fetchDepartments();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete department.");
      setToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Departments"
        action={
          <button
            onClick={() => navigate("/departments/add")}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
          >
            + Add Department
          </button>
        }
      />

      {deleteError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {deleteError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code or location…"
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading departments…" />
        ) : departments.length === 0 ? (
          <EmptyState message="No departments found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {["Name", "Code", "Location", "Head of Dept", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {departments.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white">{d.name}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300 text-xs">{d.code}</td>
                    <td className="px-5 py-3.5 text-slate-400">{d.location || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {d.headOfDepartment
                        ? `${d.headOfDepartment.firstName} ${d.headOfDepartment.lastName}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/departments/${d._id}`)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/departments/${d._id}/edit`)}
                          className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
                        >
                          Edit
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => { setDeleteError(""); setToDelete(d); }}
                            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete Department"
          message={`Are you sure you want to delete "${toDelete.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default DepartmentList;
