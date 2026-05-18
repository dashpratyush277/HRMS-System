const COLOR = {
  green:  "from-green-600  to-emerald-600",
  red:    "from-red-600    to-rose-600",
  yellow: "from-yellow-600 to-amber-600",
  blue:   "from-blue-600   to-cyan-600",
  purple: "from-purple-600 to-indigo-600",
  slate:  "from-slate-600  to-slate-500",
};

const AttendanceSummaryCard = ({ label, value, color = "slate", icon }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${COLOR[color]} flex items-center justify-center flex-shrink-0`}>
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  </div>
);

export default AttendanceSummaryCard;
