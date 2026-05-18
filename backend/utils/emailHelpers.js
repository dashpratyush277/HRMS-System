const getEmployeeEmail = (employee) => employee?.email || null;

const getEmployeeName = (employee) => {
  if (!employee) return "Employee";
  if (employee.firstName && employee.lastName) {
    return `${employee.firstName} ${employee.lastName}`;
  }
  return employee.name || "Employee";
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const formatMonth = (monthNum) => MONTH_NAMES[(monthNum || 1) - 1] || "N/A";

module.exports = { getEmployeeEmail, getEmployeeName, formatDate, formatCurrency, formatMonth };
