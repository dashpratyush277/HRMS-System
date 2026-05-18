const mongoose = require("mongoose");

const jobOpeningSchema = new mongoose.Schema(
  {
    title:           { type: String, required: [true, "Job title is required"], trim: true },
    department:      { type: String, required: [true, "Department is required"], trim: true },
    designation:     { type: String, trim: true, default: "" },
    employmentType:  { type: String, enum: ["full-time", "part-time", "intern", "contract"], default: "full-time" },
    location:        { type: String, trim: true, default: "" },
    openings:        { type: Number, default: 1, min: [1, "Openings must be at least 1"] },
    experienceRequired: { type: String, trim: true, default: "" },
    salaryRange:     { type: String, trim: true, default: "" },

    jobDescription:  { type: String, required: [true, "Job description is required"], trim: true },
    requirements:    { type: String, trim: true, default: "" },
    responsibilities:{ type: String, trim: true, default: "" },
    benefits:        { type: String, trim: true, default: "" },

    status:   { type: String, enum: ["open", "closed", "on-hold"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high"],     default: "medium" },

    postedDate:  { type: Date, default: Date.now },
    closingDate: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

jobOpeningSchema.index({ title: 1 });
jobOpeningSchema.index({ department: 1 });
jobOpeningSchema.index({ status: 1 });
jobOpeningSchema.index({ employmentType: 1 });

module.exports = mongoose.model("JobOpening", jobOpeningSchema);
