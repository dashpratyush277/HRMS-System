const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    goals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goal" }],

    reviewPeriod: { type: String, required: [true, "Review period is required"], trim: true },
    startDate:    { type: Date, required: [true, "Start date is required"] },
    endDate:      { type: Date, required: [true, "End date is required"]   },

    productivityRating:   { type: Number, min: 1, max: 5, default: null },
    qualityRating:        { type: Number, min: 1, max: 5, default: null },
    teamworkRating:       { type: Number, min: 1, max: 5, default: null },
    communicationRating:  { type: Number, min: 1, max: 5, default: null },
    leadershipRating:     { type: Number, min: 1, max: 5, default: null },
    overallRating:        { type: Number, min: 1, max: 5, default: null },

    strengths:       { type: String, trim: true, default: "" },
    improvements:    { type: String, trim: true, default: "" },
    managerFeedback: { type: String, trim: true, default: "" },
    employeeFeedback:{ type: String, trim: true, default: "" },
    finalComments:   { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["draft","submitted","approved","rejected"],
      default: "draft",
    },

    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt:  { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-calculate overallRating as average of filled rating fields
performanceReviewSchema.pre("save", function (next) {
  if (this.overallRating) return next(); // skip if manually set
  const fields = [
    this.productivityRating, this.qualityRating, this.teamworkRating,
    this.communicationRating, this.leadershipRating,
  ].filter((v) => v != null && v > 0);
  if (fields.length > 0) {
    this.overallRating = parseFloat((fields.reduce((a, b) => a + b, 0) / fields.length).toFixed(2));
  }
  next();
});

performanceReviewSchema.index({ employee: 1 });
performanceReviewSchema.index({ status: 1 });
performanceReviewSchema.index({ reviewPeriod: 1 });

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
