const { body } = require("express-validator");

const manualNotificationValidator = [
  body("recipient").notEmpty().withMessage("Recipient is required").isMongoId().withMessage("Invalid recipient ID"),
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }).withMessage("Title max 120 chars"),
  body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 500 }).withMessage("Message max 500 chars"),
  body("type").optional().isIn(["leave","payroll","recruitment","performance","attendance","system","general"])
    .withMessage("Invalid notification type"),
  body("priority").optional().isIn(["low","medium","high"]).withMessage("Priority must be low, medium, or high"),
  body("actionUrl").optional().isLength({ max: 300 }).withMessage("actionUrl max 300 chars"),
];

module.exports = { manualNotificationValidator };
