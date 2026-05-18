const express = require("express");
const router  = express.Router();
const { protect }       = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  getMyNotifications, getUnreadCount, markAsRead,
  markAllAsRead, deleteNotification, createManualNotification,
} = require("../controllers/notificationController");
const { manualNotificationValidator } = require("../validators/notificationValidators");
const validateRequest = require("../middleware/validateRequest");

router.use(protect);

router.get("/",             getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read",     markAsRead);
router.delete("/:id",       deleteNotification);

router.post(
  "/manual",
  authorizeRoles("admin", "hr"),
  manualNotificationValidator,
  validateRequest,
  createManualNotification
);

module.exports = router;
