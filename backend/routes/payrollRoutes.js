const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRequest    = require("../middleware/validateRequest");
const {
  generatePayrollValidator,
  updatePayrollStatusValidator,
  payrollIdParamValidator,
} = require("../validators/payrollValidators");
const {
  generatePayroll, generateBulkPayroll, getPayrolls, getPayrollById,
  updatePayroll, updatePaymentStatus, deletePayroll, getMyPayslips, getPayrollStats,
} = require("../controllers/payrollController");

// CRITICAL: named paths before /:id
router.get("/stats", protect, authorizeRoles("admin", "hr"), getPayrollStats);
router.get("/my",    protect, authorizeRoles("employee"),    getMyPayslips);
router.post("/bulk", protect, authorizeRoles("admin", "hr"), generateBulkPayroll);

router
  .route("/")
  .get(protect,  authorizeRoles("admin", "hr"), getPayrolls)
  .post(protect, authorizeRoles("admin", "hr"), generatePayrollValidator, validateRequest, generatePayroll);

router.get("/:id",        protect, payrollIdParamValidator,       validateRequest, getPayrollById);
router.put("/:id",        protect, authorizeRoles("admin", "hr"), payrollIdParamValidator,      validateRequest, updatePayroll);
router.put("/:id/status", protect, authorizeRoles("admin", "hr"), updatePayrollStatusValidator, validateRequest, updatePaymentStatus);
router.delete("/:id",     protect, authorizeRoles("admin"),       payrollIdParamValidator,      validateRequest, deletePayroll);

module.exports = router;
