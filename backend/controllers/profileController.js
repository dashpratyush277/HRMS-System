const bcrypt     = require("bcryptjs");
const User       = require("../models/User");
const Employee   = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave      = require("../models/Leave");
const Payroll    = require("../models/Payroll");
const Goal       = require("../models/Goal");
const Notification = require("../models/Notification");
const { deleteLocalFile } = require("../utils/fileUtils");
const createAuditLog      = require("../utils/auditLogger");
const sendEmail           = require("../utils/sendEmail");
const { passwordChangedTemplate } = require("../utils/emailTemplates");

// ── GET /api/profile/me ──────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpire").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Linked employee record (User and Employee share the same email)
    const employee = await Employee.findOne({ email: user.email }).lean();

    res.json({ success: true, user, employee: employee || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/profile/me ──────────────────────────────────────────────────────
// Safe fields only — role/email/salary/status/department/designation are all blocked
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth, gender } = req.body;

    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Apply allowed User updates
    if (name       !== undefined) user.name  = name.trim();
    if (phone      !== undefined) user.phone = phone || null;
    await user.save();

    // Mirror safe contact fields to linked Employee record
    const employee = await Employee.findOne({ email: user.email });
    if (employee) {
      if (phone       !== undefined) employee.phone       = phone || employee.phone;
      if (address     !== undefined) employee.address     = address || "";
      if (dateOfBirth !== undefined) employee.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : employee.dateOfBirth;
      if (gender      !== undefined) employee.gender      = gender || employee.gender;
      employee.updatedBy = req.user._id;
      await employee.save();
    }

    createAuditLog({ req, action: "UPDATE", entityType: "User", entityId: user._id,
      description: `User updated own profile: ${user.email}` });

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser, employee: employee || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/profile/change-password ────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Must re-fetch user WITH password for bcrypt compare
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Fire-and-forget notification email
    sendEmail({
      to:      user.email,
      subject: "HRMS — Your Password Has Been Changed",
      html:    passwordChangedTemplate({
        name:     user.name,
        loginUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
      }),
    });

    createAuditLog({ req, action: "UPDATE", entityType: "Auth", entityId: user._id,
      description: `Password changed by user: ${user.email}` });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/profile/summary ─────────────────────────────────────────────────
const getMyProfileSummary = async (req, res) => {
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const user     = req.user;
    const employee = await Employee.findOne({ email: user.email }).select("_id").lean();

    const unreadNotifications = await Notification.countDocuments({ recipient: user._id, isRead: false });

    if (!employee) {
      // Admin/HR without an Employee record — return role-level stats only
      const [pendingLeaves, openJobs] = await Promise.all([
        Leave.countDocuments({ status: "pending" }),
        require("../models/JobOpening").countDocuments({ status: "open" }),
      ]);
      return res.json({
        success: true,
        data: {
          role: user.role,
          pendingLeaveApprovals: pendingLeaves,
          openJobs,
          unreadNotifications,
        },
      });
    }

    const empId = employee._id;

    const [attendanceAgg, leaveCounts, latestPayroll, goalCounts] = await Promise.all([
      // Current-month attendance breakdown
      Attendance.aggregate([
        { $match: { employee: empId, month, year } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // Leave counts by status (current year)
      Leave.aggregate([
        {
          $match: {
            employee: empId,
            startDate: { $gte: new Date(year, 0, 1) },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // Latest payroll
      Payroll.findOne({ employee: empId }).sort({ year: -1, month: -1 }).select("month year netSalary").lean(),
      // Goal counts
      Goal.aggregate([
        { $match: { employee: empId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const attMap   = Object.fromEntries(attendanceAgg.map((a) => [a._id, a.count]));
    const leaveMap = Object.fromEntries(leaveCounts.map((l) => [l._id, l.count]));
    const goalMap  = Object.fromEntries(goalCounts.map((g) => [g._id, g.count]));

    res.json({
      success: true,
      data: {
        role: user.role,
        attendance: {
          present:  attMap["present"]  || 0,
          absent:   attMap["absent"]   || 0,
          halfDay:  attMap["half-day"] || 0,
          leave:    attMap["leave"]    || 0,
          total:    attendanceAgg.reduce((s, a) => s + a.count, 0),
        },
        leaves: {
          pending:  leaveMap["pending"]  || 0,
          approved: leaveMap["approved"] || 0,
          rejected: leaveMap["rejected"] || 0,
        },
        payroll: latestPayroll
          ? { month: latestPayroll.month, year: latestPayroll.year, netSalary: latestPayroll.netSalary }
          : null,
        goals: {
          active:    (goalMap["not-started"] || 0) + (goalMap["in-progress"] || 0),
          completed: goalMap["completed"] || 0,
          overdue:   goalMap["overdue"]   || 0,
        },
        unreadNotifications,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/profile/profile-picture ────────────────────────────────────────
// Delegates to same logic as /api/auth/profile-picture but lives under /profile
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "Please upload an image file" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.profileImage) deleteLocalFile(user.profileImage);

    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, changePassword, getMyProfileSummary, updateProfilePicture };
