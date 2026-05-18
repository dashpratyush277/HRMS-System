import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { getMyCalendar } from "../../api/calendarApi";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import DashboardLayout from "../../components/DashboardLayout";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function MyCalendarPage() {
  const today = new Date();
  const [year, setYear]    = useState(today.getFullYear());
  const [month, setMonth]  = useState(today.getMonth() + 1);
  const [data, setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyCalendar({ year, month });
        setData(res.data.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [year, month]);

  const prev = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const summary = data?.summary || {};

  return (
    <DashboardLayout>
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">My Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <ChevronLeftIcon className="w-4 h-4 text-gray-300" />
          </button>
          <span className="text-white font-semibold w-40 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={next} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <ChevronRightIcon className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: "Present",  val: summary.present,  color: "bg-green-500/20 text-green-300"  },
          { label: "Absent",   val: summary.absent,   color: "bg-red-500/20 text-red-300"      },
          { label: "Late",     val: summary.late,     color: "bg-yellow-500/20 text-yellow-300"},
          { label: "Half-day", val: summary.halfDay,  color: "bg-orange-500/20 text-orange-300"},
          { label: "Leaves",   val: summary.leaves,   color: "bg-blue-500/20 text-blue-300"   },
        ].map(({ label, val, color }) => (
          <div key={label} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${color}`}>
            {label}: <strong>{val ?? 0}</strong>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {[
          { color: "bg-green-500",  label: "Present"  },
          { color: "bg-red-500",    label: "Absent"   },
          { color: "bg-yellow-500", label: "Late"     },
          { color: "bg-orange-500", label: "Half-day" },
          { color: "bg-blue-500",   label: "Leave"    },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-gray-400">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center text-gray-400">Loading…</div>
      ) : (
        <CalendarGrid year={year} month={month} events={data?.events || []} />
      )}
    </div>
    </DashboardLayout>
  );
}
