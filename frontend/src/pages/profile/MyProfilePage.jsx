import { useState, useEffect, useCallback } from "react";
import {
  UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon,
  IdentificationIcon, BuildingOfficeIcon, ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth }              from "../../context/AuthContext";
import { getMyProfile, updateMyProfile, getMyProfileSummary } from "../../api/profileApi";
import DashboardLayout          from "../../components/DashboardLayout";
import UserAvatar               from "../../components/profile/UserAvatar";
import ProfilePictureUpload     from "../../components/profile/ProfilePictureUpload";
import ChangePasswordCard       from "../../components/profile/ChangePasswordCard";
import ProfileSummaryCards      from "../../components/profile/ProfileSummaryCards";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const ROLE_COLORS = {
  admin:    "bg-red-500/15    text-red-400    border border-red-500/30",
  hr:       "bg-blue-500/15   text-blue-400   border border-blue-500/30",
  employee: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};
const STATUS_COLORS = {
  active:     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  inactive:   "bg-yellow-500/15  text-yellow-400  border border-yellow-500/30",
  terminated: "bg-red-500/15     text-red-400     border border-red-500/30",
};
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")} ${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}`;
};

/* ── InfoRow — read-only display ─────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-slate-700/40 last:border-0">
    <span className="text-slate-500 text-xs font-medium uppercase tracking-wide w-40 flex-shrink-0">{label}</span>
    <span className="text-slate-200 text-sm">{value || <span className="text-slate-600 italic">Not provided</span>}</span>
  </div>
);

/* ── Editable Field ──────────────────────────────────────────────────────── */
const Field = ({ label, name, value, onChange, type = "text", options }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
    {options ? (
      <select
        name={name} value={value || ""} onChange={onChange}
        className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white
          text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input
        type={type} name={name} value={value || ""} onChange={onChange}
        className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white
          placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50
          focus:border-blue-500/50 transition-all"
      />
    )}
  </div>
);

