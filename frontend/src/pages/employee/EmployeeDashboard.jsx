import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }             from "../../context/AuthContext";
import { getMyProfileSummary } from "../../api/profileApi";
import DashboardLayout         from "../../components/DashboardLayout";

const REFRESH_INTERVAL = 60_000;
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Tiny SVG icons ─────────────────────────────────────────────────────── */
const Icon = ({ name }) => {
  const paths = {
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    absent:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    sun:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
    money:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trophy:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    refresh:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    leave:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    pending:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {paths[name] || paths.calendar}
    </svg>
  );
};

/* ── KPI card ────────────────────────────────────────────────────────────── */
const KpiCard = ({ title, value, sub, iconName, colorClass, loading }) => (
  <div className="neon-card p-5 rounded-2xl">
    <div className="mb-3">
      <div className={`p-2.5 rounded-xl w-fit ${colorClass}`}>
        <Icon name={iconName} />
      </div>
    </div>
    <p className="text-3xl font-bold text-white leading-none mb-1">
      {loading
        ? <span className="inline-block w-16 h-7 bg-slate-700/60 rounded animate-pulse" />
        : (value ?? "—")}
    </p>
    <p className="text-sm text-slate-300 font-medium">{title}</p>
    {sub && <p className="text-xs text-slate-500 mt-0.5">{loading ? "…" : sub}</p>}
  </div>
);

/* ── Component ──────────────────────────────────────────────────────────── */
const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const loadSummary = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (!summary) setLoading(true);
    try {
      const res = await getMyProfileSummary();
      setSummary(res.data.data);
      setLastUpdated(new Date());
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [summary]);

  useEffect(() => {
    loadSummary();
    intervalRef.current = setInterval(() => loadSummary(), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derived values from summary ───────────────────────────────── */
  const att     = summary?.attendance;
  const leaves  = summary?.leaves;
  const payroll = summary?.payroll;
  const goals   = summary?.goals;

  const payslipLabel = payroll
    ? `${MONTH_NAMES[(payroll.month ?? 1) - 1]} ${payroll.year}`
    : "—";
  const payslipSub = payroll
    ? `₹${Number(payroll.netSalary ?? 0).toLocaleString("en-IN")} · ${payroll.status}`
    : "No payslip yet";

  const kpis = [
    {
      title: "Days Present", value: att?.present ?? 0, iconName: "calendar", colorClass: "icon-green",
      sub: att ? `${att.absent ?? 0} absent · ${att.late ?? 0} late this month` : "",
    },
    {
      title: "Pending Leaves", value: leaves?.pending ?? 0, iconName: "pending", colorClass: "icon-orange",
      sub: leaves ? `${leaves.approved ?? 0} approved this year` : "",
    },
    {
      title: "Latest Payslip", value: payslipLabel, iconName: "money", colorClass: "icon-emerald",
      sub: payslipSub,
    },
    {
      title: "Active Goals", value: goals?.active ?? 0, iconName: "trophy", colorClass: "icon-indigo",
      sub: goals ? `${goals.completed ?? 0} completed` : "",
    },
  ];

  const today = new Date();

  return (
    <DashboardLayout>
      {/* Welcome hero */}
      <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/80
        rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] dashboard-wave-bg">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-600/8 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"},</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-slate-400 text-sm mt-1.5">Track your attendance, leaves, payslips and goals.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right hidden sm:block bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
              <p className="text-white font-semibold text-sm">{today.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              <p className="text-slate-400 text-xs">{today.toLocaleDateString("en-IN", { weekday: "long" })}</p>
              {lastUpdated && (
                <p className="text-slate-600 text-[10px] mt-1">
                  Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
            <button
              onClick={() => loadSummary(true)}
              disabled={refreshing || loading}
              className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400
                hover:text-blue-400 hover:border-blue-500/40 transition-all disabled:opacity-50"
            >
              <Icon name="refresh" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">My Stats</h2>
          {refreshing && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
              Refreshing…
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => <KpiCard key={k.title} {...k} loading={loading} />)}
        </div>
      </div>

      {/* Quick actions + session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {[
              { label: "My Attendance", desc: "View attendance history",     path: "/my-attendance" },
              { label: "Apply Leave",   desc: "Submit a leave request",      path: "/apply-leave"   },
              { label: "My Leaves",     desc: "View all leave requests",     path: "/my-leaves"     },
              { label: "My Payslips",   desc: "Download & view payslips",    path: "/my-payslips"   },
              { label: "My Calendar",   desc: "Attendance & leave calendar", path: "/calendar/my"   },
              { label: "My Profile",    desc: "Update personal information", path: "/profile"       },
            ].map(({ label, desc, path }) => (
              <button key={label} onClick={() => navigate(path)}
                className="p-4 bg-slate-900/40 hover:bg-slate-800/60 rounded-xl text-left transition-all
                  border border-slate-800/60 hover:border-blue-500/30 group">
                <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">My Account</h2>
          <div className="space-y-3">
            {[
              { label: "Name",  value: user?.name },
              { label: "Email", value: user?.email },
              { label: "Role",  value: user?.role, pill: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
            ].map(({ label, value, pill }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{label}</p>
                {pill
                  ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize w-fit ${pill}`}>{value}</span>
                  : <p className="text-slate-200 text-sm font-medium break-all">{value}</p>}
              </div>
            ))}
            {/* Attendance summary bar */}
            {att && !loading && (
              <div className="pt-2 border-t border-slate-800/60">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">This Month</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-400 font-semibold">{att.present ?? 0} present</span>
                  <span className="text-red-400 font-semibold">{att.absent ?? 0} absent</span>
                  {(att.late ?? 0) > 0 && <span className="text-yellow-400 font-semibold">{att.late} late</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
