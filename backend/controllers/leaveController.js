const Leave        = require("../models/Leave");
const LeaveBalance = require("../models/LeaveBalance");
const Employee     = require("../models/Employee");
const User         = require("../models/User");
const sendEmail    = require("../utils/sendEmail");
const { getEmployeeName, formatDate } = require("../utils/emailHelpers");
const {
  leaveSubmittedTemplate,
  leaveApprovedTemplate,
  leaveRejectedTemplate,
} = require("../utils/emailTemplates");
const { createNotification } = require("../utils/createNotification");
const createAuditLog         = require("../utils/auditLogger");

// Map leaveType → used field name in LeaveBalance
const usedField = {
  casual:    "usedCasual",
  sick:      "usedSick",
  earned:    "usedEarned",
  maternity: "usedMaternity",
  paternity: "usedPaternity",
  unpaid:    "usedUnpaid",
};

// GET or create a default balance record for employee + year
const getOrCreateBalance = async (employeeId, year) => {
  let balance = await LeaveBalance.findOne({ employee: employeeId, year });
  if (!balance) {
    balance = await LeaveBalance.create({ employee: employeeId, year });
  }
  return balance;
};

// Attach available fields to a balance document (returns plain object)
const withAvailable = (b) => ({
  ...b.toJSON(),
  availableCasual:    b.casual    - b.usedCasual,
  availableSick:      b.sick      - b.usedSick,
  availableEarned:    b.earned    - b.usedEarned,
  availableMaternity: b.maternity - b.usedMaternity,
  availablePaternity: b.paternity - b.usedPaternity,
  availableUnpaid:    b.unpaid    - b.usedUnpaid,
});

