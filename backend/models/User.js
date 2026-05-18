const mongoose = require("mongoose");
const crypto   = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "hr", "employee"],
      default: "employee",
    },
    phone: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Password reset
    resetPasswordToken:  { type: String,  default: undefined },
    resetPasswordExpire: { type: Date,    default: undefined },
  },
  { timestamps: true }
);

// Generate a one-time reset token, hash it for DB storage, return the plain token for the email link
userSchema.methods.getResetPasswordToken = function () {
  const rawToken    = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken  = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return rawToken;
};

module.exports = mongoose.model("User", userSchema);
