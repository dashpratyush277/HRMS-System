const { body, param } = require("express-validator");

const GOAL_CATEGORIES = [
  "productivity", "quality", "teamwork", "leadership", "learning", "attendance", "custom",
];
const GOAL_STATUSES = [
  "not-started", "in-progress", "completed", "overdue", "cancelled",
];
const REVIEW_STATUSES = ["draft", "submitted", "approved", "rejected"];

const ratingField = (field) =>
  body(field)
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage(`${field} must be between 1 and 5`);

const createGoalValidator = [
  body("employee").isMongoId().withMessage("Employee must be a valid ID"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().trim(),
  body("category")
    .optional()
    .isIn(GOAL_CATEGORIES)
    .withMessage(`Category must be one of: ${GOAL_CATEGORIES.join(", ")}`),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("startDate").isISO8601().withMessage("Start date must be a valid date"),
  body("dueDate")
    .isISO8601()
    .withMessage("Due date must be a valid date")
    .custom((dueDate, { req }) => {
      if (new Date(dueDate) < new Date(req.body.startDate)) {
        throw new Error("Due date cannot be before start date");
      }
      return true;
    }),
  body("progress")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Progress must be between 0 and 100"),
  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a non-negative number"),
  body("score")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("Score must be between 0 and 10"),
];

const updateGoalValidator = [
  param("id").isMongoId().withMessage("Invalid goal ID"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("category")
    .optional()
    .isIn(GOAL_CATEGORIES)
    .withMessage(`Category must be one of: ${GOAL_CATEGORIES.join(", ")}`),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("progress")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Progress must be between 0 and 100"),
  body("score")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("Score must be between 0 and 10"),
  body("status")
    .optional()
    .isIn(GOAL_STATUSES)
    .withMessage(`Status must be one of: ${GOAL_STATUSES.join(", ")}`),
];

const updateGoalProgressValidator = [
  param("id").isMongoId().withMessage("Invalid goal ID"),
  body("progress")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Progress must be between 0 and 100"),
  body("employeeComment").optional().trim(),
];

const createReviewValidator = [
  body("employee").isMongoId().withMessage("Employee must be a valid ID"),
  body("reviewPeriod").trim().notEmpty().withMessage("Review period is required"),
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
  ratingField("productivityRating"),
  ratingField("qualityRating"),
  ratingField("teamworkRating"),
  ratingField("communicationRating"),
  ratingField("leadershipRating"),
  ratingField("overallRating"),
  body("status")
    .optional()
    .isIn(REVIEW_STATUSES)
    .withMessage(`Status must be one of: ${REVIEW_STATUSES.join(", ")}`),
];

const updateReviewStatusValidator = [
  param("id").isMongoId().withMessage("Invalid review ID"),
  body("status")
    .isIn(REVIEW_STATUSES)
    .withMessage(`Status must be one of: ${REVIEW_STATUSES.join(", ")}`),
  body("finalComments").optional().trim(),
];

const goalIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid goal ID"),
];

const reviewIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid review ID"),
];

module.exports = {
  createGoalValidator,
  updateGoalValidator,
  updateGoalProgressValidator,
  createReviewValidator,
  updateReviewStatusValidator,
  goalIdParamValidator,
  reviewIdParamValidator,
};
