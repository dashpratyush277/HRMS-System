import CalendarEventBadge from "./CalendarEventBadge";

export default function CalendarDay({ day, isCurrentMonth, isToday, events = [] }) {
  return (
    <div
      className={`min-h-[80px] p-1.5 border-b border-r border-gray-700/50
        ${!isCurrentMonth ? "bg-gray-800/20 opacity-50" : "bg-gray-800/10"}
        ${isToday ? "ring-1 ring-inset ring-blue-500/50" : ""}`}
    >
      <span
        className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1
          ${isToday ? "bg-blue-600 text-white" : "text-gray-400"}`}
      >
        {day}
      </span>
      <div className="space-y-0.5">
        {events.slice(0, 3).map((ev, i) => (
          <CalendarEventBadge key={i} label={ev.label} type={ev.type} status={ev.status} />
        ))}
        {events.length > 3 && (
          <span className="text-[10px] text-gray-500">+{events.length - 3} more</span>
        )}
      </div>
    </div>
  );
}
