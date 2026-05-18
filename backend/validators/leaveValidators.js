const { body, param } = require("express-validator");

const LEAVE_TYPES = ["casual", "sick", "earned", "maternity", "paternity", "unpaid"];

const applyLeaveValidator = [
  // employee is optional here — employees submit for themselves, HR/admin can specify
  body("employee")
    .optional()
    .isMongoId()
    .withMessage("Employee must be a valid ID"),
  body("leaveType")
    .isIn(LEAVE_TYPES)
    .withMessage(`Leave type must be one of: ${LEAVE_TYPES.join(", ")}`),
  body("startDate").isISO8601().withMessage("Start date must be a valid date"),
  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("End date cannot be before start date");
      }
      return true;
    }),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
];

const updateLeaveStatusValidator = [
  param("id").isMongoId().withMessage("Invalid leave ID"),
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be approved or rejected"),
  body("adminComment").optional().trim(),
];

const cancelLeaveValidator = [
  param("id").isMongoId().withMessage("Invalid leave ID"),
];

const leaveIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid leave ID"),
];

const updateLeaveBalanceValidator = [
  param("employeeId").isMongoId().withMessage("Invalid employee ID"),
  body("casual")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Casual leave must be a non-negative integer"),
  body("sick")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sick leave must be a non-negative integer"),
  body("earned")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Earned leave must be a non-negative integer"),
  body("maternity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maternity leave must be a non-negative integer"),
  body("paternity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Paternity leave must be a non-negative integer"),
  body("unpaid")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Unpaid leave must be a non-negative integer"),
];

module.exports = {
  applyLeaveValidator,
  updateLeaveStatusValidator,
  cancelLeaveValidator,
  leaveIdParamValidator,
  updateLeaveBalanceValidator,
};
