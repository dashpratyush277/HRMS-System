const { body, param } = require("express-validator");

const CANDIDATE_STAGES = [
  "applied", "screening", "interview", "technical",
  "hr-round", "selected", "rejected", "offered", "joined",
];
const CANDIDATE_STATUSES = ["active", "rejected", "selected", "on-hold"];
const JOB_STATUSES = ["open", "closed", "on-hold"];
const PRIORITIES = ["low", "medium", "high"];
const EMPLOYMENT_TYPES = ["full-time", "part-time", "intern", "contract"];

const createJobValidator = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("jobDescription").trim().notEmpty().withMessage("Job description is required"),
  body("openings")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Openings must be at least 1"),
  body("status")
    .optional()
    .isIn(JOB_STATUSES)
    .withMessage(`Status must be one of: ${JOB_STATUSES.join(", ")}`),
  body("priority")
    .optional()
    .isIn(PRIORITIES)
    .withMessage(`Priority must be one of: ${PRIORITIES.join(", ")}`),
  body("employmentType")
    .optional()
    .isIn(EMPLOYMENT_TYPES)
    .withMessage(`Employment type must be one of: ${EMPLOYMENT_TYPES.join(", ")}`),
  body("closingDate")
    .optional()
    .isISO8601()
    .withMessage("Closing date must be a valid date"),
];

const updateJobStatusValidator = [
  param("id").isMongoId().withMessage("Invalid job opening ID"),
  body("status")
    .isIn(JOB_STATUSES)
    .withMessage(`Status must be one of: ${JOB_STATUSES.join(", ")}`),
];

const createCandidateValidator = [
  body("jobOpening").isMongoId().withMessage("Job opening must be a valid ID"),
  body("name").trim().notEmpty().withMessage("Candidate name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("stage")
    .optional()
    .isIn(CANDIDATE_STAGES)
    .withMessage(`Stage must be one of: ${CANDIDATE_STAGES.join(", ")}`),
  body("status")
    .optional()
    .isIn(CANDIDATE_STATUSES)
    .withMessage(`Status must be one of: ${CANDIDATE_STATUSES.join(", ")}`),
  body("experienceYears")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Experience years must be a non-negative number"),
  body("expectedSalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Expected salary must be a non-negative number"),
  body("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

const updateCandidateValidator = [
  param("id").isMongoId().withMessage("Invalid candidate ID"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("stage")
    .optional()
    .isIn(CANDIDATE_STAGES)
    .withMessage(`Stage must be one of: ${CANDIDATE_STAGES.join(", ")}`),
  body("status")
    .optional()
    .isIn(CANDIDATE_STATUSES)
    .withMessage(`Status must be one of: ${CANDIDATE_STATUSES.join(", ")}`),
  body("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("experienceYears")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Experience years must be a non-negative number"),
  body("expectedSalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Expected salary must be a non-negative number"),
];

const updateCandidateStageValidator = [
  param("id").isMongoId().withMessage("Invalid candidate ID"),
  body("stage")
    .isIn(CANDIDATE_STAGES)
    .withMessage(`Stage must be one of: ${CANDIDATE_STAGES.join(", ")}`),
  body("notes").optional().trim(),
  body("interviewDate")
    .optional()
    .isISO8601()
    .withMessage("Interview date must be a valid date"),
];

const jobIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid job opening ID"),
];

const candidateIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid candidate ID"),
];

module.exports = {
  createJobValidator,
  updateJobStatusValidator,
  createCandidateValidator,
  updateCandidateValidator,
  updateCandidateStageValidator,
  jobIdParamValidator,
  candidateIdParamValidator,
};
