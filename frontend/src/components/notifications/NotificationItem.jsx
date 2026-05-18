import { formatDistanceToNow } from "date-fns";
import { markAsRead, deleteNotification } from "../../api/notificationApi";

const TYPE_COLORS = {
  leave:       "bg-blue-500",
  payroll:     "bg-green-500",
  recruitment: "bg-purple-500",
  performance: "bg-yellow-500",
  attendance:  "bg-orange-500",
  system:      "bg-red-500",
  general:     "bg-gray-500",
};

export default function NotificationItem({ notification, onUpdate }) {
  const handleRead = async () => {
    if (notification.isRead) return;
    try {
      await markAsRead(notification._id);
      onUpdate?.();
    } catch {}
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notification._id);
      onUpdate?.();
    } catch {}
  };

  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : "";

  return (
    <div
      onClick={handleRead}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-700/50 transition-colors ${
        !notification.isRead ? "bg-gray-700/30" : ""
      }`}
    >
      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLORS[notification.type] || "bg-gray-500"}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${notification.isRead ? "text-gray-300" : "text-white"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
      </div>
      <button
        onClick={handleDelete}
        className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors text-xs"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
