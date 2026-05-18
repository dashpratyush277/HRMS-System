const CONFIG = {
  pending:   { label: "Pending",   cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  approved:  { label: "Approved",  cls: "bg-green-500/15  text-green-400  border-green-500/30"  },
  rejected:  { label: "Rejected",  cls: "bg-red-500/15    text-red-400    border-red-500/30"    },
  cancelled: { label: "Cancelled", cls: "bg-slate-700/50  text-slate-400  border-slate-600/30"  },
};

const LeaveStatusBadge = ({ status }) => {
  const cfg = CONFIG[status] || { label: status, cls: "bg-slate-700 text-slate-400 border-slate-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default LeaveStatusBadge;
