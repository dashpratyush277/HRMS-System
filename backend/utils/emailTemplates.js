const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a; color: #e2e8f0; margin: 0; padding: 0;
`;
const cardStyle = `
  max-width: 560px; margin: 32px auto; background: #1e293b;
  border-radius: 12px; overflow: hidden; border: 1px solid #334155;
`;
const headerStyle = `
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  padding: 32px 40px; text-align: center;
`;
const bodyStyle  = `padding: 32px 40px;`;
const labelStyle = `color: #94a3b8; font-size: 13px; margin-bottom: 2px;`;
const valueStyle = `color: #e2e8f0; font-size: 15px; font-weight: 600; margin-bottom: 16px;`;
const badgeStyle = (bg) => `
  display: inline-block; padding: 4px 12px; border-radius: 20px;
  background: ${bg}; color: #fff; font-size: 13px; font-weight: 600;
`;
const btnStyle = `
  display: inline-block; margin-top: 8px; padding: 12px 28px;
  background: #3b82f6; color: #fff; border-radius: 8px;
  text-decoration: none; font-weight: 600; font-size: 15px;
`;
const footerStyle = `
  text-align: center; padding: 20px 40px;
  color: #64748b; font-size: 12px; border-top: 1px solid #334155;
`;

const wrap = (title, body) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="${headerStyle}">
      <div style="font-size:28px;margin-bottom:4px;">🏢</div>
      <div style="color:#fff;font-size:22px;font-weight:700;">HRMS System</div>
      <div style="color:rgba(255,255,255,.75);font-size:14px;margin-top:4px;">${title}</div>
    </div>
    <div style="${bodyStyle}">${body}</div>
    <div style="${footerStyle}">
      This is an automated email from HRMS System. Please do not reply.<br>
      &copy; ${new Date().getFullYear()} HRMS System. All rights reserved.
    </div>
  </div>
