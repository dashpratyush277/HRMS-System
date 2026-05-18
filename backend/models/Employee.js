const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // ── Personal Information ──────────────────────────────────────────
    firstName: { type: String, required: [true, "First name is required"], trim: true },
    lastName:  { type: String, required: [true, "Last name is required"],  trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone:       { type: String, required: [true, "Phone is required"] },
    gender:      { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    address:     { type: String },

    // ── Job Information ───────────────────────────────────────────────
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    department:  { type: String, required: [true, "Department is required"] },
    designation: { type: String, required: [true, "Designation is required"] },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "intern", "contract"],
      default: "full-time",
    },
    joiningDate: { type: Date, required: [true, "Joining date is required"] },
    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },

    // ── Salary Information ────────────────────────────────────────────
    basicSalary: { type: Number, default: 0 },

    // ── Emergency Contact ─────────────────────────────────────────────
    emergencyContactName:  { type: String },
    emergencyContactPhone: { type: String },

    // ── System Fields ─────────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    // Include virtuals when converting to JSON or plain objects
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: combine first + last name
employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Employee", employeeSchema);
