// Development-only routes — never mounted in production (see server.js)
const express = require("express");
const router  = express.Router();
const sendEmail = require("../utils/sendEmail");
const { genericNotificationTemplate } = require("../utils/emailTemplates");

router.get("/test-email", async (req, res) => {
  const { to } = req.query;
  if (!to) {
    return res.status(400).json({ success: false, message: "Provide ?to=email@example.com" });
  }

  const result = await sendEmail({
    to,
    subject: "HRMS — Test Email",
    html: genericNotificationTemplate({
      title:      "Test Email",
      message:    "If you see this, your email configuration is working correctly.",
      actionUrl:  process.env.FRONTEND_URL || "http://localhost:5173",
      actionText: "Open HRMS",
    }),
  });

  if (result) {
    res.json({ success: true, message: `Test email sent to ${to}`, messageId: result.messageId });
  } else {
    res.status(500).json({ success: false, message: "Failed to send test email. Check EMAIL_* env vars and server logs." });
  }
});

module.exports = router;
