const map = {
  applied:   "bg-slate-700 text-slate-300 border border-slate-600",
  screening: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  interview: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  technical: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
  "hr-round":"bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  selected:  "bg-green-500/20 text-green-400 border border-green-500/30",
  rejected:  "bg-red-500/20 text-red-400 border border-red-500/30",
  offered:   "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  joined:    "bg-green-600/20 text-green-300 border border-green-600/30",
};

const CandidateStageBadge = ({ stage }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[stage] ?? "bg-slate-700 text-slate-300"}`}>
    {stage}
  </span>
);

export default CandidateStageBadge;
