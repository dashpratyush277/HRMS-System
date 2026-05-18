const { body, param } = require("express-validator");

const nonNegativeFloat = (field, label) =>
  body(field)
    .optional()
    .isFloat({ min: 0 })
    .withMessage(`${label} must be a non-negative number`);

const generatePayrollValidator = [
  body("employee").isMongoId().withMessage("Employee must be a valid ID"),
  body("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12"),
  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be a valid 4-digit year"),
  body("basicSalary")
    .isFloat({ min: 0 })
    .withMessage("Basic salary must be a non-negative number"),

  // Earnings (all optional)
  nonNegativeFloat("hra", "HRA"),
  nonNegativeFloat("allowances", "Allowances"),
  nonNegativeFloat("bonus", "Bonus"),

  // Deductions (all optional)
  nonNegativeFloat("tax", "Tax"),
  nonNegativeFloat("providentFund", "Provident fund"),
  nonNegativeFloat("insurance", "Insurance"),
  nonNegativeFloat("otherDeductions", "Other deductions"),
  nonNegativeFloat("lossOfPay", "Loss of pay"),

  // Attendance figures (all optional)
  body("totalWorkingDays")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Total working days must be a non-negative integer"),
  body("presentDays")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Present days must be a non-negative integer"),
  body("paidLeaves")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Paid leaves must be a non-negative integer"),
  body("unpaidLeaves")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Unpaid leaves must be a non-negative integer"),

  body("paymentMethod")
    .optional()
    .isIn(["bank-transfer", "cash", "cheque", "upi"])
    .withMessage("Payment method must be bank-transfer, cash, cheque, or upi"),
];

const updatePayrollStatusValidator = [
  param("id").isMongoId().withMessage("Invalid payroll ID"),
  body("paymentStatus")
    .isIn(["pending", "paid", "failed"])
    .withMessage("Payment status must be pending, paid, or failed"),
  body("paymentDate")
    .optional()
    .isISO8601()
    .withMessage("Payment date must be a valid date"),
  body("paymentMethod")
    .optional()
    .isIn(["bank-transfer", "cash", "cheque", "upi"])
    .withMessage("Payment method must be bank-transfer, cash, cheque, or upi"),
  body("transactionId").optional().trim(),
];

const payrollIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid payroll ID"),
];

module.exports = {
  generatePayrollValidator,
  updatePayrollStatusValidator,
  payrollIdParamValidator,
};
