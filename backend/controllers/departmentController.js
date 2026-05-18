const Department = require("../models/Department");
const Employee   = require("../models/Employee");

// GET /api/departments/stats
const getDepartmentStats = async (req, res) => {
  try {
    const [total, active, inactive] = await Promise.all([
      Department.countDocuments(),
      Department.countDocuments({ status: "active" }),
      Department.countDocuments({ status: "inactive" }),
    ]);
    res.json({ success: true, stats: { total, active, inactive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/departments
const getDepartments = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ name: re }, { code: re }, { location: re }];
    }
    if (status) query.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Department.countDocuments(query);
    const departments = await Department.find(query)
      .populate("headOfDepartment", "firstName lastName designation")
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      departments,
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

// GET /api/departments/:id
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "headOfDepartment",
      "firstName lastName designation employeeId"
    );
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    // Count employees in this department
    const employeeCount = await Employee.countDocuments({ department: department.name });

    res.json({ success: true, department: { ...department.toJSON(), employeeCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/departments
const createDepartment = async (req, res) => {
  try {
    const { name, code, description, location, headOfDepartment, status } = req.body;
    const department = await Department.create({
      name,
      code: code?.toUpperCase(),
      description,
      location,
      headOfDepartment: headOfDepartment || null,
      status: status || "active",
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.status(201).json({ success: true, department });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A department with that ${field} already exists.`,
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/departments/:id
const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, location, headOfDepartment, status } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code: code?.toUpperCase(),
        description,
        location,
        headOfDepartment: headOfDepartment || null,
        status,
        updatedBy: req.user._id,
      },
      { new: true, runValidators: true }
    ).populate("headOfDepartment", "firstName lastName designation");

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.json({ success: true, department });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A department with that ${field} already exists.`,
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/departments/:id  (admin only)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const employeeCount = await Employee.countDocuments({ department: department.name });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. It has ${employeeCount} employee(s) assigned to it.`,
      });
    }

    await department.deleteOne();
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDepartmentStats,
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
