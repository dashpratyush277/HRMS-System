const Notification = require("../models/Notification");

/**
 * Fire-and-forget notification creator.
 * Never throws — logs errors, never crashes the main request.
 */
const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = "general",
  priority = "medium",
  actionUrl = "",
  metadata = {},
}) => {
  try {
    if (!recipient || !title || !message) return null;
    return await Notification.create({ recipient, sender, title, message, type, priority, actionUrl, metadata });
  } catch (err) {
    console.error("createNotification error:", err.message);
    return null;
  }
};

/**
 * Notify multiple recipients at once (e.g., all HR/admin).
 */
const createBulkNotifications = async (recipients, payload) => {
  const results = await Promise.allSettled(
    recipients.map((recipient) => createNotification({ recipient, ...payload }))
  );
  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
};

module.exports = { createNotification, createBulkNotifications };
