import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-950 flex overflow-hidden">

      {/* ── Static background layer ───────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Subtle corner glows — calmer than auth page */}
        <div className="absolute top-0 right-0 w-[700px] h-[500px] rounded-full bg-blue-600/5 blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-[280px] w-[600px] h-[500px] rounded-full bg-violet-700/4 blur-3xl translate-y-1/3" />
        {/* Dot-grid texture */}
        <div className="absolute inset-0 dashboard-grid-bg" />
      </div>

      {/* ── Mobile overlay ────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main column ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Navbar handles its own horizontal padding so it aligns with content */}
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-10">
            <div className="max-w-[1600px] mx-auto w-full space-y-5">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