// ── POST /api/leaves ─────────────────────────────────────────────────────────
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachment } = req.body;
    let { employeeId } = req.body;

    // Resolve employee
    if (req.user.role === "employee") {
      const emp = await Employee.findOne({ email: req.user.email });
      if (!emp) return res.status(404).json({ success: false, message: "Employee profile not found." });
      employeeId = emp._id;
    } else {
      if (!employeeId) return res.status(400).json({ success: false, message: "Employee ID is required." });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: "leaveType, startDate, endDate and reason are required." });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (end < start) {
      return res.status(400).json({ success: false, message: "End date cannot be before start date." });
    }

    const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const year      = start.getFullYear();

    // Check for overlapping pending/approved leaves
    const overlap = await Leave.findOne({
      employee: employeeId,
      status:   { $in: ["pending", "approved"] },
      $or: [
        { startDate: { $lte: end   }, endDate: { $gte: start } },
      ],
    });
    if (overlap) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending or approved leave that overlaps with these dates.",
      });
    }

    // Check leave balance (skip balance check for unpaid leaves)
    if (leaveType !== "unpaid") {
      const balance   = await getOrCreateBalance(employeeId, year);
      const allocated = balance[leaveType] || 0;
      const used      = balance[usedField[leaveType]] || 0;
      const available = allocated - used;
      if (available < totalDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Available: ${available} day(s), Requested: ${totalDays} day(s).`,
        });
      }
    }

    const attachmentPath = req.file ? `/uploads/leaves/${req.file.filename}` : (attachment || "");

    const leave = await Leave.create({
      employee:   employeeId,
      leaveType,
      startDate:  start,
      endDate:    end,
      totalDays,
      reason,
      attachment: attachmentPath,
      status:     "pending",
      createdBy:  req.user._id,
      updatedBy:  req.user._id,
    });

    await leave.populate("employee", "firstName lastName employeeId email department designation");

    // Notify employee of submission
    if (leave.employee?.email) {
      sendEmail({
        to:      leave.employee.email,
        subject: "Leave Request Submitted",
        html:    leaveSubmittedTemplate({
          employeeName: getEmployeeName(leave.employee),
          leaveType,
          startDate: formatDate(start),
          endDate:   formatDate(end),
          totalDays,
        }),
      });
    }

    // In-app notification to the requester
    const userForNotification = await User.findOne({ email: leave.employee?.email }).select("_id").lean();
    if (userForNotification) {
      createNotification({
        recipient: userForNotification._id,
        sender:    req.user._id,
        title:     "Leave Request Submitted",
        message:   `Your ${leaveType} leave request for ${totalDays} day(s) has been submitted and is pending approval.`,
        type:      "leave",
        priority:  "medium",
        actionUrl: "/leaves",
      });
    }

    createAuditLog({ req, action: "CREATE", entityType: "Leave", entityId: leave._id,
      description: `Leave applied: ${leaveType} (${totalDays} days) for ${getEmployeeName(leave.employee)}` });

    res.status(201).json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/leaves ──────────────────────────────────────────────────────────
const getLeaves = async (req, res) => {
  try {
    const { status, leaveType, employee: empFilter, month, year, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status)    query.status    = status;
    if (leaveType) query.leaveType = leaveType;
    if (empFilter) query.employee  = empFilter;
    if (year) {
      const y  = Number(year);
      const m  = month ? Number(month) - 1 : 0;
      const mE = month ? Number(month) - 1 : 11;
      query.startDate = {
        $gte: new Date(y, m, 1),
        $lte: new Date(y, mE + 1, 0),
      };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate("employee", "firstName lastName employeeId email department designation")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: leaves.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      leaves,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/leaves/:id ──────────────────────────────────────────────────────
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("employee", "firstName lastName employeeId email department designation")
      .populate("reviewedBy", "name email");

    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });

    if (req.user.role === "employee" && leave.employee?.email !== req.user.email) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/leaves/:id/status ───────────────────────────────────────────────
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'." });
    }

    const leave = await Leave.findById(req.params.id).populate("employee", "email");
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending leaves can be approved/rejected. Current status: ${leave.status}`,
      });
    }

    if (status === "approved") {
      const year    = new Date(leave.startDate).getFullYear();
      const balance = await getOrCreateBalance(leave.employee._id, year);
      const field   = usedField[leave.leaveType];

      if (leave.leaveType !== "unpaid") {
        const available = balance[leave.leaveType] - balance[field];
        if (available < leave.totalDays) {
          return res.status(400).json({
            success: false,
            message: `Insufficient balance to approve. Available: ${available} day(s).`,
          });
        }
      }
      // Increment used days
      balance[field] = (balance[field] || 0) + leave.totalDays;
      await balance.save();
    }

    leave.status       = status;
    leave.adminComment = adminComment || "";
    leave.reviewedBy   = req.user._id;
    leave.reviewedAt   = new Date();
    leave.updatedBy    = req.user._id;
    await leave.save();

    await leave.populate("employee", "firstName lastName employeeId email department");

    // Notify employee of approval / rejection
    if (leave.employee?.email) {
      const template = status === "approved" ? leaveApprovedTemplate : leaveRejectedTemplate;
      sendEmail({
        to:      leave.employee.email,
        subject: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
        html:    template({
          employeeName: getEmployeeName(leave.employee),
          leaveType:    leave.leaveType,
          startDate:    formatDate(leave.startDate),
          endDate:      formatDate(leave.endDate),
          comment:      adminComment || "",
        }),
      });

      const empUser = await User.findOne({ email: leave.employee.email }).select("_id").lean();
      if (empUser) {
        createNotification({
          recipient: empUser._id,
          sender:    req.user._id,
          title:     `Leave ${status === "approved" ? "Approved" : "Rejected"}`,
          message:   `Your ${leave.leaveType} leave request (${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}) has been ${status}.${adminComment ? ` Comment: ${adminComment}` : ""}`,
          type:      "leave",
          priority:  status === "rejected" ? "high" : "medium",
          actionUrl: "/leaves",
        });
      }
    }

    createAuditLog({ req, action: status === "approved" ? "APPROVE" : "REJECT", entityType: "Leave",
      entityId: leave._id,
      description: `Leave ${status} for ${getEmployeeName(leave.employee)}: ${leave.leaveType} (${leave.totalDays} days)` });

    res.json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/leaves/:id/cancel ───────────────────────────────────────────────
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("employee", "email firstName lastName");
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });

    // Employee can only cancel their own pending leaves
    if (req.user.role === "employee") {
      if (leave.employee?.email !== req.user.email) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (leave.status !== "pending") {
        return res.status(400).json({ success: false, message: "Employees can only cancel pending leave requests." });
      }
    } else {
      // Admin/HR can cancel pending or approved
      if (!["pending", "approved"].includes(leave.status)) {
        return res.status(400).json({
          success: false,
          message: "Only pending or approved leaves can be cancelled.",
        });
      }
    }

    // Reverse balance if cancelling an approved leave
    if (leave.status === "approved" && leave.leaveType !== "unpaid") {
      const year    = new Date(leave.startDate).getFullYear();
      const balance = await LeaveBalance.findOne({ employee: leave.employee._id, year });
      if (balance) {
        const field = usedField[leave.leaveType];
        balance[field] = Math.max(0, (balance[field] || 0) - leave.totalDays);
        await balance.save();
      }
    }

    leave.status    = "cancelled";
    leave.updatedBy = req.user._id;
    await leave.save();

    res.json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/leaves/my ───────────────────────────────────────────────────────
