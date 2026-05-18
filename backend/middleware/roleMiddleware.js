// Usage: authorizeRoles("admin", "hr")
// Place after the protect middleware in a route definition
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
