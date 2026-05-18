import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, UsersIcon } from "@heroicons/react/24/outline";
import { getTeamCalendar } from "../../api/calendarApi";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import DashboardLayout from "../../components/DashboardLayout";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TeamCalendarPage() {
  const today = new Date();
  const [year, setYear]    = useState(today.getFullYear());
  const [month, setMonth]  = useState(today.getMonth() + 1);
  const [data, setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getTeamCalendar({ year, month });
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

  const events = (() => {
    if (!data) return [];
    const att = (data.attendance || []).map((e) => ({ ...e, type: "attendance" }));
    const lv  = (data.leaves     || []).map((e) => ({ ...e, type: "leave"      }));
    const all = [...att, ...lv];
    if (selectedEmp === "all") return all;
    return all.filter((e) => String(e.employeeId) === selectedEmp);
  })();

  return (
    <DashboardLayout>
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <UsersIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Team Calendar</h1>
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

      {/* Employee filter */}
      <div className="mb-4">
        <select
          value={selectedEmp}
          onChange={(e) => setSelectedEmp(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg px-3 py-2 max-w-xs"
        >
          <option value="all">All Employees</option>
          {(data?.employees || []).map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
          ))}
        </select>
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
        <CalendarGrid year={year} month={month} events={events} />
      )}
    </div>
    </DashboardLayout>
  );
}
