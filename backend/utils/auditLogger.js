const AuditLog = require("../models/AuditLog");

/**
 * Fire-and-forget audit log creator.
 * Pass req for automatic actor/IP/agent extraction.
 * Never throws — logs errors, never crashes the main request.
 */
const createAuditLog = async ({
  req,
  actor = null,
  actorName = "System",
  actorRole = "system",
  action,
  entityType,
  entityId = null,
  description,
  changes = null,
  metadata = {},
}) => {
  try {
    // Extract actor info from request if available
    if (req?.user) {
      actor     = actor || req.user._id;
      actorName = actorName !== "System" ? actorName : (req.user.name || "Unknown");
      actorRole = actorRole !== "system"  ? actorRole : (req.user.role || "unknown");
    }

    const ipAddress = req?.ip || req?.connection?.remoteAddress || "";
    const userAgent = req?.headers?.["user-agent"] || "";

    await AuditLog.create({
      actor, actorName, actorRole,
      action, entityType, entityId,
      description, changes,
      ipAddress, userAgent, metadata,
    });
  } catch (err) {
    console.error("createAuditLog error:", err.message);
  }
};

module.exports = createAuditLog;
