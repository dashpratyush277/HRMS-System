const Payroll    = require("../models/Payroll");
const Attendance = require("../models/Attendance");
const Leave      = require("../models/Leave");
const Employee   = require("../models/Employee");
const { createPayslipPDF }                   = require("../utils/export/pdfExport");
const { createWorkbook, addWorksheet, sendExcelResponse } = require("../utils/export/excelExport");
const { formatDate, formatCurrency, getMonthName, sanitizeFilename } = require("../utils/export/reportHelpers");
const createAuditLog = require("../utils/auditLogger");

// GET /api/exports/payslip/:payrollId/pdf
const exportPayslipPDF = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.payrollId)
      .populate({ path: "employee", populate: { path: "department", select: "name" } });

    if (!payroll) return res.status(404).json({ success: false, message: "Payroll record not found" });

    if (req.user.role === "employee") {
      const emp = await Employee.findOne({ email: req.user.email });
      if (!emp || String(payroll.employee._id) !== String(emp._id)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    createAuditLog({ req, action: "EXPORT", entityType: "Payroll", entityId: payroll._id,
      description: `Payslip PDF exported for ${payroll.employee?.firstName} ${payroll.month}/${payroll.year}` });

    createPayslipPDF(res, { employee: payroll.employee, payroll });
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/exports/attendance/excel?month=&year=&employeeId=
const exportAttendanceExcel = async (req, res) => {
  try {
    const filter = {};
    if (req.query.month) filter.month = parseInt(req.query.month);
    if (req.query.year)  filter.year  = parseInt(req.query.year);
    if (req.query.employeeId) filter.employee = req.query.employeeId;

    if (req.user.role === "employee") {
      const emp = await Employee.findOne({ email: req.user.email });
      if (emp) filter.employee = emp._id;
    }

    const records = await Attendance.find(filter)
      .populate("employee", "firstName lastName employeeId email")
      .sort({ date: -1 })
      .lean();

    const wb = createWorkbook();
    const month = req.query.month ? getMonthName(req.query.month) : "All";
    const year  = req.query.year  || "All";

    addWorksheet(wb, {
      sheetName: "Attendance",
      title: `Attendance Report — ${month} ${year}`,
      columns: [
        { header: "Employee ID",  key: "empId",     width: 14 },
        { header: "Name",         key: "name",      width: 22 },
        { header: "Date",         key: "date",      width: 14 },
        { header: "Status",       key: "status",    width: 12 },
        { header: "Check In",     key: "checkIn",   width: 12 },
        { header: "Check Out",    key: "checkOut",  width: 12 },
        { header: "Work Hours",   key: "hours",     width: 12 },
        { header: "Overtime Hrs", key: "overtime",  width: 14 },
        { header: "Notes",        key: "notes",     width: 28 },
      ],
      rows: records.map((r) => ({
        empId:    r.employee?.employeeId || "",
        name:     r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : "",
        date:     formatDate(r.date),
        status:   r.status,
        checkIn:  r.checkIn  || "",
        checkOut: r.checkOut || "",
        hours:    r.workHours   != null ? r.workHours   : "",
        overtime: r.overtimeHours != null ? r.overtimeHours : "",
        notes:    r.notes || "",
      })),
    });

    createAuditLog({ req, action: "EXPORT", entityType: "Attendance",
      description: `Attendance Excel exported: ${month} ${year}` });

    await sendExcelResponse(res, wb, `attendance_${sanitizeFilename(`${month}_${year}`)}.xlsx`);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/exports/leaves/excel?status=&employeeId=&from=&to=
const exportLeavesExcel = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.employeeId) filter.employee = req.query.employeeId;
    if (req.query.from || req.query.to) {
      filter.startDate = {};
      if (req.query.from) filter.startDate.$gte = new Date(req.query.from);
      if (req.query.to)   filter.startDate.$lte = new Date(req.query.to);
    }

    if (req.user.role === "employee") {
      const emp = await Employee.findOne({ email: req.user.email });
      if (emp) filter.employee = emp._id;
    }

    const leaves = await Leave.find(filter)
      .populate("employee", "firstName lastName employeeId email department")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    const wb = createWorkbook();
    addWorksheet(wb, {
      sheetName: "Leaves",
      title: "Leave Report",
      columns: [
        { header: "Employee ID",  key: "empId",     width: 14 },
        { header: "Name",         key: "name",      width: 22 },
        { header: "Leave Type",   key: "leaveType", width: 14 },
        { header: "From",         key: "startDate", width: 14 },
        { header: "To",           key: "endDate",   width: 14 },
        { header: "Days",         key: "days",      width: 8  },
        { header: "Status",       key: "status",    width: 12 },
        { header: "Approved By",  key: "approvedBy",width: 18 },
        { header: "Reason",       key: "reason",    width: 32 },
      ],
      rows: leaves.map((l) => ({
        empId:      l.employee?.employeeId || "",
        name:       l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : "",
        leaveType:  l.leaveType,
        startDate:  formatDate(l.startDate),
        endDate:    formatDate(l.endDate),
        days:       l.totalDays ?? "",
        status:     l.status,
        approvedBy: l.approvedBy?.name || "",
        reason:     l.reason || "",
      })),
    });

    createAuditLog({ req, action: "EXPORT", entityType: "Leave",
      description: `Leaves Excel exported` });

    await sendExcelResponse(res, wb, "leaves_report.xlsx");
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/exports/payroll/excel?month=&year=&status=
const exportPayrollExcel = async (req, res) => {
  try {
    const filter = {};
    if (req.query.month)  filter.month  = parseInt(req.query.month);
    if (req.query.year)   filter.year   = parseInt(req.query.year);
    if (req.query.status) filter.status = req.query.status;

    const records = await Payroll.find(filter)
      .populate("employee", "firstName lastName employeeId email designation")
      .sort({ year: -1, month: -1 })
      .lean();

    const wb = createWorkbook();
    const month = req.query.month ? getMonthName(req.query.month) : "All";
    const year  = req.query.year  || "All";

    addWorksheet(wb, {
      sheetName: "Payroll",
      title: `Payroll Report — ${month} ${year}`,
      columns: [
        { header: "Employee ID",  key: "empId",       width: 14 },
        { header: "Name",         key: "name",        width: 22 },
        { header: "Designation",  key: "designation", width: 20 },
        { header: "Month",        key: "month",       width: 12 },
        { header: "Year",         key: "year",        width: 8  },
        { header: "Basic Salary", key: "basic",       width: 14 },
        { header: "Gross Salary", key: "gross",       width: 14 },
        { header: "Deductions",   key: "deductions",  width: 14 },
        { header: "Net Salary",   key: "net",         width: 14 },
        { header: "Status",       key: "status",      width: 12 },
      ],
      rows: records.map((p) => ({
        empId:       p.employee?.employeeId || "",
        name:        p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : "",
        designation: p.employee?.designation || "",
        month:       getMonthName(p.month),
        year:        p.year,
        basic:       formatCurrency(p.basicSalary),
        gross:       formatCurrency(p.grossSalary),
        deductions:  formatCurrency(p.totalDeductions),
        net:         formatCurrency(p.netSalary),
        status:      p.status,
      })),
    });

    createAuditLog({ req, action: "EXPORT", entityType: "Payroll",
      description: `Payroll Excel exported: ${month} ${year}` });

    await sendExcelResponse(res, wb, `payroll_${sanitizeFilename(`${month}_${year}`)}.xlsx`);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/exports/employees/excel?department=&status=
const exportEmployeesExcel = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status)     filter.status     = req.query.status;

    const employees = await Employee.find(filter)
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .lean();

    const wb = createWorkbook();
    addWorksheet(wb, {
      sheetName: "Employees",
      title: "Employee Directory",
      columns: [
        { header: "Employee ID",  key: "empId",       width: 14 },
        { header: "First Name",   key: "firstName",   width: 16 },
        { header: "Last Name",    key: "lastName",    width: 16 },
        { header: "Email",        key: "email",       width: 26 },
        { header: "Phone",        key: "phone",       width: 16 },
        { header: "Department",   key: "department",  width: 18 },
        { header: "Designation",  key: "designation", width: 20 },
        { header: "Join Date",    key: "joinDate",    width: 14 },
        { header: "Status",       key: "status",      width: 12 },
        { header: "Salary",       key: "salary",      width: 14 },
      ],
      rows: employees.map((e) => ({
        empId:       e.employeeId || "",
        firstName:   e.firstName || "",
        lastName:    e.lastName  || "",
        email:       e.email     || "",
        phone:       e.phone     || "",
        department:  e.department?.name || "",
        designation: e.designation || "",
        joinDate:    formatDate(e.joiningDate),
        status:      e.status || "active",
        salary:      formatCurrency(e.salary),
      })),
    });

    createAuditLog({ req, action: "EXPORT", entityType: "Employee",
      description: `Employee list Excel exported (${employees.length} records)` });

    await sendExcelResponse(res, wb, "employees_directory.xlsx");
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  exportPayslipPDF,
  exportAttendanceExcel,
  exportLeavesExcel,
  exportPayrollExcel,
  exportEmployeesExcel,
};
