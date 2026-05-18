import CalendarDay from "./CalendarDay";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getEventsForDate = (dateStr, events) =>
  events.filter((ev) => {
    if (ev.type === "attendance") return ev.date?.slice(0, 10) === dateStr;
    // For leave spans: check if date falls within startDate–endDate
    if (ev.type === "leave") {
      const d = new Date(dateStr);
      return new Date(ev.startDate) <= d && d <= new Date(ev.endDate);
    }
    return false;
  });

export default function CalendarGrid({ year, month, events = [] }) {
  const today   = new Date();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const cells = [];

  // Previous month filler
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === d;
    cells.push({ day: d, isCurrentMonth: true, isToday, dateStr, events: getEventsForDate(dateStr, events) });
  }
  // Next month filler (fill to multiple of 7)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrentMonth: false });
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-700">
      {/* Header row */}
      <div className="grid grid-cols-7 bg-gray-800">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 border-r border-gray-700 last:border-r-0">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => (
          <CalendarDay
            key={i}
            day={cell.day}
            isCurrentMonth={cell.isCurrentMonth}
            isToday={cell.isToday || false}
            events={cell.events || []}
          />
        ))}
      </div>
    </div>
  );
}
