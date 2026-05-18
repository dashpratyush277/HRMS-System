const LeaveBalanceCard = ({ title, total, used, available, color = "blue" }) => {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const barColor = {
    blue:   "bg-blue-500",
    green:  "bg-green-500",
    red:    "bg-red-500",
    pink:   "bg-pink-500",
    indigo: "bg-indigo-500",
    orange: "bg-orange-500",
  }[color] || "bg-blue-500";

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white capitalize">{title}</p>
        <p className="text-xl font-bold text-white">{available}</p>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
        <div
          className={`h-1.5 rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Used: {used}</span>
        <span>Total: {total}</span>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
