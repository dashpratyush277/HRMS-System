const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email transporter ready");
  } catch (err) {
    // Never crash the app — email is non-critical infrastructure
    console.warn("Email transporter warning:", err.message);
  }
};

if (process.env.NODE_ENV === "development") {
  verifyEmailConnection();
}

module.exports = { transporter, verifyEmailConnection };
