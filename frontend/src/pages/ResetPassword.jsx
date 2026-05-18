import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";

const ResetPassword = () => {
  const { token }   = useParams();
  const navigate    = useNavigate();

  const [form,    setForm]    = useState({ password: "", confirmPassword: "" });
  const [errors,  setErrors]  = useState({});
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (form.confirmPassword && form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    setError("");
    try {
      const res = await api.put(`/auth/reset-password/${token}`, {
        password:        form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(res.data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        type={showPw ? "text" : "password"}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white
          placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors
          ${errors[name] ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                         : "border-slate-600 focus:border-blue-500 focus:ring-blue-500"}`}
        disabled={loading}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
        <p className="text-slate-400 text-sm mb-8">Enter your new password below.</p>

        {error && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
            {success} Redirecting to login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field name="password"        label="New Password"      placeholder="Min 6 characters" />
            <Field name="confirmPassword" label="Confirm Password"  placeholder="Repeat password" />

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPw}
                onChange={(e) => setShowPw(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-sm text-slate-400">Show passwords</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold
                rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </>
              ) : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Back to Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
