const { transporter } = require("./emailTransporter");

/**
 * Send a transactional email.
 * Never throws — returns null on failure so callers don't need try/catch.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const fromName    = process.env.EMAIL_FROM_NAME    || "HRMS System";
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || "no-reply@hrms.com";

    const info = await transporter.sendMail({
      from:    `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
      text: text || "",
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Email sent:", info.messageId);
    }
    return info;
  } catch (err) {
    console.error("sendEmail error:", err.message);
    return null;
  }
};

module.exports = sendEmail;
