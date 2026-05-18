import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ── SVG icon map ───────────────────────────────────────────────────────── */
const ICON_PATHS = {
  dashboard: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  profile: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  employees: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  ),
  departments: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  ),
  attendance: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  ),
  leaves: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  ),
  balance: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  ),
  payroll: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  calendar: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
  bell: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  ),
  audit: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  ),
  settings: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
  applyleave: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  payslips: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
  ),
  recruitment: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  ),
};

const NavIcon = ({ name }) => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {ICON_PATHS[name] || ICON_PATHS.settings}
  </svg>
);

/* ── Role-based navigation ──────────────────────────────────────────────── */
const NAV = {
  admin: [
    { label: "Dashboard",     path: "/admin/dashboard",  icon: "dashboard",    section: "main"   },
    { label: "My Profile",    path: "/profile",           icon: "profile",      section: "main"   },
    { label: "Employees",     path: "/employees",         icon: "employees",    section: "main"   },
    { label: "Departments",   path: "/departments",       icon: "departments",  section: "main"   },
    { label: "Attendance",    path: "/attendance",        icon: "attendance",   section: "main"   },
    { label: "Leaves",        path: "/leaves",            icon: "leaves",       section: "main"   },
    { label: "Leave Balance", path: "/leaves/balance",    icon: "balance",      section: "main"   },
    { label: "Payroll",       path: "/payroll",           icon: "payroll",      section: "main"   },
    { label: "Team Calendar", path: "/calendar/team",     icon: "calendar",     section: "system" },
    { label: "Notifications", path: "/notifications",     icon: "bell",         section: "system" },
    { label: "Audit Logs",    path: "/audit-logs",        icon: "audit",        section: "system" },
    { label: "Settings",      path: "/settings",          icon: "settings",     section: "system", soon: true },
  ],
  hr: [
    { label: "Dashboard",     path: "/hr/dashboard",     icon: "dashboard",    section: "main"   },
    { label: "My Profile",    path: "/profile",           icon: "profile",      section: "main"   },
    { label: "Employees",     path: "/employees",         icon: "employees",    section: "main"   },
    { label: "Departments",   path: "/departments",       icon: "departments",  section: "main"   },
    { label: "Attendance",    path: "/attendance",        icon: "attendance",   section: "main"   },
    { label: "Leaves",        path: "/leaves",            icon: "leaves",       section: "main"   },
    { label: "Payroll",       path: "/payroll",           icon: "payroll",      section: "main"   },
    { label: "Team Calendar", path: "/calendar/team",     icon: "calendar",     section: "system" },
    { label: "Notifications", path: "/notifications",     icon: "bell",         section: "system" },
    { label: "Recruitment",   path: "/recruitment",       icon: "recruitment",  section: "system", soon: true },
  ],
  employee: [
    { label: "Dashboard",     path: "/employee/dashboard", icon: "dashboard",   section: "main"   },
    { label: "My Profile",    path: "/profile",            icon: "profile",     section: "main"   },
    { label: "My Attendance", path: "/my-attendance",      icon: "attendance",  section: "main"   },
    { label: "My Calendar",   path: "/calendar/my",        icon: "calendar",    section: "main"   },
    { label: "Apply Leave",   path: "/apply-leave",        icon: "applyleave",  section: "main"   },
    { label: "My Leaves",     path: "/my-leaves",          icon: "leaves",      section: "main"   },
    { label: "My Payslips",   path: "/my-payslips",        icon: "payslips",    section: "main"   },
    { label: "Notifications", path: "/notifications",      icon: "bell",        section: "system" },
  ],
};

const SECTIONS = [
  { key: "main",   label: "Main"   },
  { key: "system", label: "System" },
];

const ROLE_LABELS = { admin: "Admin Panel", hr: "HR Panel", employee: "Employee" };

/* ── Component ──────────────────────────────────────────────────────────── */
const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const links = NAV[user?.role] || NAV.employee;
  const roleLabel = ROLE_LABELS[user?.role] || "Panel";

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-[280px] flex flex-col
        bg-slate-950/90 backdrop-blur-2xl
        border-r border-slate-800/70
        transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:inset-auto lg:translate-x-0 lg:z-auto lg:flex-shrink-0
      `}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl opacity-90" />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {/* Subtle glow ring */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-blue-500/30" />
          </div>
          {/* Text */}
          <div className="min-w-0">
            <p className="text-white font-bold text-base leading-none">HRMS</p>
            <p className="text-slate-500 text-[10px] leading-tight mt-0.5 truncate">
              Human Resource Management
            </p>
          </div>
        </div>
      </div>

      {/* ── Role label ───────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {SECTIONS.map(({ key, label }) => {
          const sectionLinks = links.filter((l) => l.section === key);
          if (!sectionLinks.length) return null;

          return (
            <div key={key}>
              {/* Section label */}
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-1.5 mt-1">
                {label}
              </p>

              <div className="space-y-0.5">
                {sectionLinks.map((link) =>
                  link.soon ? (
                    <div
                      key={link.label}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 cursor-not-allowed select-none"
                    >
                      <NavIcon name={link.icon} />
                      <span className="text-sm font-medium flex-1">{link.label}</span>
                      <span className="text-[9px] bg-slate-800/80 border border-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded-full leading-none">
                        Soon
                      </span>
                    </div>
                  ) : (
                    <NavLink
                      key={link.label}
                      to={link.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        isActive
                          ? "sidebar-link-active flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                          : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-150"
                      }
                    >
                      <NavIcon name={link.icon} />
                      {link.label}
                    </NavLink>
                  )
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Bottom user pill ─────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 transition-colors cursor-default">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 ring-1 ring-blue-500/30">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-100 truncate leading-none">{user?.name}</p>
            <p className="text-[11px] text-slate-500 capitalize mt-0.5">{user?.role}</p>
          </div>
          {/* Chevron */}
          <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
