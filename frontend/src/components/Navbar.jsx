import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./notifications/NotificationBell";
import UserAvatar from "./profile/UserAvatar";

/* ── Inline icons ───────────────────────────────────────────────────────── */
const HamburgerIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ── Shared icon-button class ───────────────────────────────────────────── */
const iconBtn =
  "p-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-400 " +
  "hover:text-slate-100 hover:border-blue-500/40 hover:bg-slate-800/60 " +
  "transition-all duration-200 flex items-center justify-center flex-shrink-0";

/* ── Component ──────────────────────────────────────────────────────────── */
const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    /* Outer padding mirrors the main content area so the glass card aligns */
    <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-4 flex-shrink-0">
      <div className="max-w-[1600px] mx-auto">
        <div
          className="
            flex items-center justify-between gap-3
            bg-slate-950/70 backdrop-blur-xl
            border border-slate-800/80
            rounded-2xl
            px-3 sm:px-4 py-2.5
            shadow-[0_4px_24px_rgba(0,0,0,0.35)]
          "
        >

          {/* ── Left section ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={onMenuToggle}
              className={`lg:hidden ${iconBtn}`}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>

            {/* Search box — desktop only, UI only */}
            <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-xs xl:max-w-sm bg-slate-900/60 border border-slate-700/60 rounded-xl px-3.5 py-2 group focus-within:border-blue-500/50 transition-colors">
              <SearchIcon />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none min-w-0"
              />
              <span className="hidden lg:flex items-center gap-0.5 text-[10px] text-slate-600 flex-shrink-0 border border-slate-700 rounded px-1 py-0.5 leading-none">
                <span>⌘</span><span>K</span>
              </span>
            </div>
          </div>

          {/* ── Right section ─────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Moon button — UI only */}
            <button className={iconBtn} aria-label="Toggle theme" title="Toggle theme">
              <MoonIcon />
            </button>

            {/* Notification bell (keeps existing polling/dropdown logic) */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 hover:border-blue-500/40 transition-colors">
              <NotificationBell />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-slate-700/60 mx-1" />

            {/* User profile pill */}
            <Link
              to="/profile"
              className="
                hidden sm:flex items-center gap-2.5
                px-3 py-2 rounded-xl
                border border-slate-700/60 bg-slate-900/60
                hover:border-blue-500/40 hover:bg-slate-800/60
                transition-all duration-200 group
              "
            >
              <UserAvatar user={user} size="xs" className="group-hover:ring-blue-500/40 transition-all" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-100 leading-none group-hover:text-blue-300 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-500 capitalize mt-0.5">{user?.role}</p>
              </div>
              <ChevronDownIcon />
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="
                flex items-center gap-1.5
                px-3 py-2 text-xs font-medium
                text-slate-400 bg-slate-900/60
                border border-slate-700/60
                hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30
                rounded-xl transition-all duration-200
              "
              title="Logout"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
