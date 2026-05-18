const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    year: { type: Number, required: true },

    // Allocated
    casual:    { type: Number, default: 12 },
    sick:      { type: Number, default: 10 },
    earned:    { type: Number, default: 15 },
    maternity: { type: Number, default: 0  },
    paternity: { type: Number, default: 0  },
    unpaid:    { type: Number, default: 0  },

    // Used
    usedCasual:    { type: Number, default: 0 },
    usedSick:      { type: Number, default: 0 },
    usedEarned:    { type: Number, default: 0 },
    usedMaternity: { type: Number, default: 0 },
    usedPaternity: { type: Number, default: 0 },
    usedUnpaid:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One balance record per employee per year
leaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
