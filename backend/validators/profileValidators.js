const { body } = require("express-validator");

const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be 2–80 characters"),

  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[+\d\s\-()]{7,20}$/)
    .withMessage("Enter a valid phone number"),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage("Address max 300 characters"),

  body("dateOfBirth")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid date (YYYY-MM-DD)")
    .custom((v) => new Date(v) < new Date())
    .withMessage("Date of birth must be in the past"),

  body("gender")
    .optional({ nullable: true, checkFalsy: true })
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((v, { req }) => v === req.body.newPassword)
    .withMessage("Passwords do not match"),
];

module.exports = { updateProfileValidator, changePasswordValidator };
