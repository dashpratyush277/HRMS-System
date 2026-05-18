import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { markAllAsRead } from "../../api/notificationApi";
import NotificationItem from "./NotificationItem";

export default function NotificationDropdown({ notifications, onUpdate, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      onUpdate?.();
    } catch {}
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm font-semibold text-white">Notifications</span>
        {hasUnread && (
          <button
            onClick={handleMarkAll}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-gray-700/50">
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications yet</p>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <NotificationItem key={n._id} notification={n} onUpdate={onUpdate} />
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-700">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-xs text-blue-400 hover:text-blue-300 transition-colors py-1"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
