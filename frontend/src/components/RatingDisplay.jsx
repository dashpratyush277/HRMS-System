const RatingDisplay = ({ label, value, max = 5 }) => {
  if (value == null) return null;
  const pct = (value / max) * 100;
  const color = value >= 4 ? "bg-green-500" : value >= 3 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-white">{value}/{max}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default RatingDisplay;
