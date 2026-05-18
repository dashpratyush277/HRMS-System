const express = require("express");
const router  = express.Router();
const { protect }    = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getAuditLogs, getAuditStats, getAuditLogById } = require("../controllers/auditLogController");

router.use(protect, authorizeRoles("admin"));

router.get("/",       getAuditLogs);
router.get("/stats",  getAuditStats);
router.get("/:id",    getAuditLogById);

module.exports = router;
