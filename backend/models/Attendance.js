const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    month: { type: Number },
    year:  { type: Number },
    status: {
      type: String,
      enum: ["present", "absent", "half-day", "leave", "holiday"],
      required: [true, "Status is required"],
    },
    checkIn:  { type: String, default: "" }, // HH:mm
    checkOut: { type: String, default: "" }, // HH:mm
    totalHours: { type: Number, default: 0 },
    remarks: { type: String, trim: true, default: "" },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Normalize date to midnight UTC, extract month/year, calculate totalHours
attendanceSchema.pre("save", function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setUTCHours(0, 0, 0, 0);
    this.date  = d;
    this.month = d.getUTCMonth() + 1;
    this.year  = d.getUTCFullYear();
  }

  if (this.checkIn && this.checkOut) {
    const [inH, inM]   = this.checkIn.split(":").map(Number);
    const [outH, outM] = this.checkOut.split(":").map(Number);
    const mins = (outH * 60 + outM) - (inH * 60 + inM);
    this.totalHours = mins > 0 ? parseFloat((mins / 60).toFixed(2)) : 0;
  } else {
    this.totalHours = 0;
  }

  next();
});

// Compound unique index: one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ month: 1, year: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
