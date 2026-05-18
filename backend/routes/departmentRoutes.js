const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRequest    = require("../middleware/validateRequest");
const {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdParamValidator,
} = require("../validators/departmentValidators");
const {
  getDepartmentStats, getDepartments, getDepartmentById,
  createDepartment, updateDepartment, deleteDepartment,
} = require("../controllers/departmentController");

// /stats MUST come before /:id
router.get("/stats", protect, authorizeRoles("admin", "hr"), getDepartmentStats);

router
  .route("/")
  .get(protect,  authorizeRoles("admin", "hr"), getDepartments)
  .post(protect, authorizeRoles("admin", "hr"), createDepartmentValidator, validateRequest, createDepartment);

router
  .route("/:id")
  .get(protect,    authorizeRoles("admin", "hr"), departmentIdParamValidator, validateRequest, getDepartmentById)
  .put(protect,    authorizeRoles("admin", "hr"), updateDepartmentValidator,  validateRequest, updateDepartment)
  .delete(protect, authorizeRoles("admin"),       departmentIdParamValidator, validateRequest, deleteDepartment);

module.exports = router;
