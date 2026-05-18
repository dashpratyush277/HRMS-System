const express = require("express");
const router  = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createGoalValidator,
  updateGoalValidator,
  updateGoalProgressValidator,
  createReviewValidator,
  updateReviewStatusValidator,
  goalIdParamValidator,
  reviewIdParamValidator,
} = require("../validators/performanceValidators");
const {
  createGoal, getGoals, getGoalById, updateGoal, updateGoalProgress, deleteGoal, getMyGoals,
  createReview, getReviews, getReviewById, updateReview, updateReviewStatus, deleteReview, getMyReviews,
  getPerformanceStats,
} = require("../controllers/performanceController");

// Stats — before any /:id routes
router.get("/stats", protect, authorizeRoles("admin", "hr"), getPerformanceStats);

// Self-service
router.get("/my-goals",   protect, getMyGoals);
router.get("/my-reviews", protect, getMyReviews);

// Goals
router.route("/goals")
  .get(protect,  authorizeRoles("admin", "hr"), getGoals)
  .post(protect, authorizeRoles("admin", "hr"), createGoalValidator, validateRequest, createGoal);

router.route("/goals/:id")
  .get(protect,    goalIdParamValidator, validateRequest, getGoalById)
  .put(protect,    authorizeRoles("admin", "hr"), updateGoalValidator,  validateRequest, updateGoal)
  .delete(protect, authorizeRoles("admin"),       goalIdParamValidator, validateRequest, deleteGoal);

router.put("/goals/:id/progress", protect, updateGoalProgressValidator, validateRequest, updateGoalProgress);

// Reviews
router.route("/reviews")
  .get(protect,  authorizeRoles("admin", "hr"), getReviews)
  .post(protect, authorizeRoles("admin", "hr"), createReviewValidator, validateRequest, createReview);

router.route("/reviews/:id")
  .get(protect,    reviewIdParamValidator, validateRequest, getReviewById)
  .put(protect,    authorizeRoles("admin", "hr"), reviewIdParamValidator, validateRequest, updateReview)
  .delete(protect, authorizeRoles("admin"),       reviewIdParamValidator, validateRequest, deleteReview);

router.put("/reviews/:id/status", protect, authorizeRoles("admin", "hr"), updateReviewStatusValidator, validateRequest, updateReviewStatus);

module.exports = router;
