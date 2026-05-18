const Payroll  = require("../models/Payroll");
const Employee = require("../models/Employee");
const User     = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { getEmployeeName, formatCurrency, formatMonth } = require("../utils/emailHelpers");
const { payrollGeneratedTemplate } = require("../utils/emailTemplates");
const { createNotification } = require("../utils/createNotification");
const createAuditLog         = require("../utils/auditLogger");

// ── POST /api/payroll ────────────────────────────────────────────────────────
const generatePayroll = async (req, res) => {
  try {
    const {
      employee: empId, month, year,
      hra, allowances, bonus,
      tax, providentFund, insurance, otherDeductions,
      totalWorkingDays, presentDays, paidLeaves, unpaidLeaves, lossOfPay,
      paymentMethod, remarks,
    } = req.body;

    if (!empId || !month || !year) {
      return res.status(400).json({ success: false, message: "employee, month and year are required." });
    }
    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: "Month must be between 1 and 12." });
    }

    const employee = await Employee.findById(empId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

    // Prevent duplicate
    const existing = await Payroll.findOne({ employee: empId, month, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Payroll already generated for this employee for ${month}/${year}.`,
      });
    }

    // Validate numeric fields are not negative
    const numFields = { hra, allowances, bonus, tax, providentFund, insurance, otherDeductions,
                        totalWorkingDays, presentDays, paidLeaves, unpaidLeaves, lossOfPay };
    for (const [key, val] of Object.entries(numFields)) {
      if (val !== undefined && Number(val) < 0) {
        return res.status(400).json({ success: false, message: `${key} cannot be negative.` });
      }
    }

    const payroll = await Payroll.create({
      employee: empId,
      month: Number(month),
      year:  Number(year),
      basicSalary:      employee.basicSalary || 0,
      hra:              Number(hra)              || 0,
      allowances:       Number(allowances)       || 0,
      bonus:            Number(bonus)            || 0,
      tax:              Number(tax)              || 0,
      providentFund:    Number(providentFund)    || 0,
      insurance:        Number(insurance)        || 0,
      otherDeductions:  Number(otherDeductions)  || 0,
      totalWorkingDays: Number(totalWorkingDays) || 0,
      presentDays:      Number(presentDays)      || 0,
      paidLeaves:       Number(paidLeaves)        || 0,
      unpaidLeaves:     Number(unpaidLeaves)     || 0,
      lossOfPay:        Number(lossOfPay)        || 0,
      paymentMethod:    paymentMethod || "bank-transfer",
      remarks:          remarks || "",
      generatedBy: req.user._id,
      updatedBy:   req.user._id,
    });

    await payroll.populate("employee", "firstName lastName employeeId department designation email");

    // Notify employee
    if (employee.email) {
      sendEmail({
        to:      employee.email,
        subject: `Payslip Ready — ${formatMonth(Number(month))} ${year}`,
        html:    payrollGeneratedTemplate({
          employeeName: getEmployeeName(employee),
          month:        formatMonth(Number(month)),
          year,
          netSalary:    formatCurrency(payroll.netSalary),
          payslipUrl:   `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-payslips`,
        }),
      });

      const empUser = await User.findOne({ email: employee.email }).select("_id").lean();
      if (empUser) {
        createNotification({
          recipient: empUser._id,
          sender:    req.user._id,
          title:     "Payslip Ready",
          message:   `Your payslip for ${formatMonth(Number(month))} ${year} is ready. Net salary: ₹${formatCurrency(payroll.netSalary)}.`,
          type:      "payroll",
          priority:  "medium",
          actionUrl: "/my-payslips",
        });
      }
    }

    createAuditLog({ req, action: "CREATE", entityType: "Payroll", entityId: payroll._id,
      description: `Payroll generated for ${getEmployeeName(employee)}: ${formatMonth(Number(month))} ${year}, Net: ₹${formatCurrency(payroll.netSalary)}` });

    res.status(201).json({ success: true, payroll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/payroll/bulk ───────────────────────────────────────────────────
const generateBulkPayroll = async (req, res) => {
  try {
    const { month, year, employeeIds = [], defaultValues = {} } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "month and year are required." });
    }
    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: "Month must be between 1 and 12." });
    }

    // Resolve employees to process
    let employees;
    if (employeeIds.length > 0) {
      employees = await Employee.find({ _id: { $in: employeeIds }, status: "active" });
    } else {
      employees = await Employee.find({ status: "active" });
    }

    const results = { created: 0, skipped: 0, records: [], errors: [] };

    for (const emp of employees) {
      try {
        const existing = await Payroll.findOne({ employee: emp._id, month, year });
        if (existing) { results.skipped++; continue; }

        const basic = emp.basicSalary || 0;
        const hraVal  = defaultValues.hra  !== undefined ? Number(defaultValues.hra)  : Math.round(basic * 0.4);
        const pfVal   = defaultValues.providentFund !== undefined ? Number(defaultValues.providentFund) : Math.round(basic * 0.12);

        const payroll = await Payroll.create({
          employee:         emp._id,
          month:            Number(month),
          year:             Number(year),
          basicSalary:      basic,
          hra:              hraVal,
          allowances:       Number(defaultValues.allowances)      || 0,
          bonus:            Number(defaultValues.bonus)           || 0,
          tax:              Number(defaultValues.tax)             || 0,
          providentFund:    pfVal,
          insurance:        Number(defaultValues.insurance)       || 0,
          otherDeductions:  Number(defaultValues.otherDeductions) || 0,
          totalWorkingDays: Number(defaultValues.totalWorkingDays)|| 0,
          paymentMethod:    defaultValues.paymentMethod || "bank-transfer",
          remarks:          defaultValues.remarks || "",
          generatedBy: req.user._id,
          updatedBy:   req.user._id,
        });

        results.created++;
        results.records.push(payroll._id);
      } catch (e) {
        results.errors.push({ employee: emp._id, error: e.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${results.created} payroll(s). Skipped ${results.skipped} (already exist).`,
      createdCount: results.created,
      skippedCount: results.skipped,
      records: results.records,
      errors:  results.errors,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/payroll ─────────────────────────────────────────────────────────
const getPayrolls = async (req, res) => {
  try {
    const { employee: empFilter, month, year, paymentStatus, department, page = 1, limit = 20 } = req.query;
    const query = {};

    if (empFilter)     query.employee      = empFilter;
    if (month)         query.month         = Number(month);
    if (year)          query.year          = Number(year);
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Department filter: find employee IDs in that department first
    if (department) {
      const empIds = await Employee.find({ department }, "_id");
      query.employee = { $in: empIds.map((e) => e._id) };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Payroll.countDocuments(query);
    const payrolls = await Payroll.find(query)
      .populate("employee", "firstName lastName employeeId department designation basicSalary")
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: payrolls.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      payrolls,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/payroll/:id ─────────────────────────────────────────────────────
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      "employee",
      "firstName lastName employeeId email department designation basicSalary phone"
    );
    if (!payroll) return res.status(404).json({ success: false, message: "Payroll record not found." });

    if (req.user.role === "employee" && payroll.employee?.email !== req.user.email) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, payroll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/payroll/:id ─────────────────────────────────────────────────────
const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: "Payroll record not found." });

    const editableFields = [
      "hra", "allowances", "bonus",
      "tax", "providentFund", "insurance", "otherDeductions",
      "totalWorkingDays", "presentDays", "paidLeaves", "unpaidLeaves", "lossOfPay",
      "paymentMethod", "remarks",
    ];

    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        const val = Number(req.body[field]);
        if (["hra","allowances","bonus","tax","providentFund","insurance","otherDeductions","lossOfPay"].includes(field) && val < 0) {
          return res.status(400).json({ success: false, message: `${field} cannot be negative.` });
        }
        payroll[field] = isNaN(val) ? req.body[field] : val;
      }
    }

    payroll.updatedBy = req.user._id;
    await payroll.save();
    await payroll.populate("employee", "firstName lastName employeeId department designation");
    res.json({ success: true, payroll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/payroll/:id/status ──────────────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentDate, transactionId } = req.body;

    if (!["pending", "paid", "failed"].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status." });
    }

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: "Payroll record not found." });

    payroll.paymentStatus = paymentStatus;
    if (paymentStatus === "paid") {
      payroll.paymentDate  = paymentDate ? new Date(paymentDate) : new Date();
      if (transactionId) payroll.transactionId = transactionId;
    }
    payroll.updatedBy = req.user._id;
    await payroll.save();

    await payroll.populate("employee", "firstName lastName employeeId");
    res.json({ success: true, payroll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/payroll/:id ──────────────────────────────────────────────────
const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: "Payroll record not found." });

    if (payroll.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Cannot delete a paid payroll record." });
    }

    await payroll.deleteOne();
    res.json({ success: true, message: "Payroll record deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/payroll/my ──────────────────────────────────────────────────────
const getMyPayslips = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const { year, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = { employee: employee._id };
    if (year)          query.year          = Number(year);
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Payroll.countDocuments(query);
    const payslips = await Payroll.find(query)
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: payslips.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      payslips,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/payroll/stats ───────────────────────────────────────────────────
const getPayrollStats = async (req, res) => {
  try {
    const query = {};
    if (req.query.month) query.month = Number(req.query.month);
    if (req.query.year)  query.year  = Number(req.query.year);

    const [total, pending, paid, failed] = await Promise.all([
      Payroll.countDocuments(query),
      Payroll.countDocuments({ ...query, paymentStatus: "pending" }),
      Payroll.countDocuments({ ...query, paymentStatus: "paid"    }),
      Payroll.countDocuments({ ...query, paymentStatus: "failed"  }),
    ]);

    const salaryAgg = await Payroll.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalGrossSalary: { $sum: "$grossSalary"     },
          totalDeductions:  { $sum: "$totalDeductions" },
          totalNetSalary:   { $sum: "$netSalary"       },
        },
      },
    ]);

    const deptAgg = await Payroll.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "emp",
        },
      },
      { $unwind: "$emp" },
      {
        $group: {
          _id: "$emp.department",
          totalNet: { $sum: "$netSalary" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalNet: -1 } },
    ]);

    const agg = salaryAgg[0] || { totalGrossSalary: 0, totalDeductions: 0, totalNetSalary: 0 };

    res.json({
      success: true,
      stats: {
        totalPayrolls: total,
        pendingPayments: pending,
        paidPayments: paid,
        failedPayments: failed,
        totalGrossSalary: agg.totalGrossSalary,
        totalDeductions:  agg.totalDeductions,
        totalNetSalary:   agg.totalNetSalary,
        departmentWisePayroll: deptAgg,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generatePayroll,
  generateBulkPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  updatePaymentStatus,
  deletePayroll,
  getMyPayslips,
  getPayrollStats,
};
