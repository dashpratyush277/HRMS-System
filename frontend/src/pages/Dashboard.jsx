import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// Role-specific badge styles
const roleMeta = {
  admin: {
    label: "Administrator",
    color: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    icon: "🛡️",
  },
  hr: {
    label: "HR Manager",
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    icon: "👥",
  },
  employee: {
    label: "Employee",
    color: "text-brand-300 bg-brand-500/10 border-brand-500/20",
    icon: "💼",
  },
};

// Stat card used in the grid
const StatCard = ({ title, value, icon, accent }) => (
  <div className="card p-6 flex items-center gap-5">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
      <p className="text-white font-semibold text-lg mt-0.5">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [serverUser, setServerUser] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("idle"); // idle | loading | success | error

  // Fetch logged-in user from protected /me endpoint to verify token works
  useEffect(() => {
    const fetchMe = async () => {
      setFetchStatus("loading");
      try {
        const res = await api.get("/auth/me");
        setServerUser(res.data.user);
        setFetchStatus("success");
      } catch {
        setFetchStatus("error");
      }
    };
    fetchMe();
  }, []);

  const meta = roleMeta[user?.role] || roleMeta.employee;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Page heading */}
          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl text-white">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Here's your profile overview and system status.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Your Role"
              value={meta.label}
              icon={meta.icon}
              accent="bg-slate-800"
            />
            <StatCard
              title="Member Since"
              value={joinedDate}
              icon="📅"
              accent="bg-slate-800"
            />
            <StatCard
              title="Account Status"
              value="Active"
              icon="✅"
              accent="bg-slate-800"
            />
          </div>

          {/* Profile card */}
          <div className="card p-8 mb-6">
            <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand-500 rounded-full inline-block" />
              Your Profile
            </h3>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-brand-500/15 border-2 border-brand-500/20 flex items-center justify-center text-3xl font-bold text-brand-400 font-display flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Full Name</p>
                  <p className="text-white font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Email Address</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Role</p>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full border capitalize ${meta.color}`}>
                    {meta.icon} {user?.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">User ID</p>
                  <p className="text-slate-400 text-xs font-mono">{user?.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* API verification card */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block" />
              Protected API Test — <code className="text-xs font-mono text-slate-400">GET /api/auth/me</code>
            </h3>

            {fetchStatus === "loading" && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="w-4 h-4 border-2 border-slate-600 border-t-brand-500 rounded-full animate-spin" />
                Verifying token with server…
              </div>
            )}

            {fetchStatus === "success" && serverUser && (
              <div>
                <p className="text-emerald-400 text-sm font-medium mb-3 flex items-center gap-2">
                  <span>✅</span> Token verified! Server returned your profile.
                </p>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 overflow-auto">
                  {JSON.stringify(serverUser, null, 2)}
                </pre>
              </div>
            )}

            {fetchStatus === "error" && (
              <p className="text-red-400 text-sm">
                ❌ Could not verify token. Make sure the backend is running on port 5000.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
