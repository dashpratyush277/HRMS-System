const Goal              = require("../models/Goal");
const PerformanceReview = require("../models/PerformanceReview");
const Employee          = require("../models/Employee");

// ── GOAL FUNCTIONS ─────────────────────────────────────────────────────────────

// POST /api/performance/goals
const createGoal = async (req, res) => {
  try {
    const { employee: empId, title, startDate, dueDate, progress, weight, score } = req.body;

    if (!empId)     return res.status(400).json({ success: false, message: "Employee is required." });
    if (!title)     return res.status(400).json({ success: false, message: "Title is required." });
    if (!startDate) return res.status(400).json({ success: false, message: "Start date is required." });
    if (!dueDate)   return res.status(400).json({ success: false, message: "Due date is required." });
    if (new Date(dueDate) < new Date(startDate))
      return res.status(400).json({ success: false, message: "Due date cannot be before start date." });
    if (progress !== undefined && (Number(progress) < 0 || Number(progress) > 100))
      return res.status(400).json({ success: false, message: "Progress must be between 0 and 100." });
    if (weight !== undefined && Number(weight) < 0)
      return res.status(400).json({ success: false, message: "Weight cannot be negative." });
    if (score !== undefined && score !== null && (Number(score) < 0 || Number(score) > 10))
      return res.status(400).json({ success: false, message: "Score must be between 0 and 10." });

    const employee = await Employee.findById(empId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

    const goal = await Goal.create({ ...req.body, createdBy: req.user._id, updatedBy: req.user._id });
    await goal.populate("employee", "firstName lastName employeeId department");
    res.status(201).json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/performance/goals
const getGoals = async (req, res) => {
  try {
    const { search = "", employee: empFilter, status, category, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (empFilter) query.employee = empFilter;
    if (status)    query.status   = status;
    if (category)  query.category = category;
    if (priority)  query.priority = priority;

    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ title: re }, { description: re }];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Goal.countDocuments(query);
    const goals = await Goal.find(query)
      .populate("employee", "firstName lastName employeeId department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/performance/goals/:id
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate("employee", "firstName lastName employeeId email department designation");

    if (!goal) return res.status(404).json({ success: false, message: "Goal not found." });

    if (req.user.role === "employee" && goal.employee?.email !== req.user.email)
      return res.status(403).json({ success: false, message: "Access denied." });

    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/performance/goals/:id
const updateGoal = async (req, res) => {
  try {
    const { dueDate, startDate, progress, weight, score } = req.body;
    if (dueDate && startDate && new Date(dueDate) < new Date(startDate))
      return res.status(400).json({ success: false, message: "Due date cannot be before start date." });
    if (progress !== undefined && (Number(progress) < 0 || Number(progress) > 100))
      return res.status(400).json({ success: false, message: "Progress must be 0–100." });
    if (weight !== undefined && Number(weight) < 0)
      return res.status(400).json({ success: false, message: "Weight cannot be negative." });
    if (score !== undefined && score !== null && (Number(score) < 0 || Number(score) > 10))
      return res.status(400).json({ success: false, message: "Score must be 0–10." });

    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate("employee", "firstName lastName employeeId department");

    if (!goal) return res.status(404).json({ success: false, message: "Goal not found." });
    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/performance/goals/:id/progress
const updateGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).populate("employee", "email firstName lastName");
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found." });

    if (req.user.role === "employee" && goal.employee?.email !== req.user.email)
      return res.status(403).json({ success: false, message: "Access denied." });

    const { progress, employeeComment, managerComment, score, status } = req.body;

    if (progress !== undefined) {
      if (Number(progress) < 0 || Number(progress) > 100)
        return res.status(400).json({ success: false, message: "Progress must be 0–100." });
      goal.progress = Number(progress);
    }
    if (employeeComment !== undefined) goal.employeeComment = employeeComment;

    // Admin/HR can set additional fields
    if (req.user.role !== "employee") {
      if (managerComment !== undefined) goal.managerComment = managerComment;
      if (score !== undefined && score !== null) {
        if (Number(score) < 0 || Number(score) > 10)
          return res.status(400).json({ success: false, message: "Score must be 0–10." });
        goal.score = Number(score);
      }
      if (status && status !== "cancelled") {
        // allow manual override only for cancelled
      }
      if (status === "cancelled") goal.status = "cancelled";
    }

    goal.updatedBy = req.user._id;
    await goal.save(); // triggers pre-save for status derivation
    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/performance/goals/:id  (admin only)
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found." });

    const linkedToApproved = await PerformanceReview.findOne({ goals: goal._id, status: "approved" });
    if (linkedToApproved)
      return res.status(400).json({ success: false, message: "Cannot delete a goal linked to an approved review." });

    await goal.deleteOne();
    res.json({ success: true, message: "Goal deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/performance/my-goals
const getMyGoals = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const { status, category, priority, page = 1, limit = 20 } = req.query;
    const query = { employee: employee._id };
    if (status)   query.status   = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Goal.countDocuments(query);
    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── REVIEW FUNCTIONS ───────────────────────────────────────────────────────────

// POST /api/performance/reviews
const createReview = async (req, res) => {
  try {
    const { employee: empId, reviewPeriod, startDate, endDate, goals: goalIds } = req.body;

    if (!empId)        return res.status(400).json({ success: false, message: "Employee is required." });
    if (!reviewPeriod) return res.status(400).json({ success: false, message: "Review period is required." });
    if (!startDate)    return res.status(400).json({ success: false, message: "Start date is required." });
    if (!endDate)      return res.status(400).json({ success: false, message: "End date is required." });
    if (new Date(endDate) < new Date(startDate))
      return res.status(400).json({ success: false, message: "End date cannot be before start date." });

    const employee = await Employee.findById(empId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

    const ratingFields = ["productivityRating","qualityRating","teamworkRating","communicationRating","leadershipRating"];
    for (const f of ratingFields) {
      if (req.body[f] !== undefined && (Number(req.body[f]) < 1 || Number(req.body[f]) > 5))
        return res.status(400).json({ success: false, message: `${f} must be between 1 and 5.` });
    }

    // Validate goals belong to this employee
    if (goalIds?.length) {
      const goals = await Goal.find({ _id: { $in: goalIds }, employee: empId });
      if (goals.length !== goalIds.length)
        return res.status(400).json({ success: false, message: "One or more goals do not belong to this employee." });
    }

    const review = await PerformanceReview.create({
      ...req.body,
      reviewedBy: req.user._id,
      createdBy:  req.user._id,
      updatedBy:  req.user._id,
    });

    await review.populate([
      { path: "employee", select: "firstName lastName employeeId department designation" },
      { path: "goals",    select: "title status progress" },
    ]);

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/performance/reviews
const getReviews = async (req, res) => {
  try {
    const { employee: empFilter, status, reviewPeriod, page = 1, limit = 20 } = req.query;
    const query = {};
    if (empFilter)    query.employee     = empFilter;
    if (status)       query.status       = status;
    if (reviewPeriod) query.reviewPeriod = reviewPeriod;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await PerformanceReview.countDocuments(query);
    const reviews = await PerformanceReview.find(query)
      .populate("employee", "firstName lastName employeeId department")
      .populate("goals",    "title status progress")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/performance/reviews/:id
const getReviewById = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id)
      .populate("employee",   "firstName lastName employeeId email department designation")
      .populate("goals",      "title description status progress score")
      .populate("reviewedBy", "name email")
      .populate("approvedBy", "name email");

    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    if (req.user.role === "employee" && review.employee?.email !== req.user.email)
      return res.status(403).json({ success: false, message: "Access denied." });

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/performance/reviews/:id
const updateReview = async (req, res) => {
  try {
    const existing = await PerformanceReview.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Review not found." });
    if (existing.status === "approved")
      return res.status(400).json({ success: false, message: "Cannot update an approved review." });

    const ratingFields = ["productivityRating","qualityRating","teamworkRating","communicationRating","leadershipRating"];
    for (const f of ratingFields) {
      if (req.body[f] !== undefined && (Number(req.body[f]) < 1 || Number(req.body[f]) > 5))
        return res.status(400).json({ success: false, message: `${f} must be between 1 and 5.` });
    }

    const review = await PerformanceReview.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate("employee", "firstName lastName employeeId department");

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/performance/reviews/:id/status
const updateReviewStatus = async (req, res) => {
  try {
    const { status, finalComments } = req.body;
    if (!["draft","submitted","approved","rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });

    const updates = { status, updatedBy: req.user._id };
    if (finalComments !== undefined) updates.finalComments = finalComments;
    if (status === "approved") { updates.approvedBy = req.user._id; updates.approvedAt = new Date(); }

    const review = await PerformanceReview.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("employee", "firstName lastName employeeId");

    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/performance/reviews/:id  (admin only)
const deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.status === "approved")
      return res.status(400).json({ success: false, message: "Cannot delete an approved review." });

    await review.deleteOne();
    res.json({ success: true, message: "Review deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/performance/my-reviews
const getMyReviews = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const { status, reviewPeriod, page = 1, limit = 20 } = req.query;
    const query = { employee: employee._id };
    if (status)       query.status       = status;
    if (reviewPeriod) query.reviewPeriod = reviewPeriod;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await PerformanceReview.countDocuments(query);
    const reviews = await PerformanceReview.find(query)
      .populate("goals",      "title status progress")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/performance/stats
const getPerformanceStats = async (req, res) => {
  try {
    const [totalGoals, completedGoals, overdueGoals, inProgressGoals,
           totalReviews, draftReviews, approvedReviews] = await Promise.all([
      Goal.countDocuments(),
      Goal.countDocuments({ status: "completed"   }),
      Goal.countDocuments({ status: "overdue"     }),
      Goal.countDocuments({ status: "in-progress" }),
      PerformanceReview.countDocuments(),
      PerformanceReview.countDocuments({ status: "draft"    }),
      PerformanceReview.countDocuments({ status: "approved" }),
    ]);

    const ratingAgg = await PerformanceReview.aggregate([
      { $match: { overallRating: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$overallRating" } } },
    ]);
    const averageOverallRating = ratingAgg[0]?.avg ? parseFloat(ratingAgg[0].avg.toFixed(2)) : 0;

    const goalsByCategory = await Goal.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const reviewsByRating = await PerformanceReview.aggregate([
      { $match: { overallRating: { $gt: 0 } } },
      { $group: { _id: { $floor: "$overallRating" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalGoals, completedGoals, overdueGoals, inProgressGoals,
        totalReviews, draftReviews, approvedReviews,
        averageOverallRating, goalsByCategory, reviewsByRating,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createGoal, getGoals, getGoalById, updateGoal, updateGoalProgress, deleteGoal, getMyGoals,
  createReview, getReviews, getReviewById, updateReview, updateReviewStatus, deleteReview, getMyReviews,
  getPerformanceStats,
};
