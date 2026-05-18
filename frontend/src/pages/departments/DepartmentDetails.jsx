import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDepartmentById, deleteDepartment } from "../../api/departmentApi";
import { useAuth }         from "../../context/AuthContext";
import DashboardLayout     from "../../components/DashboardLayout";
import PageHeader          from "../../components/PageHeader";
import StatusBadge         from "../../components/StatusBadge";
import ConfirmModal        from "../../components/ConfirmModal";
import LoadingSpinner      from "../../components/LoadingSpinner";

const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-white font-medium">{value || "—"}</span>
  </div>
);

const DepartmentDetails = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dept,        setDept]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    getDepartmentById(id)
      .then((r) => setDept(r.data.department))
      .catch(() => setFetchError("Department not found or failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteDepartment(id);
      navigate("/departments");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete department.");
      setShowConfirm(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading department…" /></DashboardLayout>;

  if (fetchError) return (
    <DashboardLayout>
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">{fetchError}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Department Details"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/departments")}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate(`/departments/${id}/edit`)}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
            >
              Edit
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        }
      />

      {deleteError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {deleteError}
        </div>
      )}

      {/* Identity card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">{dept.code?.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white">{dept.name}</h2>
            <StatusBadge status={dept.status} />
          </div>
          <p className="text-slate-400 text-sm font-mono">{dept.code}</p>
          {dept.location && <p className="text-slate-500 text-xs mt-1">{dept.location}</p>}
        </div>
        <div className="bg-slate-800/50 rounded-xl px-5 py-3 text-center flex-shrink-0">
          <p className="text-2xl font-bold text-white">{dept.employeeCount ?? 0}</p>
          <p className="text-xs text-slate-400 mt-0.5">Employees</p>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">
            Department Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Department Name" value={dept.name} />
            <InfoRow label="Code"            value={dept.code} />
            <InfoRow label="Location"        value={dept.location} />
            <InfoRow label="Status"          value={dept.status} />
            {dept.description && (
              <div className="sm:col-span-2">
                <InfoRow label="Description" value={dept.description} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">
            Head of Department
          </h3>
          {dept.headOfDepartment ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                label="Name"
                value={`${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}`}
              />
              <InfoRow label="Designation" value={dept.headOfDepartment.designation} />
              <InfoRow label="Employee ID"  value={dept.headOfDepartment.employeeId} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">No head of department assigned.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-4 text-right">
        Created {fmt(dept.createdAt)} · Last updated {fmt(dept.updatedAt)}
      </p>

      {showConfirm && (
        <ConfirmModal
          title="Delete Department"
          message={`Are you sure you want to permanently delete "${dept.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default DepartmentDetails;
