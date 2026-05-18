const ProgressBar = ({ value = 0, showLabel = true, height = "h-2", color = "bg-blue-500" }) => (
  <div className="w-full">
    {showLabel && (
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">Progress</span>
        <span className="text-xs font-medium text-white">{value}%</span>
      </div>
    )}
    <div className={`w-full bg-slate-700 rounded-full ${height}`}>
      <div
        className={`${height} ${color} rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

export default ProgressBar;
