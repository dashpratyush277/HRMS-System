const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    jobOpening: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOpening",
      required: [true, "Job opening is required"],
    },

    name:    { type: String, required: [true, "Name is required"], trim: true },
    email:   { type: String, required: [true, "Email is required"], lowercase: true, trim: true },
    phone:   { type: String, required: [true, "Phone is required"], trim: true },
    address: { type: String, trim: true, default: "" },

    currentCompany:      { type: String, trim: true, default: "" },
    currentDesignation:  { type: String, trim: true, default: "" },
    experienceYears:     { type: Number, default: 0, min: 0 },
    expectedSalary:      { type: Number, default: null },
    noticePeriod:        { type: String, trim: true, default: "" },
    skills:              [{ type: String, trim: true }],

    resumeUrl:    { type: String, trim: true, default: "" },
    portfolioUrl: { type: String, trim: true, default: "" },
    linkedinUrl:  { type: String, trim: true, default: "" },

    stage: {
      type: String,
      enum: ["applied","screening","interview","technical","hr-round","selected","rejected","offered","joined"],
      default: "applied",
    },
    status: {
      type: String,
      enum: ["active", "rejected", "selected", "on-hold"],
      default: "active",
    },
    rating: { type: Number, min: 1, max: 5, default: null },
    notes:  { type: String, trim: true, default: "" },

    interviewDate:     { type: Date, default: null },
    interviewer:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    interviewFeedback: { type: String, trim: true, default: "" },

    addedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

candidateSchema.index({ jobOpening: 1 });
candidateSchema.index({ email: 1 });
candidateSchema.index({ stage: 1 });
candidateSchema.index({ status: 1 });
// One candidate (by email) per job opening
candidateSchema.index({ jobOpening: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Candidate", candidateSchema);
