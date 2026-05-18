require("dotenv").config();

const path          = require("path");
const express       = require("express");
const cors          = require("cors");
const helmet        = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp           = require("hpp");
const morgan        = require("morgan");
const connectDB     = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiters");

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers (Multer handles multipart; JSON limit kept small) ─────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── NoSQL injection prevention ────────────────────────────────────────────────
app.use(mongoSanitize());

// ── HTTP Parameter Pollution prevention ───────────────────────────────────────
app.use(hpp());

// ── Request logging (development only) ────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Static file serving for uploads ──────────────────────────────────────────
// In production, prefer serving via a CDN or private signed URLs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use("/api", generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/employees",   require("./routes/employeeRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/attendance",  require("./routes/attendanceRoutes"));
app.use("/api/leaves",      require("./routes/leaveRoutes"));
app.use("/api/payroll",     require("./routes/payrollRoutes"));
app.use("/api/recruitment",   require("./routes/recruitmentRoutes"));
app.use("/api/performance",   require("./routes/performanceRoutes"));
app.use("/api/profile",       require("./routes/profileRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/audit-logs",    require("./routes/auditLogRoutes"));
app.use("/api/exports",       require("./routes/exportRoutes"));
app.use("/api/calendar",      require("./routes/calendarRoutes"));

// ── Dev-only routes ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use("/api/dev", require("./routes/devRoutes"));
}

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "HRMS API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
