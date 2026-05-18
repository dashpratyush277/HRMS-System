import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEmployees, deleteEmployee } from "../../api/employeeApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const LIMIT = 10;

// Shared Tailwind classes for filter controls
const filterCls =
  "px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

const EmployeeList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees,   setEmployees]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [page,        setPage]        = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  // Filter state
  const [search,         setSearch]         = useState("");
  const [department,     setDepartment]     = useState("");
  const [status,         setStatus]         = useState("");
  const [employmentType, setEmploymentType] = useState("");

  // Reset to page 1 whenever a filter changes
  useEffect(() => { setPage(1); }, [search, department, status, employmentType]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (search)         params.search         = search;
      if (department)     params.department     = department;
      if (status)         params.status         = status;
      if (employmentType) params.employmentType = employmentType;

      const res = await getEmployees(params);
      setEmployees(res.data.employees);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search, department, status, employmentType, page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget.id);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete employee");
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Pagination helper ───────────────────────────────────────────────────────
  const showingFrom = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const showingTo   = Math.min(page * LIMIT, total);

  return (
    <DashboardLayout>
      <PageHeader
        title="Employees"
        subtitle={`${total} employee${total !== 1 ? "s" : ""} in total`}
        action={
          <button
            onClick={() => navigate("/employees/add")}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        }
      />

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${filterCls} pl-9`}
            />
          </div>

          {/* Department */}
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={filterCls}>
            <option value="">All Departments</option>
            {["Engineering","HR","Finance","Marketing","Operations","Sales","Design","Legal","Admin"]
              .map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Status */}
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={filterCls}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>

          {/* Employment Type */}
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={filterCls}>
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="intern">Intern</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner />
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          message={search || department || status || employmentType
            ? "Try adjusting your search or filters."
            : "Get started by adding your first employee."}
          action={
            <button
              onClick={() => navigate("/employees/add")}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              Add Employee
            </button>
          }
        />
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {/* ── Table ──────────────────────────────────────────────────── */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Department</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Type</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">{emp.employeeId}</td>
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{emp.designation}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400 hidden md:table-cell">{emp.email}</td>
                    <td className="py-4 px-4 text-slate-400 hidden lg:table-cell">{emp.department}</td>
                    <td className="py-4 px-4 hidden xl:table-cell">
                      <StatusBadge status={emp.employmentType} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => navigate(`/employees/${emp._id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View profile"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/employees/${emp._id}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Delete — admin only */}
                        {user?.role === "admin" && (
                          <button
                            onClick={() =>
                              setDeleteTarget({ id: emp._id, name: `${emp.firstName} ${emp.lastName}` })
                            }
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────────── */}
          <div className="px-4 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Showing <span className="text-white">{showingFrom}–{showingTo}</span> of{" "}
              <span className="text-white">{total}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    page === p
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Employee"
          message={`Are you sure you want to permanently delete ${deleteTarget.name}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default EmployeeList;
