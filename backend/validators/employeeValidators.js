const { body, param } = require("express-validator");

const createEmployeeValidator = [
  body("employeeId").trim().notEmpty().withMessage("Employee ID is required"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("designation").trim().notEmpty().withMessage("Designation is required"),
  body("joiningDate").isISO8601().withMessage("Joining date must be a valid date"),
  body("employmentType")
    .isIn(["full-time", "part-time", "intern", "contract"])
    .withMessage("Employment type must be full-time, part-time, intern, or contract"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "terminated"])
    .withMessage("Status must be active, inactive, or terminated"),
  body("basicSalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Basic salary must be a non-negative number"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),
];

const updateEmployeeValidator = [
  param("id").isMongoId().withMessage("Invalid employee ID"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("employmentType")
    .optional()
    .isIn(["full-time", "part-time", "intern", "contract"])
    .withMessage("Employment type must be full-time, part-time, intern, or contract"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "terminated"])
    .withMessage("Status must be active, inactive, or terminated"),
  body("basicSalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Basic salary must be a non-negative number"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),
  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Joining date must be a valid date"),
];

const employeeIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid employee ID"),
];

module.exports = {
  createEmployeeValidator,
  updateEmployeeValidator,
  employeeIdParamValidator,
};