const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const { status, leaveType, year, page = 1, limit = 20 } = req.query;
    const query = { employee: employee._id };

    if (status)    query.status    = status;
    if (leaveType) query.leaveType = leaveType;
    if (year) {
      const y = Number(year);
      query.startDate = { $gte: new Date(y, 0, 1), $lte: new Date(y, 11, 31) };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: leaves.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      leaves,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/leaves/balance/:employeeId ─────────────────────────────────────
const getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    // Employee can only see own balance
    if (req.user.role === "employee") {
      const emp = await Employee.findOne({ email: req.user.email });
      if (!emp || String(emp._id) !== String(employeeId)) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
    }

    const balance = await getOrCreateBalance(employeeId, year);
    res.json({ success: true, balance: withAvailable(balance) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/leaves/my/balance ───────────────────────────────────────────────
const getMyLeaveBalance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const year    = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const balance = await getOrCreateBalance(employee._id, year);
    res.json({ success: true, balance: withAvailable(balance) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/leaves/balance/:employeeId ─────────────────────────────────────
const updateLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    const allowed = ["casual", "sick", "earned", "maternity", "paternity", "unpaid"];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        const val = Number(req.body[field]);
        if (val < 0) {
          return res.status(400).json({ success: false, message: `${field} cannot be negative.` });
        }
        updates[field] = val;
      }
    }

    let balance = await LeaveBalance.findOne({ employee: employeeId, year });
    if (!balance) {
      balance = await LeaveBalance.create({ employee: employeeId, year, ...updates });
    } else {
      Object.assign(balance, updates);
      await balance.save();
    }

    res.json({ success: true, balance: withAvailable(balance) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/leaves/stats ────────────────────────────────────────────────────
const getLeaveStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected, cancelled] = await Promise.all([
      Leave.countDocuments(),
      Leave.countDocuments({ status: "pending"   }),
      Leave.countDocuments({ status: "approved"  }),
      Leave.countDocuments({ status: "rejected"  }),
      Leave.countDocuments({ status: "cancelled" }),
    ]);

    const leaveTypeCounts = await Leave.aggregate([
      { $group: { _id: "$leaveType", count: { $sum: 1 } } },
    ]);

    const monthlyLeaveCounts = await Leave.aggregate([
      {
        $group: {
          _id: { month: { $month: "$startDate" }, year: { $year: "$startDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      stats: {
        totalLeaves: total,
        pendingLeaves: pending,
        approvedLeaves: approved,
        rejectedLeaves: rejected,
        cancelledLeaves: cancelled,
        leaveTypeCounts,
        monthlyLeaveCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  getLeaveById,
  updateLeaveStatus,
  cancelLeave,
  getMyLeaves,
  getLeaveBalance,
  getMyLeaveBalance,
  updateLeaveBalance,
  getLeaveStats,
};
