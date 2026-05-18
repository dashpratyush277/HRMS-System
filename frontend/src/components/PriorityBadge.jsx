const map = {
  low:    "bg-slate-700 text-slate-300 border border-slate-600",
  medium: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  high:   "bg-red-500/20 text-red-400 border border-red-500/30",
};

const PriorityBadge = ({ priority }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[priority] ?? "bg-slate-700 text-slate-300"}`}>
    {priority}
  </span>
);

export default PriorityBadge;
