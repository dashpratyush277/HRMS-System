const CONFIG = {
  casual:    { label: "Casual",    cls: "bg-blue-500/15    text-blue-400    border-blue-500/30"    },
  sick:      { label: "Sick",      cls: "bg-red-500/15     text-red-400     border-red-500/30"     },
  earned:    { label: "Earned",    cls: "bg-green-500/15   text-green-400   border-green-500/30"   },
  maternity: { label: "Maternity", cls: "bg-pink-500/15    text-pink-400    border-pink-500/30"    },
  paternity: { label: "Paternity", cls: "bg-indigo-500/15  text-indigo-400  border-indigo-500/30"  },
  unpaid:    { label: "Unpaid",    cls: "bg-orange-500/15  text-orange-400  border-orange-500/30"  },
};

const LeaveTypeBadge = ({ type }) => {
  const cfg = CONFIG[type] || { label: type, cls: "bg-slate-700 text-slate-400 border-slate-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default LeaveTypeBadge;
