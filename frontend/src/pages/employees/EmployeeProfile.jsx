import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById, deleteEmployee } from "../../api/employeeApi";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import LoadingSpinner from "../../components/LoadingSpinner";

// Format a date string for display
const fmt = (val) =>
  val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

// A labelled info row inside a profile section
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-white font-medium">{value || "—"}</span>
  </div>
);

const EmployeeProfile = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employee,     setEmployee]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState("");
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [deleteError,  setDeleteError]  = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getEmployeeById(id);
        setEmployee(res.data.employee);
      } catch {
        setFetchError("Employee not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteEmployee(id);
      navigate("/employees");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete employee.");
      setShowConfirm(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading profile..." /></DashboardLayout>;

  if (fetchError) return (
    <DashboardLayout>
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">{fetchError}</div>
    </DashboardLayout>
  );

  const e = employee;

  return (
    <DashboardLayout>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Employee Profile"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/employees")}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate(`/employees/${id}/edit`)}
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

      {/* ── Identity card ────────────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">
            {e.firstName?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white">{e.firstName} {e.lastName}</h2>
            <StatusBadge status={e.status} />
            <StatusBadge status={e.employmentType} />
          </div>
          <p className="text-slate-400 text-sm">{e.designation} · {e.department}</p>
          <p className="text-slate-500 text-xs mt-1 font-mono">{e.employeeId}</p>
        </div>
      </div>

      {/* ── Sections grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Information */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="First Name"    value={e.firstName} />
            <InfoRow label="Last Name"     value={e.lastName} />
            <InfoRow label="Email"         value={e.email} />
            <InfoRow label="Phone"         value={e.phone} />
            <InfoRow label="Gender"        value={e.gender} />
            <InfoRow label="Date of Birth" value={fmt(e.dateOfBirth)} />
            <div className="sm:col-span-2">
              <InfoRow label="Address" value={e.address} />
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">
            Job Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Employee ID"      value={e.employeeId} />
            <InfoRow label="Department"       value={e.department} />
            <InfoRow label="Designation"      value={e.designation} />
            <InfoRow label="Employment Type"  value={e.employmentType} />
            <InfoRow label="Joining Date"     value={fmt(e.joiningDate)} />
            <InfoRow label="Status"           value={e.status} />
          </div>
        </div>

        {/* Salary Information */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">
            Salary Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              label="Basic Monthly Salary"
              value={e.basicSalary != null ? `$${Number(e.basicSalary).toLocaleString()}` : "—"}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Contact Name"  value={e.emergencyContactName} />
            <InfoRow label="Contact Phone" value={e.emergencyContactPhone} />
          </div>
        </div>
      </div>

      {/* System metadata */}
      <p className="text-xs text-slate-600 mt-4 text-right">
        Record created {fmt(e.createdAt)} · Last updated {fmt(e.updatedAt)}
      </p>

      {/* ── Delete confirmation ───────────────────────────────────────── */}
      {showConfirm && (
        <ConfirmModal
          title="Delete Employee"
          message={`Are you sure you want to permanently delete ${e.firstName} ${e.lastName}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default EmployeeProfile;
