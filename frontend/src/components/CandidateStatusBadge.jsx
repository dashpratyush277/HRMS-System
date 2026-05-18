const map = {
  active:   "bg-green-500/20 text-green-400 border border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border border-red-500/30",
  selected: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "on-hold":"bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
};

const CandidateStatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-slate-700 text-slate-300"}`}>
    {status}
  </span>
);

export default CandidateStatusBadge;
