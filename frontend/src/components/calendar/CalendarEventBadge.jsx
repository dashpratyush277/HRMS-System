const COLORS = {
  present:   "bg-green-500/20 text-green-300 border-green-500/30",
  absent:    "bg-red-500/20   text-red-300   border-red-500/30",
  late:      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  half_day:  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  leave:     "bg-blue-500/20  text-blue-300  border-blue-500/30",
  holiday:   "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function CalendarEventBadge({ label, type, status }) {
  const key = type === "leave" ? "leave" : (status || type);
  const color = COLORS[key] || "bg-gray-500/20 text-gray-300 border-gray-500/30";

  return (
    <span className={`block truncate text-[10px] px-1 py-0.5 rounded border ${color} leading-tight`}>
      {label}
    </span>
  );
}
