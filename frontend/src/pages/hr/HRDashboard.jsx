import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEmployeeStats }   from "../../api/employeeApi";
import { getDepartmentStats } from "../../api/departmentApi";
import { getAttendanceStats } from "../../api/attendanceApi";
import { getLeaveStats }      from "../../api/leaveApi";
import { getPayrollStats }    from "../../api/payrollApi";
import DashboardLayout from "../../components/DashboardLayout";

const REFRESH_INTERVAL = 60_000;

const KpiIcon = ({ name }) => {
  const paths = {
    users:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    check:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    building: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    absent:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    leaves:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
    approved: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    payroll:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
    pending:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    paid:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    refresh:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
  };
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {paths[name] || paths.check}
    </svg>
  );
};

const KpiCard = ({ title, value, iconName, colorClass, loading }) => (
  <div className="neon-card p-5 rounded-2xl">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${colorClass}`}>
        <KpiIcon name={iconName} />
      </div>
    </div>
    <p className="text-3xl font-bold text-white leading-none mb-1.5">
      {loading
        ? <span className="inline-block w-12 h-7 bg-slate-700/60 rounded animate-pulse" />
        : value}
    </p>
    <p className="text-sm text-slate-400 truncate">{title}</p>
  </div>
);

const HRDashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [empStats,     setEmpStats]     = useState(null);
  const [deptStats,    setDeptStats]    = useState(null);
  const [attStats,     setAttStats]     = useState(null);
  const [leaveStats,   setLeaveStats]   = useState(null);
  const [payrollStats, setPayrollStats] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const intervalRef = useRef(null);

  const loadStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (!empStats) setLoading(true);
    try {
      const [e, d, a, l, p] = await Promise.all([
        getEmployeeStats(), getDepartmentStats(), getAttendanceStats(), getLeaveStats(), getPayrollStats(),
      ]);
      setEmpStats(e.data.stats);
      setDeptStats(d.data.stats);
      setAttStats(a.data.stats);
      setLeaveStats(l.data.stats);
      setPayrollStats(p.data.stats);
      setLastUpdated(new Date());
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [empStats]);

  useEffect(() => {
    loadStats();
    intervalRef.current = setInterval(() => loadStats(), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ev = (k) => loading ? null : (empStats?.[k]     ?? "—");
  const dv = (k) => loading ? null : (deptStats?.[k]    ?? "—");
  const av = (k) => loading ? null : (attStats?.[k]     ?? "—");
  const lv = (k) => loading ? null : (leaveStats?.[k]   ?? "—");
  const pv = (k) => loading ? null : (payrollStats?.[k] ?? "—");

  const kpis = [
    { title: "Total Employees",  value: ev("totalEmployees"),  iconName: "users",    colorClass: "icon-blue"   },
    { title: "Active Employees", value: ev("activeEmployees"), iconName: "check",    colorClass: "icon-green"  },
    { title: "Departments",      value: dv("active"),          iconName: "building", colorClass: "icon-purple" },
    { title: "Present Today",    value: av("present"),         iconName: "calendar", colorClass: "icon-green"  },
    { title: "Absent Today",     value: av("absent"),          iconName: "absent",   colorClass: "icon-orange" },
    { title: "Pending Leaves",   value: lv("pendingLeaves"),   iconName: "leaves",   colorClass: "icon-orange" },
    { title: "Approved Leaves",  value: lv("approvedLeaves"),  iconName: "approved", colorClass: "icon-green"  },
    { title: "Total Payrolls",   value: pv("totalPayrolls"),   iconName: "payroll",  colorClass: "icon-blue"   },
    { title: "Pending Payments", value: pv("pendingPayments"), iconName: "pending",  colorClass: "icon-orange" },
    { title: "Paid Payments",    value: pv("paidPayments"),    iconName: "paid",     colorClass: "icon-green"  },
  ];

  const today = new Date();

  return (
    <DashboardLayout>
      {/* Welcome hero */}
      <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/80
        rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] dashboard-wave-bg">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-slate-400 text-sm mt-1.5">Manage your HR operations efficiently.</p>
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
              onClick={() => loadStats(true)}
              disabled={refreshing || loading}
              className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400
                hover:text-blue-400 hover:border-blue-500/40 transition-all disabled:opacity-50"
            >
              <KpiIcon name="refresh" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Metrics</h2>
          {refreshing && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
              Refreshing…
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {kpis.map((k) => <KpiCard key={k.title} {...k} loading={loading} />)}
        </div>
      </div>

      {/* Quick actions + session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Add Employee",    desc: "Create a new employee record",  path: "/employees/add"   },
              { label: "View Employees",  desc: "Browse the employee directory", path: "/employees"       },
              { label: "Leave Requests",  desc: "Review pending leave requests", path: "/leaves"          },
              { label: "Bulk Attendance", desc: "Mark attendance for all staff", path: "/attendance/bulk" },
              { label: "Bulk Payroll",    desc: "Generate payroll in bulk",      path: "/payroll/bulk"    },
              { label: "Departments",     desc: "View department structure",     path: "/departments"     },
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
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Session</h2>
          <div className="space-y-3">
            {[
              { label: "Signed in as", value: user?.name },
              { label: "Email",        value: user?.email },
              { label: "Role",         value: user?.role, pill: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
            ].map(({ label, value, pill }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{label}</p>
                {pill
                  ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize w-fit ${pill}`}>{value}</span>
                  : <p className="text-slate-200 text-sm font-medium">{value}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRDashboard;
