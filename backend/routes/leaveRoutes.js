const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRequest    = require("../middleware/validateRequest");
const { uploadLeaveAttachment } = require("../middleware/uploadMiddleware");
const uploadErrorHandler = require("../middleware/uploadErrorHandler");
const {
  applyLeaveValidator,
  updateLeaveStatusValidator,
  cancelLeaveValidator,
  leaveIdParamValidator,
  updateLeaveBalanceValidator,
} = require("../validators/leaveValidators");
const {
  applyLeave, getLeaves, getLeaveById, updateLeaveStatus, cancelLeave,
  getMyLeaves, getLeaveBalance, getMyLeaveBalance, updateLeaveBalance, getLeaveStats,
} = require("../controllers/leaveController");

// CRITICAL route ordering: named paths before /:id
router.get("/stats",      protect, authorizeRoles("admin", "hr"), getLeaveStats);
router.get("/my/balance", protect, getMyLeaveBalance);
router.get("/my",         protect, getMyLeaves);

router.get("/balance/:employeeId", protect, getLeaveBalance);
router.put("/balance/:employeeId", protect, authorizeRoles("admin"), updateLeaveBalanceValidator, validateRequest, updateLeaveBalance);

router
  .route("/")
  .get(protect,  authorizeRoles("admin", "hr"), getLeaves)
  .post(protect, uploadLeaveAttachment.single("attachment"), uploadErrorHandler, applyLeaveValidator, validateRequest, applyLeave);

router.get("/:id",        protect, leaveIdParamValidator,         validateRequest, getLeaveById);
router.put("/:id/status", protect, authorizeRoles("admin", "hr"), updateLeaveStatusValidator, validateRequest, updateLeaveStatus);
router.put("/:id/cancel", protect, cancelLeaveValidator,          validateRequest, cancelLeave);

module.exports = router;