</body>
</html>`;

// ── 1. Welcome ────────────────────────────────────────────────────────────────
const welcomeEmailTemplate = ({ name, role, loginUrl }) =>
  wrap("Welcome to HRMS", `
    <h2 style="color:#fff;margin:0 0 8px;">Welcome, ${name}!</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Your HRMS account has been created successfully.</p>
    <p style="${labelStyle}">Role</p>
    <p><span style="${badgeStyle("#6366f1")}">${role.toUpperCase()}</span></p>
    <p style="color:#94a3b8;margin:16px 0 8px;">
      You can now log in to access your dashboard and HR tools.
    </p>
    <a href="${loginUrl}" style="${btnStyle}">Login to HRMS</a>
  `);

// ── 2. Leave submitted (to employee) ─────────────────────────────────────────
const leaveSubmittedTemplate = ({ employeeName, leaveType, startDate, endDate, totalDays }) =>
  wrap("Leave Request Submitted", `
    <h2 style="color:#fff;margin:0 0 8px;">Leave Request Received</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${employeeName}, your leave request has been submitted and is pending approval.</p>
    <p style="${labelStyle}">Leave Type</p>
    <p><span style="${badgeStyle("#6366f1")}">${leaveType.toUpperCase()}</span></p>
    <p style="${labelStyle}">From</p><p style="${valueStyle}">${startDate}</p>
    <p style="${labelStyle}">To</p><p style="${valueStyle}">${endDate}</p>
    <p style="${labelStyle}">Total Days</p><p style="${valueStyle}">${totalDays} day(s)</p>
    <p style="color:#94a3b8;margin-top:8px;">You will be notified once your request is reviewed.</p>
  `);

// ── 3. Leave approved ─────────────────────────────────────────────────────────
const leaveApprovedTemplate = ({ employeeName, leaveType, startDate, endDate, comment }) =>
  wrap("Leave Approved", `
    <h2 style="color:#22c55e;margin:0 0 8px;">Leave Approved</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${employeeName}, great news — your leave request has been approved.</p>
    <p style="${labelStyle}">Leave Type</p>
    <p><span style="${badgeStyle("#22c55e")}">${leaveType.toUpperCase()}</span></p>
    <p style="${labelStyle}">From</p><p style="${valueStyle}">${startDate}</p>
    <p style="${labelStyle}">To</p><p style="${valueStyle}">${endDate}</p>
    ${comment ? `<p style="${labelStyle}">Comment</p><p style="${valueStyle}">${comment}</p>` : ""}
    <p style="color:#94a3b8;margin-top:8px;">Please ensure your work is handed over before your leave begins.</p>
  `);

// ── 4. Leave rejected ─────────────────────────────────────────────────────────
const leaveRejectedTemplate = ({ employeeName, leaveType, startDate, endDate, comment }) =>
  wrap("Leave Request Rejected", `
    <h2 style="color:#ef4444;margin:0 0 8px;">Leave Request Rejected</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${employeeName}, unfortunately your leave request has been rejected.</p>
    <p style="${labelStyle}">Leave Type</p>
    <p><span style="${badgeStyle("#ef4444")}">${leaveType.toUpperCase()}</span></p>
    <p style="${labelStyle}">From</p><p style="${valueStyle}">${startDate}</p>
    <p style="${labelStyle}">To</p><p style="${valueStyle}">${endDate}</p>
    ${comment ? `<p style="${labelStyle}">Reason</p><p style="${valueStyle}">${comment}</p>` : ""}
    <p style="color:#94a3b8;margin-top:8px;">Please contact HR if you have any questions.</p>
  `);

// ── 5. Payroll generated ──────────────────────────────────────────────────────
const payrollGeneratedTemplate = ({ employeeName, month, year, netSalary, payslipUrl }) =>
  wrap("Payslip Generated", `
    <h2 style="color:#fff;margin:0 0 8px;">Your Payslip is Ready</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${employeeName}, your payslip for <strong style="color:#e2e8f0;">${month} ${year}</strong> has been generated.</p>
    <p style="${labelStyle}">Net Salary</p>
    <p style="font-size:28px;font-weight:700;color:#22c55e;margin:0 0 20px;">${netSalary}</p>
    ${payslipUrl ? `<a href="${payslipUrl}" style="${btnStyle}">View Payslip</a>` : ""}
    <p style="color:#94a3b8;margin-top:20px;font-size:13px;">
      Log in to HRMS to view your complete payslip breakdown.
    </p>
  `);

// ── 6. Candidate added ────────────────────────────────────────────────────────
const candidateAddedTemplate = ({ candidateName, jobTitle, stage }) =>
  wrap("Application Received", `
    <h2 style="color:#fff;margin:0 0 8px;">Application Received</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${candidateName}, we have received your application and added you to our recruitment pipeline.</p>
    <p style="${labelStyle}">Position</p><p style="${valueStyle}">${jobTitle}</p>
    <p style="${labelStyle}">Current Stage</p>
    <p><span style="${badgeStyle("#3b82f6")}">${stage.toUpperCase().replace("-", " ")}</span></p>
    <p style="color:#94a3b8;margin-top:16px;">Our team will review your application and reach out soon.</p>
  `);

// ── 7. Reset password ─────────────────────────────────────────────────────────
const resetPasswordEmailTemplate = ({ name, resetUrl, expiresInMinutes }) =>
  wrap("Password Reset Request", `
    <h2 style="color:#fff;margin:0 0 8px;">Reset Your Password</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${name}, we received a request to reset your HRMS account password.</p>
    <p style="color:#e2e8f0;margin-bottom:24px;">Click the button below to reset your password. This link expires in <strong>${expiresInMinutes} minutes</strong>.</p>
    <a href="${resetUrl}" style="${btnStyle}">Reset Password</a>
    <p style="color:#64748b;margin-top:24px;font-size:13px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <span style="color:#3b82f6;">${resetUrl}</span>
    </p>
    <p style="color:#ef4444;margin-top:16px;font-size:13px;">
      If you did not request a password reset, please ignore this email. Your account remains secure.
    </p>
  `);

// ── 8. Password changed confirmation ─────────────────────────────────────────
const passwordChangedTemplate = ({ name, loginUrl }) =>
  wrap("Password Changed", `
    <h2 style="color:#22c55e;margin:0 0 8px;">Password Changed Successfully</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${name}, your HRMS account password has been updated successfully.</p>
    <p style="color:#e2e8f0;margin-bottom:24px;">You can now log in with your new password.</p>
    <a href="${loginUrl}" style="${btnStyle}">Login to HRMS</a>
    <p style="color:#ef4444;margin-top:20px;font-size:13px;">
      If you did not make this change, contact your system administrator immediately.
    </p>
  `);

// ── 9. Generic notification ───────────────────────────────────────────────────
const genericNotificationTemplate = ({ title, message, actionUrl, actionText }) =>
  wrap(title, `
    <h2 style="color:#fff;margin:0 0 16px;">${title}</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">${message}</p>
    ${actionUrl ? `<a href="${actionUrl}" style="${btnStyle}">${actionText || "View Details"}</a>` : ""}
  `);

module.exports = {
  welcomeEmailTemplate,
  leaveSubmittedTemplate,
  leaveApprovedTemplate,
  leaveRejectedTemplate,
  payrollGeneratedTemplate,
  candidateAddedTemplate,
  resetPasswordEmailTemplate,
  passwordChangedTemplate,
  genericNotificationTemplate,
};
