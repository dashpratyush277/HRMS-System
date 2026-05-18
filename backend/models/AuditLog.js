const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorName: { type: String, default: "System" },
    actorRole: { type: String, default: "system" },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT",
        "LOGIN", "LOGOUT", "EXPORT", "UPLOAD", "STATUS_CHANGE",
        "CANCEL", "BULK_CREATE",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: [
        "User", "Employee", "Department", "Attendance", "Leave",
        "Payroll", "PerformanceGoal", "PerformanceReview",
        "JobOpening", "Candidate", "Notification", "Auth", "System",
      ],
    },
    entityId:    { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, required: true, trim: true },
    changes:     { type: mongoose.Schema.Types.Mixed, default: null },
    ipAddress:   { type: String, default: "" },
    userAgent:   { type: String, default: "" },
    metadata:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
);

auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
