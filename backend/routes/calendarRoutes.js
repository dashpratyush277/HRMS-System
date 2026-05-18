const express = require("express");
const router  = express.Router();
const { protect }    = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getMyCalendar, getTeamCalendar } = require("../controllers/calendarController");

router.use(protect);

router.get("/my",   getMyCalendar);
router.get("/team", authorizeRoles("admin", "hr"), getTeamCalendar);

module.exports = router;
