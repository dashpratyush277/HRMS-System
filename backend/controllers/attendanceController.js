const Attendance = require("../models/Attendance");
const Employee   = require("../models/Employee");

// Normalize a date value to midnight UTC Date object
const toMidnightUTC = (val) => {
  const d = new Date(val);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// GET /api/attendance/stats
const getAttendanceStats = async (req, res) => {
  try {
    const dateParam = req.query.date ? toMidnightUTC(req.query.date) : toMidnightUTC(new Date());

    const [present, absent, halfDay, onLeave, holiday, total] = await Promise.all([
      Attendance.countDocuments({ date: dateParam, status: "present" }),
      Attendance.countDocuments({ date: dateParam, status: "absent" }),
      Attendance.countDocuments({ date: dateParam, status: "half-day" }),
      Attendance.countDocuments({ date: dateParam, status: "leave" }),
      Attendance.countDocuments({ date: dateParam, status: "holiday" }),
      Attendance.countDocuments({ date: dateParam }),
    ]);

    res.json({
      success: true,
      stats: { present, absent, halfDay, onLeave, holiday, total, date: dateParam },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/my  — employee fetches their own records
const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee record not found for your account." });
    }

    const { month, year, page = 1, limit = 31 } = req.query;
    const query = { employee: employee._id };
    if (month) query.month = Number(month);
    if (year)  query.year  = Number(year);

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Monthly summary
    const summary = { present: 0, absent: 0, "half-day": 0, leave: 0, holiday: 0 };
    records.forEach((r) => { if (summary[r.status] !== undefined) summary[r.status]++; });

    res.json({
      success: true,
      records,
      summary,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/attendance/bulk
const bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body; // [{ employeeId, date, status, checkIn, checkOut, remarks }]
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: "No records provided." });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const rec of records) {
      try {
        const date = toMidnightUTC(rec.date);
        await Attendance.findOneAndUpdate(
          { employee: rec.employeeId, date },
          {
            employee: rec.employeeId,
            date,
            status: rec.status,
            checkIn:  rec.checkIn  || "",
            checkOut: rec.checkOut || "",
            remarks:  rec.remarks  || "",
            markedBy: req.user._id,
            updatedBy: req.user._id,
          },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        results.success++;
      } catch (e) {
        results.failed++;
        results.errors.push({ employeeId: rec.employeeId, error: e.message });
      }
    }

    res.status(201).json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/employee/:employeeId
const getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 31 } = req.query;
    const query = { employee: req.params.employeeId };
    if (month) query.month = Number(month);
    if (year)  query.year  = Number(year);

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate("employee", "firstName lastName employeeId")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      records,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance
const getAttendance = async (req, res) => {
  try {
    const { date, month, year, status, department, page = 1, limit = 50 } = req.query;
    const query = {};

    if (date)   query.date   = toMidnightUTC(date);
    if (month)  query.month  = Number(month);
    if (year)   query.year   = Number(year);
    if (status) query.status = status;

    // Department filter: find employee IDs in that department first
    if (department) {
      const empIds = await Employee.find({ department }, "_id");
      query.employee = { $in: empIds.map((e) => e._id) };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate("employee", "firstName lastName employeeId department designation")
      .sort({ date: -1, "employee.firstName": 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      records,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/attendance
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, remarks } = req.body;
    const normalizedDate = toMidnightUTC(date);

    const existing = await Attendance.findOne({ employee: employeeId, date: normalizedDate });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this employee on this date.",
      });
    }

    const record = await Attendance.create({
      employee: employeeId,
      date: normalizedDate,
      status,
      checkIn:  checkIn  || "",
      checkOut: checkOut || "",
      remarks:  remarks  || "",
      markedBy:  req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/:id
const getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id).populate(
      "employee",
      "firstName lastName employeeId department designation"
    );
    if (!record) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/attendance/:id
const updateAttendance = async (req, res) => {
  try {
    const { status, checkIn, checkOut, remarks } = req.body;
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, checkIn, checkOut, remarks, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate("employee", "firstName lastName employeeId");

    if (!record) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/attendance/:id
const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }
    res.json({ success: true, message: "Attendance record deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAttendanceStats,
  getMyAttendance,
  bulkMarkAttendance,
  getEmployeeAttendance,
  getAttendance,
  markAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};
