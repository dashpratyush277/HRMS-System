const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    leaveType: {
      type: String,
      enum: ["casual", "sick", "earned", "maternity", "paternity", "unpaid"],
      required: [true, "Leave type is required"],
    },
    startDate: { type: Date, required: [true, "Start date is required"] },
    endDate:   { type: Date, required: [true, "End date is required"]   },
    totalDays: { type: Number, required: true },
    reason:    { type: String, required: [true, "Reason is required"], trim: true },
    attachment:{ type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    adminComment: { type: String, trim: true, default: "" },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Calculate totalDays; throw if endDate < startDate
leaveSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end   = new Date(this.endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);
    if (end < start) {
      return next(new Error("End date cannot be before start date."));
    }
    const diffMs = end - start;
    this.totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

leaveSchema.index({ employee: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ startDate: 1 });
leaveSchema.index({ endDate: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
