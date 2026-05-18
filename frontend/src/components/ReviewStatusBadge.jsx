const map = {
  draft:     "bg-slate-700 text-slate-300 border border-slate-600",
  submitted: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  approved:  "bg-green-500/20 text-green-400 border border-green-500/30",
  rejected:  "bg-red-500/20 text-red-400 border border-red-500/30",
};

const ReviewStatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-slate-700 text-slate-300"}`}>
    {status}
  </span>
);

export default ReviewStatusBadge;
