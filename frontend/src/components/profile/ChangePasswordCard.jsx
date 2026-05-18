import { useState } from "react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { changePassword } from "../../api/profileApi";

const InputRow = ({ label, name, value, onChange, show, onToggle, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "••••••••"}
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 pr-10
          text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2
          focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
      >
        {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const INIT = { currentPassword: "", newPassword: "", confirmPassword: "" };
const SHOW_INIT = { current: false, new: false, confirm: false };

export default function ChangePasswordCard() {
  const [form,    setForm]    = useState(INIT);
  const [show,    setShow]    = useState(SHOW_INIT);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.currentPassword) return "Current password is required";
    if (!form.newPassword || form.newPassword.length < 6) return "New password must be at least 6 characters";
    if (form.newPassword !== form.confirmPassword) return "Passwords do not match";
    if (form.currentPassword === form.newPassword) return "New password must differ from current password";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess("Password changed successfully.");
      setForm(INIT);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <LockClosedIcon className="w-5 h-5 text-orange-400" />
        </div>
        <h2 className="text-white font-semibold text-lg">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <InputRow
          label="Current Password" name="currentPassword"
          value={form.currentPassword} onChange={handleChange}
          show={show.current} onToggle={() => toggle("current")}
        />
        <InputRow
          label="New Password" name="newPassword"
          value={form.newPassword} onChange={handleChange}
          show={show.new} onToggle={() => toggle("new")}
          placeholder="Min 6 characters"
        />
        <InputRow
          label="Confirm New Password" name="confirmPassword"
          value={form.confirmPassword} onChange={handleChange}
          show={show.confirm} onToggle={() => toggle("confirm")}
        />

        {/* Password strength hint */}
        {form.newPassword && (
          <div className="flex gap-1.5 mt-1">
            {[form.newPassword.length >= 6, /[A-Z]/.test(form.newPassword), /\d/.test(form.newPassword)].map((ok, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${ok ? "bg-emerald-500" : "bg-slate-600"}`} />
            ))}
            <span className="text-xs text-slate-500 ml-1">
              {form.newPassword.length < 6 ? "Too short" : /[A-Z]/.test(form.newPassword) && /\d/.test(form.newPassword) ? "Strong" : "Could be stronger"}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500
            disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm
            font-medium transition-colors"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : "Update Password"}
        </button>
      </form>
    </div>
  );
}
