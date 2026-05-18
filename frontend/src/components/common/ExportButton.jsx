import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { downloadBlob } from "../../utils/downloadBlob";

export default function ExportButton({ label = "Export", apiFn, filename, params = {}, className = "" }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiFn(params);
      downloadBlob(res.data, filename);
    } catch (err) {
      console.error("Export failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed
        text-white transition-colors ${className}`}
    >
      <ArrowDownTrayIcon className={`w-4 h-4 ${loading ? "animate-bounce" : ""}`} />
      {loading ? "Exporting…" : label}
    </button>
  );
}
