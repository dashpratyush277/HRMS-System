const Employee = require("../models/Employee");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/employees
// @access  admin, hr
// ─────────────────────────────────────────────────────────────────────────────
const createEmployee = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone,
      employeeId, department, designation, joiningDate,
      basicSalary,
    } = req.body;

    // Required field validation
    if (!firstName?.trim()) return res.status(400).json({ success: false, message: "First name is required" });
    if (!lastName?.trim())  return res.status(400).json({ success: false, message: "Last name is required" });
    if (!email)             return res.status(400).json({ success: false, message: "Email is required" });
    if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "Please provide a valid email" });
    if (!phone)             return res.status(400).json({ success: false, message: "Phone is required" });
    if (!employeeId?.trim()) return res.status(400).json({ success: false, message: "Employee ID is required" });
    if (!department)        return res.status(400).json({ success: false, message: "Department is required" });
    if (!designation)       return res.status(400).json({ success: false, message: "Designation is required" });
    if (!joiningDate)       return res.status(400).json({ success: false, message: "Joining date is required" });
    if (basicSalary !== undefined && Number(basicSalary) < 0)
      return res.status(400).json({ success: false, message: "Salary cannot be negative" });

    // Uniqueness checks
    const emailTaken = await Employee.findOne({ email: email.toLowerCase() });
    if (emailTaken) return res.status(400).json({ success: false, message: "An employee with this email already exists" });

    const idTaken = await Employee.findOne({ employeeId: employeeId.trim() });
    if (idTaken) return res.status(400).json({ success: false, message: "An employee with this ID already exists" });

    const employee = await Employee.create({
      ...req.body,
      firstName:  firstName.trim(),
      lastName:   lastName.trim(),
      email:      email.toLowerCase(),
      employeeId: employeeId.trim(),
      basicSalary: basicSalary ? Number(basicSalary) : 0,
      createdBy:  req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("Create Employee Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/employees/stats
// @access  admin, hr
// NOTE: This route must be registered BEFORE /:id in the router
// ─────────────────────────────────────────────────────────────────────────────
const getEmployeeStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      terminatedEmployees,
      fullTimeEmployees,
      interns,
      departments,
      departmentBreakdown,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "active" }),
      Employee.countDocuments({ status: "inactive" }),
      Employee.countDocuments({ status: "terminated" }),
      Employee.countDocuments({ employmentType: "full-time" }),
      Employee.countDocuments({ employmentType: "intern" }),
      Employee.distinct("department"),
      Employee.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        terminatedEmployees,
        fullTimeEmployees,
        interns,
        departments: departments.length,
        departmentBreakdown,
      },
    });
  } catch (error) {
    console.error("Get Stats Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/employees
// @access  admin, hr
// Query params: search, department, status, employmentType, page, limit
// ─────────────────────────────────────────────────────────────────────────────
const getEmployees = async (req, res) => {
  try {
    const {
      search = "",
      department = "",
      status = "",
      employmentType = "",
      page  = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Full-text-style search across key fields
    if (search) {
      query.$or = [
        { firstName:   { $regex: search, $options: "i" } },
        { lastName:    { $regex: search, $options: "i" } },
        { email:       { $regex: search, $options: "i" } },
        { employeeId:  { $regex: search, $options: "i" } },
        { department:  { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    if (department)    query.department    = { $regex: department, $options: "i" };
    if (status)        query.status        = status;
    if (employmentType) query.employmentType = employmentType;

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [employees, total] = await Promise.all([
      Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Employee.countDocuments(query),
    ]);

    res.json({
      success: true,
      count:   employees.length,
      total,
      page:    pageNum,
      pages:   Math.ceil(total / limitNum),
      employees,
    });
  } catch (error) {
    console.error("Get Employees Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/employees/:id
// @access  admin, hr
// ─────────────────────────────────────────────────────────────────────────────
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, employee });
  } catch (error) {
    console.error("Get Employee Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/employees/:id
// @access  admin, hr
// ─────────────────────────────────────────────────────────────────────────────
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const { email, employeeId, basicSalary } = req.body;

    // Email uniqueness (only if changing it)
    if (email && email.toLowerCase() !== employee.email) {
      if (!isValidEmail(email))
        return res.status(400).json({ success: false, message: "Please provide a valid email" });
      const taken = await Employee.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
      if (taken) return res.status(400).json({ success: false, message: "An employee with this email already exists" });
    }

    // Employee ID uniqueness (only if changing it)
    if (employeeId && employeeId !== employee.employeeId) {
      const taken = await Employee.findOne({ employeeId, _id: { $ne: req.params.id } });
      if (taken) return res.status(400).json({ success: false, message: "An employee with this ID already exists" });
    }

    if (basicSalary !== undefined && Number(basicSalary) < 0)
      return res.status(400).json({ success: false, message: "Salary cannot be negative" });

    // Build sanitised update — strip immutable system fields from the body
    const { createdBy: _cb, _id: _id2, __v, ...updateData } = req.body;

    if (updateData.email)      updateData.email      = updateData.email.toLowerCase();
    if (updateData.firstName)  updateData.firstName  = updateData.firstName.trim();
    if (updateData.lastName)   updateData.lastName   = updateData.lastName.trim();
    if (updateData.employeeId) updateData.employeeId = updateData.employeeId.trim();
    if (updateData.basicSalary !== undefined) updateData.basicSalary = Number(updateData.basicSalary);
    updateData.updatedBy = req.user._id;

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: "Employee updated successfully", employee: updated });
  } catch (error) {
    console.error("Update Employee Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/employees/:id
// @access  admin only
// ─────────────────────────────────────────────────────────────────────────────
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    await employee.deleteOne();
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete Employee Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeStats,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
