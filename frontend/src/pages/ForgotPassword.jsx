import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";

const ForgotPassword = () => {
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) { setError("Email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email."); return; }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSuccess(res.data.message || "Reset link sent. Check your inbox.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Forgot Password</h2>
        <p className="text-slate-400 text-sm mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                focus:ring-1 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
          </div>

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
                Sending...
              </>
            ) : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
