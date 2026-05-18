import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDepartmentById, updateDepartment } from "../../api/departmentApi";
import { getEmployees }                        from "../../api/employeeApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import FormSection     from "../../components/FormSection";
import LoadingSpinner  from "../../components/LoadingSpinner";

const inputCls = (err) =>
  `w-full px-4 py-2.5 bg-slate-800 border ${
    err ? "border-red-500" : "border-slate-700"
  } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`;

const selectCls =
  "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors";

const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-400 mb-1.5">
    {children}{required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

const EditDepartment = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form,       setForm]       = useState(null);
  const [errors,     setErrors]     = useState({});
  const [apiError,   setApiError]   = useState("");
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [employees,  setEmployees]  = useState([]);

  useEffect(() => {
    Promise.all([
      getDepartmentById(id),
      getEmployees({ limit: 200, status: "active" }),
    ])
      .then(([deptRes, empRes]) => {
        const d = deptRes.data.department;
        setForm({
          name:              d.name              || "",
          code:              d.code              || "",
          description:       d.description       || "",
          location:          d.location          || "",
          headOfDepartment:  d.headOfDepartment?._id || "",
          status:            d.status            || "active",
        });
        setEmployees(empRes.data.employees || []);
      })
      .catch(() => setFetchError("Failed to load department."))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Department name is required.";
    if (!form.code.trim()) e.code = "Department code is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    setApiError("");
    try {
      await updateDepartment(id, { ...form, code: form.code.toUpperCase() });
      navigate(`/departments/${id}`);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update department.");
    } finally {
      setSubmitting(false);
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
        title="Edit Department"
        action={
          <button
            onClick={() => navigate(`/departments/${id}`)}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            ← Back
          </button>
        }
      />

      {apiError && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Department Information">
          <div>
            <Label required>Department Name</Label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label required>Department Code</Label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              maxLength={10}
              className={inputCls(errors.code)}
            />
            {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code}</p>}
          </div>
          <div>
            <Label>Location</Label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputCls(false)}
            />
          </div>
          <div>
            <Label>Head of Department</Label>
            <select
              value={form.headOfDepartment}
              onChange={(e) => set("headOfDepartment", e.target.value)}
              className={selectCls}
            >
              <option value="">— None —</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.designation})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`${inputCls(false)} resize-none`}
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={selectCls}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </FormSection>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/departments/${id}`)}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default EditDepartment;
