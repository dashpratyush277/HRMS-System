const fs   = require("fs");
const path = require("path");

const isLocalUploadPath = (filePath) => {
  if (!filePath) return false;
  return filePath.startsWith("/uploads/");
};

const deleteLocalFile = (filePath) => {
  if (!isLocalUploadPath(filePath)) return;
  const absPath = path.join(__dirname, "..", filePath);
  if (fs.existsSync(absPath)) {
    try {
      fs.unlinkSync(absPath);
    } catch (err) {
      console.error("Could not delete file:", absPath, err.message);
    }
  }
};

module.exports = { isLocalUploadPath, deleteLocalFile };
