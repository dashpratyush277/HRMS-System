const express = require("express");
const router  = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateRequest    = require("../middleware/validateRequest");
const { uploadCandidateResume } = require("../middleware/uploadMiddleware");
const uploadErrorHandler = require("../middleware/uploadErrorHandler");
const {
  createJobValidator,
  updateJobStatusValidator,
  createCandidateValidator,
  updateCandidateValidator,
  updateCandidateStageValidator,
  jobIdParamValidator,
  candidateIdParamValidator,
} = require("../validators/recruitmentValidators");
const {
  createJobOpening, getJobOpenings, getJobOpeningById, updateJobOpening,
  updateJobStatus, deleteJobOpening,
  addCandidate, getCandidates, getCandidateById, updateCandidate,
  updateCandidateStage, deleteCandidate,
  getRecruitmentStats,
} = require("../controllers/recruitmentController");

// Stats — must come before /:id
router.get("/stats", protect, authorizeRoles("admin", "hr"), getRecruitmentStats);

// Job Openings
router.route("/jobs")
  .get(protect,  authorizeRoles("admin", "hr"), getJobOpenings)
  .post(protect, authorizeRoles("admin", "hr"), createJobValidator, validateRequest, createJobOpening);

router.route("/jobs/:id")
  .get(protect,    authorizeRoles("admin", "hr"), jobIdParamValidator, validateRequest, getJobOpeningById)
  .put(protect,    authorizeRoles("admin", "hr"), jobIdParamValidator, validateRequest, updateJobOpening)
  .delete(protect, authorizeRoles("admin"),       jobIdParamValidator, validateRequest, deleteJobOpening);

router.put("/jobs/:id/status", protect, authorizeRoles("admin", "hr"), updateJobStatusValidator, validateRequest, updateJobStatus);

// Candidates
router.route("/candidates")
  .get(protect,  authorizeRoles("admin", "hr"), getCandidates)
  .post(protect, authorizeRoles("admin", "hr"), uploadCandidateResume.single("resume"), uploadErrorHandler, createCandidateValidator, validateRequest, addCandidate);

router.route("/candidates/:id")
  .get(protect,    authorizeRoles("admin", "hr"), candidateIdParamValidator, validateRequest, getCandidateById)
  .put(protect,    authorizeRoles("admin", "hr"), updateCandidateValidator,  validateRequest, updateCandidate)
  .delete(protect, authorizeRoles("admin"),       candidateIdParamValidator, validateRequest, deleteCandidate);

router.put("/candidates/:id/stage", protect, authorizeRoles("admin", "hr"), updateCandidateStageValidator, validateRequest, updateCandidateStage);

module.exports = router;
