// Stat card used in role dashboards. Accepts a color key to pick the gradient/accent.
const DashboardCard = ({ title, value, icon, color = "blue", trend }) => {
  const colors = {
    blue:   "from-blue-600/20   to-blue-500/10   border-blue-500/20   text-blue-400",
    purple: "from-purple-600/20 to-purple-500/10 border-purple-500/20 text-purple-400",
    green:  "from-green-600/20  to-green-500/10  border-green-500/20  text-green-400",
    orange: "from-orange-600/20 to-orange-500/10 border-orange-500/20 text-orange-400",
    red:    "from-red-600/20    to-red-500/10    border-red-500/20    text-red-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6 hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{title}</p>
    </div>
  );
};

export default DashboardCard;
