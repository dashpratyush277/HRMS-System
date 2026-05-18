const { body, param } = require("express-validator");

const TIME_REGEX = /^([0-1]\d|2[0-3]):[0-5]\d$/;

const markAttendanceValidator = [
  body("employee").isMongoId().withMessage("Employee must be a valid ID"),
  body("date").isISO8601().withMessage("Date must be a valid date"),
  body("status")
    .isIn(["present", "absent", "half-day", "leave", "holiday"])
    .withMessage("Status must be present, absent, half-day, leave, or holiday"),
  body("checkIn")
    .optional()
    .matches(TIME_REGEX)
    .withMessage("Check-in must be in HH:mm format"),
  body("checkOut")
    .optional()
    .matches(TIME_REGEX)
    .withMessage("Check-out must be in HH:mm format"),
  body("remarks").optional().trim(),
];

const bulkAttendanceValidator = [
  body("date").isISO8601().withMessage("Date must be a valid date"),
  body("records")
    .isArray({ min: 1 })
    .withMessage("Records must be a non-empty array"),
  body("records.*.employee")
    .isMongoId()
    .withMessage("Each record must have a valid employee ID"),
  body("records.*.status")
    .isIn(["present", "absent", "half-day", "leave", "holiday"])
    .withMessage("Each record status must be present, absent, half-day, leave, or holiday"),
  body("records.*.checkIn")
    .optional()
    .matches(TIME_REGEX)
    .withMessage("Check-in must be in HH:mm format"),
  body("records.*.checkOut")
    .optional()
    .matches(TIME_REGEX)
    .withMessage("Check-out must be in HH:mm format"),
];

const updateAttendanceValidator = [
  param("id").isMongoId().withMessage("Invalid attendance ID"),
  body("status")
    .optional()
    .isIn(["present", "absent", "half-day", "leave", "holiday"])
    .withMessage("Status must be present, absent, half-day, leave, or holiday"),
  body("checkIn")
    .optional()
    .matches(TIME_REGEX)
    .withMessage("Check-in must be in HH:mm format"),
  body("checkOut")
    .optional()
    .matches(TIME_REGEX)
    .withMessage("Check-out must be in HH:mm format"),
  body("remarks").optional().trim(),
];

const attendanceIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid attendance ID"),
];

module.exports = {
  markAttendanceValidator,
  bulkAttendanceValidator,
  updateAttendanceValidator,
  attendanceIdParamValidator,
};
