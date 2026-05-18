import { useState, useEffect, useCallback } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { getMyNotifications, getUnreadCount } from "../../api/notificationApi";
import NotificationDropdown from "./NotificationDropdown";

const POLL_INTERVAL = 30_000; // 30 seconds

export default function NotificationBell() {
  const [open, setOpen]                = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]            = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        getMyNotifications({ limit: 10 }),
        getUnreadCount(),
      ]);
      setNotifications(notifRes.data.data || []);
      setUnread(countRes.data.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onUpdate={fetchData}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
