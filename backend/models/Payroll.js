const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    month: { type: Number, required: [true, "Month is required"], min: 1, max: 12 },
    year:  { type: Number, required: [true, "Year is required"]  },

    // Earnings
    basicSalary:  { type: Number, required: true },
    hra:          { type: Number, default: 0 },
    allowances:   { type: Number, default: 0 },
    bonus:        { type: Number, default: 0 },

    // Deductions
    tax:             { type: Number, default: 0 },
    providentFund:   { type: Number, default: 0 },
    insurance:       { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },

    // Attendance
    totalWorkingDays: { type: Number, default: 0 },
    presentDays:      { type: Number, default: 0 },
    paidLeaves:       { type: Number, default: 0 },
    unpaidLeaves:     { type: Number, default: 0 },
    lossOfPay:        { type: Number, default: 0 },

    // Calculated (set in pre-save)
    grossSalary:     { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary:       { type: Number, default: 0 },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDate:   { type: Date, default: null },
    paymentMethod: {
      type: String,
      enum: ["bank-transfer", "cash", "cheque", "upi"],
      default: "bank-transfer",
    },
    transactionId: { type: String, default: "" },
    remarks:       { type: String, trim: true, default: "" },

    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-calculate gross, deductions, net; clamp net to 0
payrollSchema.pre("save", function (next) {
  this.grossSalary     = (this.basicSalary || 0) + (this.hra || 0) + (this.allowances || 0) + (this.bonus || 0);
  this.totalDeductions = (this.tax || 0) + (this.providentFund || 0) + (this.insurance || 0) +
                         (this.otherDeductions || 0) + (this.lossOfPay || 0);
  this.netSalary = Math.max(0, this.grossSalary - this.totalDeductions);
  next();
});

payrollSchema.index({ employee: 1 });
payrollSchema.index({ month: 1 });
payrollSchema.index({ year: 1 });
payrollSchema.index({ paymentStatus: 1 });
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
