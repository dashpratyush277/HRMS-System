const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRequest    = require("../middleware/validateRequest");
const {
  markAttendanceValidator,
  bulkAttendanceValidator,
  updateAttendanceValidator,
  attendanceIdParamValidator,
} = require("../validators/attendanceValidators");
const {
  getAttendanceStats, getMyAttendance, bulkMarkAttendance,
  getEmployeeAttendance, getAttendance, markAttendance,
  getAttendanceById, updateAttendance, deleteAttendance,
} = require("../controllers/attendanceController");

// CRITICAL: named paths before /:id
router.get("/stats",   protect, authorizeRoles("admin", "hr"), getAttendanceStats);
router.get("/my",      protect, getMyAttendance);
router.post("/bulk",   protect, authorizeRoles("admin", "hr"), bulkAttendanceValidator, validateRequest, bulkMarkAttendance);
router.get("/employee/:employeeId", protect, authorizeRoles("admin", "hr"), getEmployeeAttendance);

router
  .route("/")
  .get(protect,  authorizeRoles("admin", "hr"), getAttendance)
  .post(protect, authorizeRoles("admin", "hr"), markAttendanceValidator, validateRequest, markAttendance);

router
  .route("/:id")
  .get(protect,    authorizeRoles("admin", "hr"), attendanceIdParamValidator, validateRequest, getAttendanceById)
  .put(protect,    authorizeRoles("admin", "hr"), updateAttendanceValidator,  validateRequest, updateAttendance)
  .delete(protect, authorizeRoles("admin", "hr"), attendanceIdParamValidator, validateRequest, deleteAttendance);

module.exports = router;