/* ── Section card ────────────────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6
    shadow-[0_8px_32px_rgba(0,0,0,0.2)] ${className}`}>
    {children}
  </div>
);

/* ── Component ───────────────────────────────────────────────────────────── */
export default function MyProfilePage() {
  const { user: authUser, updateCurrentUser } = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");
  const [saveErr,  setSaveErr]  = useState("");

  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profRes, sumRes] = await Promise.all([getMyProfile(), getMyProfileSummary()]);
      setProfile(profRes.data);
      setSummary(sumRes.data.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = () => {
    const { user, employee } = profile || {};
    setForm({
      name:        user?.name        || "",
      phone:       user?.phone       || employee?.phone || "",
      address:     employee?.address || "",
      dateOfBirth: employee?.dateOfBirth ? employee.dateOfBirth.slice(0, 10) : "",
      gender:      employee?.gender  || "",
    });
    setSaveMsg(""); setSaveErr(""); setEditing(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setSaveErr(""); setSaveMsg("");
    try {
      const res = await updateMyProfile(form);
      setProfile((prev) => ({ ...prev, user: res.data.user, employee: res.data.employee }));
      updateCurrentUser({ name: res.data.user.name, phone: res.data.user.phone });
      setSaveMsg("Profile updated successfully.");
      setEditing(false);
    } catch (e) {
      setSaveErr(e.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-64 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading profile…</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button onClick={load} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">
            Try again
          </button>
        </div>
      ) : (() => {
        const { user, employee } = profile || {};
        const role = authUser?.role || user?.role;

        return (
          <div className="max-w-5xl mx-auto space-y-5">

            {/* ── Hero card ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl
              border border-slate-800/80 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              {/* Cover gradient */}
              <div className="h-28 bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-purple-900/30 dashboard-wave-bg" />

              <div className="px-6 pb-6">
                {/* Avatar + name row */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
                  <div className="flex items-end gap-4">
                    <div className="ring-4 ring-slate-900 rounded-full shadow-lg">
                      <UserAvatar user={authUser || user} size="xl" />
                    </div>
                    <div className="pb-1">
                      <h1 className="text-2xl font-bold text-white leading-tight">{user?.name}</h1>
                      <p className="text-slate-400 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  {/* Badges + photo button */}
                  <div className="flex items-center gap-2 flex-wrap sm:pb-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[role] || "bg-slate-700 text-slate-300"}`}>
                      {role}
                    </span>
                    {employee?.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[employee.status] || "bg-slate-700 text-slate-300"}`}>
                        {employee.status}
                      </span>
                    )}
                    <button
                      onClick={() => setShowPhotoUpload((s) => !s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80
                        text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all
                        border border-slate-700/60 hover:border-blue-500/40"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      {showPhotoUpload ? "Close" : "Change Photo"}
                    </button>
                  </div>
                </div>

                {/* Employee quick-info pills */}
                {employee && (
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800/60">
                    {employee.employeeId && (
                      <span className="text-xs text-slate-500">ID: <span className="text-slate-300 font-medium">{employee.employeeId}</span></span>
                    )}
                    {employee.department && (
                      <span className="text-xs text-slate-500">Dept: <span className="text-slate-300 font-medium">{employee.department}</span></span>
                    )}
                    {employee.designation && (
                      <span className="text-xs text-slate-500">Role: <span className="text-slate-300 font-medium">{employee.designation}</span></span>
                    )}
                    {employee.joiningDate && (
                      <span className="text-xs text-slate-500">Since: <span className="text-slate-300 font-medium">{fmtDate(employee.joiningDate)}</span></span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Photo upload (toggleable) ─────────────────────────── */}
            {showPhotoUpload && (
              <Card>
                <ProfilePictureUpload />
              </Card>
            )}

            {/* ── Save success banner ───────────────────────────────── */}
            {saveMsg && (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                <CheckIcon className="w-4 h-4 flex-shrink-0" /> {saveMsg}
              </div>
            )}

            {/* ── 3-col grid ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* LEFT col-span-2 */}
              <div className="lg:col-span-2 space-y-5">

                {/* Personal Information */}
                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <UserCircleIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-white font-semibold">Personal Information</h2>
                        <p className="text-slate-500 text-xs">Your basic personal details</p>
                      </div>
                    </div>
                    {!editing && (
                      <button
                        onClick={startEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white
                          bg-slate-800/60 hover:bg-slate-700/60 rounded-xl border border-slate-700/60
                          hover:border-blue-500/40 transition-all"
                      >
                        <PencilIcon className="w-4 h-4" /> Edit
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name"     name="name"        value={form.name}        onChange={handleChange} />
                        <Field label="Phone"         name="phone"       value={form.phone}       onChange={handleChange} type="tel" />
                        <Field label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date" />
                        <Field label="Gender"        name="gender"      value={form.gender}      onChange={handleChange}
                          options={[{ value:"male",label:"Male" },{ value:"female",label:"Female" },{ value:"other",label:"Other" }]} />
                      </div>
                      <Field label="Address" name="address" value={form.address} onChange={handleChange} />

                      {saveErr && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{saveErr}</div>
                      )}

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={handleSave} disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
                            disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
                        >
                          {saving
                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                            : <><CheckIcon className="w-4 h-4" /> Save Changes</>}
                        </button>
                        <button
                          onClick={() => setEditing(false)} disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60
                            disabled:opacity-60 text-slate-300 rounded-xl text-sm font-medium transition-all border border-slate-700/60"
                        >
                          <XMarkIcon className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <InfoRow label="Full Name"     value={user?.name} />
                      <InfoRow label="Email"         value={user?.email} />
                      <InfoRow label="Phone"         value={user?.phone || employee?.phone} />
                      <InfoRow label="Date of Birth" value={employee?.dateOfBirth ? fmtDate(employee.dateOfBirth) : null} />
                      <InfoRow label="Gender"        value={employee?.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : null} />
                      <InfoRow label="Address"       value={employee?.address} />
                    </div>
                  )}
                </Card>

                {/* Employment Details */}
                {employee && (
                  <Card>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <IdentificationIcon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-white font-semibold">Employment Details</h2>
                        <p className="text-slate-500 text-xs">Managed by HR — read only</p>
                      </div>
                    </div>
                    <InfoRow label="Employee ID"     value={employee.employeeId} />
                    <InfoRow label="Department"      value={employee.department} />
                    <InfoRow label="Designation"     value={employee.designation} />
                    <InfoRow label="Employment Type" value={employee.employmentType?.replace("-", " ")} />
                    <InfoRow label="Status"          value={
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[employee.status] || ""}`}>
                        {employee.status}
                      </span>
                    } />
                    <InfoRow label="Joining Date"    value={fmtDate(employee.joiningDate)} />
                    <InfoRow label="Basic Salary"    value={employee.basicSalary != null ? `₹${Number(employee.basicSalary).toLocaleString("en-IN")}` : null} />
                  </Card>
                )}

                {/* Emergency Contact */}
                {employee && (employee.emergencyContactName || employee.emergencyContactPhone) && (
                  <Card>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                        <ShieldCheckIcon className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-white font-semibold">Emergency Contact</h2>
                        <p className="text-slate-500 text-xs">In case of emergency</p>
                      </div>
                    </div>
                    <InfoRow label="Name"  value={employee.emergencyContactName} />
                    <InfoRow label="Phone" value={employee.emergencyContactPhone} />
                  </Card>
                )}
              </div>

              {/* RIGHT column */}
              <div className="space-y-5">

                {/* Account Info */}
                <Card>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-slate-700/60 rounded-xl border border-slate-600/40">
                      <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">Account Info</h2>
                      <p className="text-slate-500 text-xs">Authentication &amp; access</p>
                    </div>
                  </div>
                  <InfoRow label="Role"    value={
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[role] || ""}`}>
                      {role}
                    </span>
                  } />
                  <InfoRow label="Status"  value={user?.isActive
                    ? <span className="text-emerald-400 text-xs font-semibold">Active</span>
                    : <span className="text-red-400 text-xs font-semibold">Inactive</span>}
                  />
                  <InfoRow label="Joined"  value={fmtDate(user?.createdAt)} />
                  <InfoRow label="Updated" value={fmtDate(user?.updatedAt)} />
                </Card>

                {/* Change Password */}
                <ChangePasswordCard />
              </div>
            </div>

            {/* ── Summary / activity cards ──────────────────────────── */}
            <ProfileSummaryCards summary={summary} role={role} />
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
