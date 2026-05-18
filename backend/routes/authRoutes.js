const express = require("express");
const router  = express.Router();

const {
  registerUser, loginUser, getMe,
  forgotPassword, resetPassword, updateProfilePicture,
} = require("../controllers/authController");
const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimiters");
const validateRequest    = require("../middleware/validateRequest");
const { uploadProfilePicture } = require("../middleware/uploadMiddleware");
const uploadErrorHandler = require("../middleware/uploadErrorHandler");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register",     authLimiter,          registerValidator,       validateRequest, registerUser);
router.post("/login",        authLimiter,          loginValidator,          validateRequest, loginUser);
router.post("/forgot-password", passwordResetLimiter, forgotPasswordValidator, validateRequest, forgotPassword);
router.put("/reset-password/:token", passwordResetLimiter, resetPasswordValidator, validateRequest, resetPassword);

// ── Protected routes ──────────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put(
  "/profile-picture",
  protect,
  uploadProfilePicture.single("profileImage"),
  uploadErrorHandler,
  updateProfilePicture
);

// ── Role-based test routes ────────────────────────────────────────────────────
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ success: true, message: `Welcome Admin ${req.user.name}!` });
});
router.get("/hr-admin", protect, authorizeRoles("admin", "hr"), (req, res) => {
  res.json({ success: true, message: `Welcome ${req.user.name}!` });
});

module.exports = router;
