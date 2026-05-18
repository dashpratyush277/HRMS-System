import { useState, useEffect, useCallback } from "react";
import { ClipboardDocumentListIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getAuditLogs } from "../../api/auditLogApi";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "../../components/DashboardLayout";

const ACTIONS      = ["", "CREATE","UPDATE","DELETE","APPROVE","REJECT","LOGIN","LOGOUT","EXPORT","UPLOAD","STATUS_CHANGE","CANCEL","BULK_CREATE"];
const ENTITY_TYPES = ["", "User","Employee","Department","Attendance","Leave","Payroll","PerformanceGoal","PerformanceReview","JobOpening","Candidate","Notification","Auth","System"];

const ACTION_COLORS = {
  CREATE: "text-green-400",  UPDATE: "text-blue-400",    DELETE:  "text-red-400",
  APPROVE:"text-emerald-400",REJECT: "text-red-400",     LOGIN:   "text-cyan-400",
  LOGOUT: "text-gray-400",   EXPORT: "text-yellow-400",  UPLOAD:  "text-purple-400",
  STATUS_CHANGE:"text-orange-400", CANCEL:"text-red-300", BULK_CREATE:"text-indigo-400",
};

export default function AuditLogsPage() {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ action: "", entityType: "", search: "" });
  const [draft, setDraft]       = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getAuditLogs(params);
      setLogs(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: draft }));
  };

  return (
    <DashboardLayout>
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ClipboardDocumentListIcon className="w-6 h-6 text-blue-400" />
        <h1 className="text-xl font-bold text-white">Audit Logs</h1>
        {total > 0 && <span className="text-sm text-gray-400">({total} entries)</span>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filters.action}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
          className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg px-3 py-2"
        >
          {ACTIONS.map((a) => <option key={a} value={a}>{a || "All Actions"}</option>)}
        </select>
        <select
          value={filters.entityType}
          onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
          className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg px-3 py-2"
        >
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t || "All Entities"}</option>)}
        </select>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search description…"
            className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg px-3 py-2 w-52"
          />
          <button type="submit" className="p-2 rounded-lg bg-gray-700 border border-gray-600 hover:bg-gray-600 transition-colors">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-300" />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900/50">
              <tr>
                {["Action", "Entity", "Actor", "Description", "IP Address", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No audit logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${ACTION_COLORS[log.action] || "text-gray-300"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{log.entityType}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300">{log.actorName}</div>
                      <div className="text-xs text-gray-500 capitalize">{log.actorRole}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.ipAddress || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
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
