const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const formatCurrency = (amount) => {
  if (amount == null) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
};

const getMonthName = (monthNum) => MONTH_NAMES[(Number(monthNum) || 1) - 1] || "";

const sanitizeFilename = (name) =>
  (name || "report").replace(/[^a-z0-9_\-]/gi, "_").replace(/__+/g, "_").slice(0, 80);

module.exports = { formatDate, formatCurrency, getMonthName, sanitizeFilename };
