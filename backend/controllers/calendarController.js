const Attendance = require("../models/Attendance");
const Leave      = require("../models/Leave");
const Employee   = require("../models/Employee");

const buildDateRange = (year, month) => {
  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) || (new Date().getMonth() + 1);
  return {
    start: new Date(y, m - 1, 1),
    end:   new Date(y, m, 0, 23, 59, 59),
    year:  y,
    month: m,
  };
};

const toCalendarEvent = (type, record) => {
  if (type === "attendance") {
    return {
      id:     record._id,
      type:   "attendance",
      date:   record.date,
      status: record.status,
      label:  record.status,
      checkIn:  record.checkIn  || null,
      checkOut: record.checkOut || null,
    };
  }
  return {
    id:        record._id,
    type:      "leave",
    startDate: record.startDate,
    endDate:   record.endDate,
    status:    record.status,
    leaveType: record.leaveType,
    label:     `${record.leaveType} Leave`,
    totalDays: record.totalDays,
  };
};

// GET /api/calendar/my?year=&month=
const getMyCalendar = async (req, res) => {
  try {
    const { start, end, year, month } = buildDateRange(req.query.year, req.query.month);

    const employee = await Employee.findOne({ email: req.user.email }).select("_id firstName lastName").lean();
    if (!employee) return res.status(404).json({ success: false, message: "Employee record not found" });

    const [attendance, leaves] = await Promise.all([
      Attendance.find({ employee: employee._id, date: { $gte: start, $lte: end } })
        .sort({ date: 1 }).lean(),
      Leave.find({
        employee: employee._id,
        startDate: { $lte: end },
        endDate:   { $gte: start },
      }).sort({ startDate: 1 }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        year, month,
        employee: { id: employee._id, name: `${employee.firstName} ${employee.lastName}` },
        events: [
          ...attendance.map((a) => toCalendarEvent("attendance", a)),
          ...leaves.map((l) => toCalendarEvent("leave", l)),
        ],
        summary: {
          present:  attendance.filter((a) => a.status === "present").length,
          absent:   attendance.filter((a) => a.status === "absent").length,
          late:     attendance.filter((a) => a.status === "late").length,
          halfDay:  attendance.filter((a) => a.status === "half_day").length,
          leaves:   leaves.filter((l) => l.status === "approved").length,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/calendar/team?year=&month=&department=
const getTeamCalendar = async (req, res) => {
  try {
    const { start, end, year, month } = buildDateRange(req.query.year, req.query.month);

    const empFilter = {};
    if (req.query.department) empFilter.department = req.query.department;

    const employees = await Employee.find(empFilter)
      .select("_id firstName lastName employeeId department")
      .populate("department", "name")
      .lean();

    const empIds = employees.map((e) => e._id);

    const [attendance, leaves] = await Promise.all([
      Attendance.find({ employee: { $in: empIds }, date: { $gte: start, $lte: end } })
        .populate("employee", "firstName lastName employeeId")
        .sort({ date: 1 }).lean(),
      Leave.find({
        employee:  { $in: empIds },
        startDate: { $lte: end },
        endDate:   { $gte: start },
        status:    "approved",
      }).populate("employee", "firstName lastName employeeId")
        .sort({ startDate: 1 }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        year, month,
        employees: employees.map((e) => ({
          id:         e._id,
          name:       `${e.firstName} ${e.lastName}`,
          employeeId: e.employeeId,
          department: e.department?.name || "",
        })),
        attendance: attendance.map((a) => ({
          ...toCalendarEvent("attendance", a),
          employeeId: a.employee?._id,
          employeeName: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : "",
        })),
        leaves: leaves.map((l) => ({
          ...toCalendarEvent("leave", l),
          employeeId: l.employee?._id,
          employeeName: l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : "",
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyCalendar, getTeamCalendar };
