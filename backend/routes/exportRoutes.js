const express = require("express");
const router  = express.Router();
const { protect }    = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  exportPayslipPDF,
  exportAttendanceExcel,
  exportLeavesExcel,
  exportPayrollExcel,
  exportEmployeesExcel,
} = require("../controllers/exportController");

router.use(protect);

// All employees can export their own payslip (access control inside controller)
router.get("/payslip/:payrollId/pdf", exportPayslipPDF);

// Employees can export their own attendance/leaves; admin/hr see all
router.get("/attendance/excel", exportAttendanceExcel);
router.get("/leaves/excel",     exportLeavesExcel);

// Admin/HR only
router.get("/payroll/excel",   authorizeRoles("admin", "hr"), exportPayrollExcel);
router.get("/employees/excel", authorizeRoles("admin", "hr"), exportEmployeesExcel);

module.exports = router;
