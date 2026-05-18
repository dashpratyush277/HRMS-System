const { body, param } = require("express-validator");

const createDepartmentValidator = [
  body("name").trim().notEmpty().withMessage("Department name is required"),
  body("code").trim().notEmpty().withMessage("Department code is required"),
  body("description").optional().trim(),
  body("location").optional().trim(),
  body("headOfDepartment")
    .optional()
    .isMongoId()
    .withMessage("Head of department must be a valid employee ID"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
];

const updateDepartmentValidator = [
  param("id").isMongoId().withMessage("Invalid department ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department name cannot be empty"),
  body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department code cannot be empty"),
  body("description").optional().trim(),
  body("location").optional().trim(),
  body("headOfDepartment")
    .optional()
    .isMongoId()
    .withMessage("Head of department must be a valid employee ID"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
];

const departmentIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid department ID"),
];

module.exports = {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdParamValidator,
};
