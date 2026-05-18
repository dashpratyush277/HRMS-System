const ActionModal = ({
  title,
  message,
  actionLabel,
  actionColor = "blue",
  showComment = false,
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const btnCls = {
    blue:  "bg-blue-600  hover:bg-blue-500",
    green: "bg-green-600 hover:bg-green-500",
    red:   "bg-red-600   hover:bg-red-500",
  }[actionColor] || "bg-blue-600 hover:bg-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-4">{message}</p>

        {showComment && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Comment <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={3}
              placeholder="Add a comment for the employee…"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${btnCls}`}
          >
            {loading ? "Processing…" : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
