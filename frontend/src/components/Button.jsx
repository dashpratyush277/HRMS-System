// Reusable button with loading spinner and multiple style variants.
const Button = ({
  children,
  type = "button",
  onClick,
  disabled,
  loading,
  variant = "primary",
  fullWidth,
  className = "",
}) => {
  const base =
    "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    ghost:
      "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
