import { useState, useEffect, useCallback } from "react";
import { BellIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../api/notificationApi";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "../../components/DashboardLayout";

const TYPE_DOT = {
  leave: "bg-blue-500", payroll: "bg-green-500", recruitment: "bg-purple-500",
  performance: "bg-yellow-500", attendance: "bg-orange-500", system: "bg-red-500", general: "bg-gray-500",
};

const TYPES = ["all", "leave", "payroll", "recruitment", "performance", "attendance", "system", "general"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [pages, setPages]                 = useState(1);
  const [loading, setLoading]             = useState(true);
  const [typeFilter, setTypeFilter]       = useState("all");
  const [unreadOnly, setUnreadOnly]       = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter !== "all") params.type = typeFilter;
      if (unreadOnly) params.unreadOnly = true;
      const res = await getMyNotifications(params);
      setNotifications(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [page, typeFilter, unreadOnly]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [typeFilter, unreadOnly]);

  const handleMarkAll = async () => {
    await markAllAsRead();
    fetch();
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    fetch();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    fetch();
  };

  return (
    <DashboardLayout>
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BellIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          {total > 0 && <span className="text-sm text-gray-400">({total} total)</span>}
        </div>
        <button
          onClick={handleMarkAll}
          className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <CheckIcon className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
              typeFilter === t
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
        <label className="flex items-center gap-1.5 ml-2 text-xs text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded"
          />
          Unread only
        </label>
      </div>

      {/* List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700/50">
        {loading ? (
          <p className="py-8 text-center text-gray-400 text-sm">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="py-8 text-center text-gray-400 text-sm">No notifications found</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-3 px-4 py-4 ${!n.isRead ? "bg-gray-700/20" : ""}`}
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${TYPE_DOT[n.type] || "bg-gray-500"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.isRead ? "text-gray-300" : "text-white"}`}>{n.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {!n.isRead && (
                  <button
                    onClick={() => handleRead(n._id)}
                    className="p-1.5 rounded text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                    title="Mark as read"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                p === page ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
