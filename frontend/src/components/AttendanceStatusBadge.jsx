const CONFIG = {
  present:  { label: "Present",  cls: "bg-green-500/15  text-green-400  border-green-500/30"  },
  absent:   { label: "Absent",   cls: "bg-red-500/15    text-red-400    border-red-500/30"    },
  "half-day": { label: "Half Day", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  leave:    { label: "Leave",    cls: "bg-blue-500/15   text-blue-400   border-blue-500/30"   },
  holiday:  { label: "Holiday",  cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
};

const AttendanceStatusBadge = ({ status }) => {
  const cfg = CONFIG[status] || { label: status, cls: "bg-slate-700 text-slate-400 border-slate-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default AttendanceStatusBadge;
