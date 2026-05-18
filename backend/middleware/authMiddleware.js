const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect middleware — verifies JWT and attaches user to req
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    // Throws if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and exclude password from the result
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// Role-based access control — call as authorizeRoles("admin", "hr")
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not authorized to access this resource`,
    });
  }
  next();
};

module.exports = { protect, authorizeRoles };
