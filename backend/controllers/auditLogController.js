const AuditLog = require("../models/AuditLog");

// GET /api/audit-logs?page=1&limit=25&action=&entityType=&actor=&from=&to=
const getAuditLogs = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.action)     filter.action     = req.query.action;
    if (req.query.entityType) filter.entityType = req.query.entityType;
    if (req.query.actor)      filter.actor      = req.query.actor;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to)   filter.createdAt.$lte = new Date(req.query.to);
    }
    if (req.query.search) {
      filter.description = { $regex: req.query.search, $options: "i" };
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/audit-logs/stats
const getAuditStats = async (req, res) => {
  try {
    const [actionCounts, entityCounts, recentActivity] = await Promise.all([
      AuditLog.aggregate([{ $group: { _id: "$action", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([{ $group: { _id: "$entityType", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.find().sort({ createdAt: -1 }).limit(5)
        .populate("actor", "name role").lean(),
    ]);

    res.json({
      success: true,
      data: {
        actionCounts:   actionCounts.map((a) => ({ action: a._id, count: a.count })),
        entityCounts:   entityCounts.map((e) => ({ entityType: e._id, count: e.count })),
        recentActivity,
        totalLogs: await AuditLog.estimatedDocumentCount(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/audit-logs/:id
const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate("actor", "name email role").lean();
    if (!log) return res.status(404).json({ success: false, message: "Audit log not found" });
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAuditLogs, getAuditStats, getAuditLogById };
