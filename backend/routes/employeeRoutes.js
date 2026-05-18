const express = require("express");
const router  = express.Router();

const {
  createEmployee, getEmployees, getEmployeeStats,
  getEmployeeById, updateEmployee, deleteEmployee,
} = require("../controllers/employeeController");

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRequest    = require("../middleware/validateRequest");
const {
  createEmployeeValidator,
  updateEmployeeValidator,
  employeeIdParamValidator,
} = require("../validators/employeeValidators");

// IMPORTANT: /stats must come before /:id
router.get("/stats", protect, authorizeRoles("admin", "hr"), getEmployeeStats);

router.get("/",  protect, authorizeRoles("admin", "hr"), getEmployees);
router.post("/", protect, authorizeRoles("admin", "hr"), createEmployeeValidator, validateRequest, createEmployee);

router.get("/:id",    protect, authorizeRoles("admin", "hr"), employeeIdParamValidator, validateRequest, getEmployeeById);
router.put("/:id",    protect, authorizeRoles("admin", "hr"), updateEmployeeValidator,  validateRequest, updateEmployee);
router.delete("/:id", protect, authorizeRoles("admin"),       employeeIdParamValidator, validateRequest, deleteEmployee);

module.exports = router;
