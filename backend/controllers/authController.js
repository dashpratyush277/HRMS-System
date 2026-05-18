const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { deleteLocalFile } = require("../utils/fileUtils");
const {
  welcomeEmailTemplate,
  resetPasswordEmailTemplate,
  passwordChangedTemplate,
} = require("../utils/emailTemplates");
const createAuditLog = require("../utils/auditLogger");

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── POST /api/auth/register ───────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: "Name is required" });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please provide a valid email" });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    if (role && !["admin", "hr", "employee"].includes(role))
      return res.status(400).json({ success: false, message: "Role must be admin, hr, or employee" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "employee",
    });

    // Send welcome email (non-blocking — failure is logged, not thrown)
    sendEmail({
      to:      user.email,
      subject: "Welcome to HRMS System",
      html:    welcomeEmailTemplate({
        name:     user.name,
        role:     user.role,
        loginUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
      }),
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account is disabled" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user._id, user.role);

    createAuditLog({ req, actor: user._id, actorName: user.name, actorRole: user.role,
      action: "LOGIN", entityType: "Auth", entityId: user._id,
      description: `User logged in: ${user.email}` });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.error("GetMe Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  // Always return the same generic message so we don't reveal email existence
  const GENERIC_MSG = "If an account exists with this email, a password reset link has been sent.";

  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please provide a valid email" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true, message: GENERIC_MSG });

    const rawToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

    const sent = await sendEmail({
      to:      user.email,
      subject: "HRMS — Password Reset Request",
      html:    resetPasswordEmailTemplate({ name: user.name, resetUrl, expiresInMinutes: 10 }),
    });

    if (!sent) {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Email could not be sent. Please try again." });
    }

    res.json({ success: true, message: GENERIC_MSG });
  } catch (error) {
    console.error("ForgotPassword Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ── PUT /api/auth/reset-password/:token ───────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    // Hash the raw URL token to match the stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

    const salt = await bcrypt.genSalt(10);
    user.password            = await bcrypt.hash(password, salt);
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendEmail({
      to:      user.email,
      subject: "HRMS — Your Password Has Been Changed",
      html:    passwordChangedTemplate({
        name:     user.name,
        loginUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
      }),
    });

    res.json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("ResetPassword Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ── PUT /api/auth/profile-picture ─────────────────────────────────────────────
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "Please upload an image file" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Delete old local file if it exists
    if (user.profileImage) {
      deleteLocalFile(user.profileImage);
    }

    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("UpdateProfilePicture Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword, updateProfilePicture };
