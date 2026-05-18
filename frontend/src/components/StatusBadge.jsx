// Coloured pill badge for employee status and employment type values.
const StatusBadge = ({ status }) => {
  const styles = {
    // Employment status
    active:      "bg-green-500/15  text-green-400  border-green-500/30",
    inactive:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    terminated:  "bg-red-500/15   text-red-400    border-red-500/30",
    // Employment type
    "full-time": "bg-blue-500/15   text-blue-400   border-blue-500/30",
    "part-time": "bg-purple-500/15 text-purple-400 border-purple-500/30",
    intern:      "bg-orange-500/15 text-orange-400 border-orange-500/30",
    contract:    "bg-teal-500/15   text-teal-400   border-teal-500/30",
  };

  const cls = styles[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${cls}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
