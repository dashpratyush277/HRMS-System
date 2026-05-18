const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    title:       { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, trim: true, default: "" },
    category: {
      type: String,
      enum: ["productivity","quality","teamwork","leadership","learning","attendance","custom"],
      default: "custom",
    },
    priority: { type: String, enum: ["low","medium","high"], default: "medium" },

    startDate: { type: Date, required: [true, "Start date is required"] },
    dueDate:   { type: Date, required: [true, "Due date is required"]   },

    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["not-started","in-progress","completed","overdue","cancelled"],
      default: "not-started",
    },

    weight:          { type: Number, default: 0, min: 0 },
    score:           { type: Number, min: 0, max: 10, default: null },
    managerComment:  { type: String, trim: true, default: "" },
    employeeComment: { type: String, trim: true, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-derive status from progress and dueDate
goalSchema.pre("save", function (next) {
  if (this.status === "cancelled") return next();
  if (this.progress >= 100) {
    this.status = "completed";
  } else if (this.progress > 0) {
    const now = new Date();
    this.status = this.dueDate && new Date(this.dueDate) < now ? "overdue" : "in-progress";
  } else {
    const now = new Date();
    this.status = this.dueDate && new Date(this.dueDate) < now ? "overdue" : "not-started";
  }
  next();
});

goalSchema.index({ employee: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ category: 1 });
goalSchema.index({ dueDate: 1 });

module.exports = mongoose.model("Goal", goalSchema);
