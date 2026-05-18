import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "../../api/employeeApi";
import DashboardLayout from "../../components/DashboardLayout";
import PageHeader from "../../components/PageHeader";

// Shared Tailwind classes (plain functions, not components, to avoid re-mount issues)
const inputCls = (err) =>
  `w-full px-3 py-2.5 bg-slate-800/60 border ${
    err ? "border-red-500" : "border-slate-700"
  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`;

const selectCls =
  "w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";

const DEPARTMENTS = [
  "Engineering","HR","Finance","Marketing","Operations","Sales","Design","Legal","Admin",
];

const INITIAL = {
  firstName: "", lastName: "", email: "", phone: "", gender: "", dateOfBirth: "", address: "",
  employeeId: "", department: "", designation: "", employmentType: "full-time",
  joiningDate: "", status: "active",
  basicSalary: "",
  emergencyContactName: "", emergencyContactPhone: "",
};

const AddEmployee = () => {
  const navigate = useNavigate();
  const [form,        setForm]        = useState(INITIAL);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim())    errs.firstName    = "First name is required";
    if (!form.lastName.trim())     errs.lastName     = "Last name is required";
    if (!form.email)               errs.email        = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                   errs.email        = "Enter a valid email";
    if (!form.phone)               errs.phone        = "Phone is required";
    if (!form.employeeId.trim())   errs.employeeId   = "Employee ID is required";
    if (!form.department)          errs.department   = "Department is required";
    if (!form.designation)         errs.designation  = "Designation is required";
    if (!form.joiningDate)         errs.joiningDate  = "Joining date is required";
    if (form.basicSalary !== "" && Number(form.basicSalary) < 0)
                                   errs.basicSalary  = "Salary cannot be negative";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await createEmployee({
        ...form,
        basicSalary: form.basicSalary !== "" ? Number(form.basicSalary) : 0,
      });
      navigate("/employees");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Section wrapper ───────────────────────────────────────────────────────
  const Section = ({ title, children }) => (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-5">
      <h3 className="text-sm font-semibold text-white mb-4 pb-3 border-b border-slate-800">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  // ── Field label + error helper ────────────────────────────────────────────
  const Label = ({ name, label, required }) => (
    <label className="block text-xs font-medium text-slate-400 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
      {errors[name] && (
        <span className="ml-2 text-red-400 font-normal">{errors[name]}</span>
      )}
    </label>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Add Employee"
        subtitle="Fill in the details below to create a new employee record."
      />

      {serverError && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* ── 1. Personal Information ──────────────────────────────── */}
        <Section title="1. Personal Information">
          <div>
            <Label name="firstName" label="First Name" required />
            <input name="firstName" value={form.firstName} onChange={handleChange}
              placeholder="John" className={inputCls(errors.firstName)} />
          </div>
          <div>
            <Label name="lastName" label="Last Name" required />
            <input name="lastName" value={form.lastName} onChange={handleChange}
              placeholder="Smith" className={inputCls(errors.lastName)} />
          </div>
          <div>
            <Label name="email" label="Email Address" required />
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="john@company.com" className={inputCls(errors.email)} />
          </div>
          <div>
            <Label name="phone" label="Phone Number" required />
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder="+1 234 567 8900" className={inputCls(errors.phone)} />
          </div>
          <div>
            <Label name="gender" label="Gender" />
            <select name="gender" value={form.gender} onChange={handleChange} className={selectCls}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label name="dateOfBirth" label="Date of Birth" />
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
              className={inputCls(false)} />
          </div>
          <div className="sm:col-span-2">
            <Label name="address" label="Address" />
            <textarea name="address" value={form.address} onChange={handleChange} rows={2}
              placeholder="123 Main St, City, Country"
              className={`${inputCls(false)} resize-none`} />
          </div>
        </Section>

        {/* ── 2. Job Information ───────────────────────────────────── */}
        <Section title="2. Job Information">
          <div>
            <Label name="employeeId" label="Employee ID" required />
            <input name="employeeId" value={form.employeeId} onChange={handleChange}
              placeholder="EMP-001" className={inputCls(errors.employeeId)} />
          </div>
          <div>
            <Label name="department" label="Department" required />
            <input
              list="dept-list" name="department" value={form.department} onChange={handleChange}
              placeholder="e.g. Engineering" className={inputCls(errors.department)}
            />
            <datalist id="dept-list">
              {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <Label name="designation" label="Designation" required />
            <input name="designation" value={form.designation} onChange={handleChange}
              placeholder="Software Engineer" className={inputCls(errors.designation)} />
          </div>
          <div>
            <Label name="employmentType" label="Employment Type" />
            <select name="employmentType" value={form.employmentType} onChange={handleChange} className={selectCls}>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="intern">Intern</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div>
            <Label name="joiningDate" label="Joining Date" required />
            <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange}
              className={inputCls(errors.joiningDate)} />
          </div>
          <div>
            <Label name="status" label="Status" />
            <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </Section>

        {/* ── 3. Salary Information ────────────────────────────────── */}
        <Section title="3. Salary Information">
          <div>
            <Label name="basicSalary" label="Basic Monthly Salary" />
            <input name="basicSalary" type="number" min="0" value={form.basicSalary}
              onChange={handleChange} placeholder="0" className={inputCls(errors.basicSalary)} />
            {errors.basicSalary && (
              <p className="text-xs text-red-400 mt-1">{errors.basicSalary}</p>
            )}
          </div>
        </Section>

        {/* ── 4. Emergency Contact ─────────────────────────────────── */}
        <Section title="4. Emergency Contact">
          <div>
            <Label name="emergencyContactName" label="Contact Name" />
            <input name="emergencyContactName" value={form.emergencyContactName}
              onChange={handleChange} placeholder="Jane Smith" className={inputCls(false)} />
          </div>
          <div>
            <Label name="emergencyContactPhone" label="Contact Phone" />
            <input name="emergencyContactPhone" value={form.emergencyContactPhone}
              onChange={handleChange} placeholder="+1 234 567 8900" className={inputCls(false)} />
          </div>
        </Section>

        {/* ── Submit buttons ────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default AddEmployee;
