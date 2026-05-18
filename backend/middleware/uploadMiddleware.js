const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const ensureUploadDirs = () => {
  ["profiles", "leaves", "resumes"].forEach((dir) => {
    const fullPath = path.join(UPLOAD_ROOT, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

ensureUploadDirs();

// ── File type validation ──────────────────────────────────────────────────────
const IMAGE_TYPES    = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const DOCUMENT_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const makeFileFilter = (allowedMimes, label) => (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `${label}: ${allowedMimes.join(", ")}`));
  }
};

// ── Storage factory ───────────────────────────────────────────────────────────
const makeStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(UPLOAD_ROOT, subfolder));
    },
    filename: (req, file, cb) => {
      const ext      = path.extname(file.originalname).toLowerCase();
      const safeName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, safeName);
    },
  });

// ── Profile picture ───────────────────────────────────────────────────────────
const uploadProfilePicture = multer({
  storage:  makeStorage("profiles"),
  limits:   { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: makeFileFilter(IMAGE_TYPES, "Profile pictures must be jpg, jpeg, png, or webp"),
});

// ── Leave attachment ──────────────────────────────────────────────────────────
const uploadLeaveAttachment = multer({
  storage:  makeStorage("leaves"),
  limits:   { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: makeFileFilter(
    [...IMAGE_TYPES, "application/pdf"],
    "Leave attachments must be jpg, jpeg, png, webp, or pdf"
  ),
});

// ── Candidate resume ──────────────────────────────────────────────────────────
const uploadCandidateResume = multer({
  storage:  makeStorage("resumes"),
  limits:   { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: makeFileFilter(DOCUMENT_TYPES, "Resumes must be pdf, doc, or docx"),
});

module.exports = { uploadProfilePicture, uploadLeaveAttachment, uploadCandidateResume };
