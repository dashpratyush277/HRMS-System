import { Link } from "react-router-dom";
import {
  CalendarDaysIcon, ClipboardDocumentListIcon, BanknotesIcon,
  TrophyIcon, BellIcon, CalendarIcon,
} from "@heroicons/react/24/outline";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const StatCard = ({ icon: Icon, label, value, sub, to, color }) => (
  <Link
    to={to}
    className={`group flex flex-col gap-2 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl
      border border-slate-600/50 hover:border-slate-500 transition-all duration-200`}
  >
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </Link>
);

export default function ProfileSummaryCards({ summary, role }) {
  if (!summary) return null;

  if (role === "admin" || role === "hr") {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-white font-semibold text-lg mb-4">Quick Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={ClipboardDocumentListIcon} label="Pending Leaves"
            value={summary.pendingLeaveApprovals ?? 0} sub="Awaiting approval"
            to="/leaves?status=pending" color="bg-yellow-500/10 text-yellow-400" />
          <StatCard icon={BriefcaseIcon} label="Open Positions"
            value={summary.openJobs ?? 0} sub="Active job openings"
            to="/recruitment" color="bg-blue-500/10 text-blue-400" />
          <StatCard icon={BellIcon} label="Unread Alerts"
            value={summary.unreadNotifications ?? 0} sub="Notifications"
            to="/notifications" color="bg-purple-500/10 text-purple-400" />
        </div>
      </div>
    );
  }

  const { attendance, leaves, payroll, goals, unreadNotifications } = summary;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h2 className="text-white font-semibold text-lg mb-4">My Activity</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          icon={CalendarDaysIcon} label="Days Present"
          value={attendance?.present ?? 0}
          sub={`This month · ${attendance?.absent ?? 0} absent`}
          to="/my-attendance" color="bg-green-500/10 text-green-400"
        />
        <StatCard
          icon={ClipboardDocumentListIcon} label="Leave Requests"
          value={leaves?.pending ?? 0}
          sub={`Pending · ${leaves?.approved ?? 0} approved`}
          to="/my-leaves" color="bg-yellow-500/10 text-yellow-400"
        />
        <StatCard
          icon={BanknotesIcon} label="Latest Payslip"
          value={payroll ? `${MONTH_NAMES[(payroll.month ?? 1) - 1]} ${payroll.year}` : "—"}
          sub={payroll ? `₹${Number(payroll.netSalary).toLocaleString("en-IN")}` : "No payroll yet"}
          to="/my-payslips" color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          icon={TrophyIcon} label="Active Goals"
          value={goals?.active ?? 0}
          sub={`${goals?.completed ?? 0} completed`}
          to="/my-performance" color="bg-indigo-500/10 text-indigo-400"
        />
        <StatCard
          icon={BellIcon} label="Notifications"
          value={unreadNotifications ?? 0}
          sub="Unread" to="/notifications"
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          icon={CalendarIcon} label="Calendar"
          value="View" sub="Attendance & leaves"
          to="/calendar/my" color="bg-blue-500/10 text-blue-400"
        />
      </div>
    </div>
  );
}

// Inline icon used for admin/hr card (not in heroicons outline as BriefcaseIcon)
function BriefcaseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}
