const multer = require("multer");

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Please check the maximum allowed file size.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. ${err.field}`,
      });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  // Non-Multer errors — pass to global error handler
  next(err);
};

module.exports = uploadErrorHandler;
