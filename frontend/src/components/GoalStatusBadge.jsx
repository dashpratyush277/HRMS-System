const map = {
  "not-started": "bg-slate-700 text-slate-300 border border-slate-600",
  "in-progress": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  completed:     "bg-green-500/20 text-green-400 border border-green-500/30",
  overdue:       "bg-red-500/20 text-red-400 border border-red-500/30",
  cancelled:     "bg-slate-600/40 text-slate-400 border border-slate-600",
};

const GoalStatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-slate-700 text-slate-300"}`}>
    {status}
  </span>
);

export default GoalStatusBadge;
