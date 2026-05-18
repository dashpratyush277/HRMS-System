const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    title:     { type: String, required: true, trim: true },
    message:   { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["leave", "payroll", "recruitment", "performance", "attendance", "system", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isRead:    { type: Boolean, default: false },
    readAt:    { type: Date, default: null },
    actionUrl: { type: String, default: "" },
    metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
