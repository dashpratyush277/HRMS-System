const JobOpening = require("../models/JobOpening");
const Candidate  = require("../models/Candidate");
const sendEmail  = require("../utils/sendEmail");
const { candidateAddedTemplate } = require("../utils/emailTemplates");

// ── JOB OPENING FUNCTIONS ─────────────────────────────────────────────────────

// POST /api/recruitment/jobs
const createJobOpening = async (req, res) => {
  try {
    const { title, department, jobDescription, openings } = req.body;
    if (!title)          return res.status(400).json({ success: false, message: "Title is required." });
    if (!department)     return res.status(400).json({ success: false, message: "Department is required." });
    if (!jobDescription) return res.status(400).json({ success: false, message: "Job description is required." });
    if (openings !== undefined && Number(openings) < 1)
      return res.status(400).json({ success: false, message: "Openings must be at least 1." });

    const job = await JobOpening.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recruitment/jobs
const getJobOpenings = async (req, res) => {
  try {
    const { search = "", status, employmentType, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ title: re }, { department: re }, { designation: re }, { location: re }];
    }
    if (status)         query.status         = status;
    if (employmentType) query.employmentType = employmentType;
    if (priority)       query.priority       = priority;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await JobOpening.countDocuments(query);
    const jobs  = await JobOpening.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Attach candidate count to each job
    const jobsWithCount = await Promise.all(
      jobs.map(async (j) => {
        const candidateCount = await Candidate.countDocuments({ jobOpening: j._id });
        return { ...j.toJSON(), candidateCount };
      })
    );

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      jobs: jobsWithCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recruitment/jobs/:id
const getJobOpeningById = async (req, res) => {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job opening not found." });

    const candidateCount = await Candidate.countDocuments({ jobOpening: job._id });
    const candidates     = await Candidate.find({ jobOpening: job._id }).sort({ createdAt: -1 });

    res.json({ success: true, job: { ...job.toJSON(), candidateCount }, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/recruitment/jobs/:id
const updateJobOpening = async (req, res) => {
  try {
    if (req.body.openings !== undefined && Number(req.body.openings) < 1)
      return res.status(400).json({ success: false, message: "Openings must be at least 1." });

    const job = await JobOpening.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: "Job opening not found." });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/recruitment/jobs/:id/status
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open","closed","on-hold"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value." });

    const job = await JobOpening.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user._id },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: "Job opening not found." });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/recruitment/jobs/:id  (admin only)
const deleteJobOpening = async (req, res) => {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job opening not found." });

    const candidateCount = await Candidate.countDocuments({ jobOpening: job._id });
    if (candidateCount > 0)
      return res.status(400).json({ success: false, message: "Cannot delete job opening with candidates." });

    await job.deleteOne();
    res.json({ success: true, message: "Job opening deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CANDIDATE FUNCTIONS ────────────────────────────────────────────────────────

// POST /api/recruitment/candidates
const addCandidate = async (req, res) => {
  try {
    const { jobOpening, name, email, phone, experienceYears, rating } = req.body;

    if (!jobOpening) return res.status(400).json({ success: false, message: "Job opening is required." });
    if (!name)       return res.status(400).json({ success: false, message: "Name is required." });
    if (!email)      return res.status(400).json({ success: false, message: "Email is required." });
    if (!phone)      return res.status(400).json({ success: false, message: "Phone is required." });
    if (experienceYears !== undefined && Number(experienceYears) < 0)
      return res.status(400).json({ success: false, message: "Experience cannot be negative." });
    if (rating !== undefined && (Number(rating) < 1 || Number(rating) > 5))
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });

    const job = await JobOpening.findById(jobOpening);
    if (!job) return res.status(404).json({ success: false, message: "Job opening not found." });
    if (job.status === "closed")
      return res.status(400).json({ success: false, message: "Cannot add candidates to a closed job opening." });

    const candidate = await Candidate.create({
      ...req.body,
      email:     email.toLowerCase(),
      resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : (req.body.resumeUrl || ""),
      addedBy:   req.user._id,
      updatedBy: req.user._id,
    });

    await candidate.populate("jobOpening", "title department");

    // Notify candidate of application receipt
    sendEmail({
      to:      candidate.email,
      subject: `Application Received — ${candidate.jobOpening?.title || "Position"}`,
      html:    candidateAddedTemplate({
        candidateName: candidate.name,
        jobTitle:      candidate.jobOpening?.title || "Open Position",
        stage:         candidate.stage || "applied",
      }),
    });

    res.status(201).json({ success: true, candidate });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: "This candidate has already applied for this job." });
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recruitment/candidates
const getCandidates = async (req, res) => {
  try {
    const { search = "", jobOpening, stage, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ name: re }, { email: re }, { phone: re }, { skills: re }];
    }
    if (jobOpening) query.jobOpening = jobOpening;
    if (stage)      query.stage      = stage;
    if (status)     query.status     = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Candidate.countDocuments(query);
    const candidates = await Candidate.find(query)
      .populate("jobOpening", "title department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      candidates,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recruitment/candidates/:id
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate("jobOpening", "title department designation employmentType location")
      .populate("interviewer", "name email");

    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found." });
    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/recruitment/candidates/:id
const updateCandidate = async (req, res) => {
  try {
    const updates = { ...req.body, updatedBy: req.user._id };
    delete updates.jobOpening; // immutable after creation

    if (updates.experienceYears !== undefined && Number(updates.experienceYears) < 0)
      return res.status(400).json({ success: false, message: "Experience cannot be negative." });
    if (updates.rating !== undefined && (Number(updates.rating) < 1 || Number(updates.rating) > 5))
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });

    const candidate = await Candidate.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate("jobOpening", "title department");

    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found." });
    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/recruitment/candidates/:id/stage
const updateCandidateStage = async (req, res) => {
  try {
    const { stage, status, notes, interviewDate, interviewer, interviewFeedback, rating } = req.body;

    const validStages = ["applied","screening","interview","technical","hr-round","selected","rejected","offered","joined"];
    if (stage && !validStages.includes(stage))
      return res.status(400).json({ success: false, message: "Invalid stage value." });

    const updates = { updatedBy: req.user._id };
    if (stage)            updates.stage            = stage;
    if (notes !== undefined)      updates.notes    = notes;
    if (interviewDate)    updates.interviewDate     = interviewDate;
    if (interviewer)      updates.interviewer       = interviewer;
    if (interviewFeedback !== undefined) updates.interviewFeedback = interviewFeedback;
    if (rating !== undefined && rating !== null) {
      if (Number(rating) < 1 || Number(rating) > 5)
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
      updates.rating = Number(rating);
    }

    // Auto-derive status from stage
    if (stage === "selected" || stage === "offered" || stage === "joined") updates.status = "selected";
    else if (stage === "rejected") updates.status = "rejected";
    else if (status) updates.status = status;

    const candidate = await Candidate.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("jobOpening", "title department");

    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found." });
    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/recruitment/candidates/:id  (admin only)
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found." });
    res.json({ success: true, message: "Candidate deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/recruitment/stats
const getRecruitmentStats = async (req, res) => {
  try {
    const [totalJobs, openJobs, closedJobs, totalCandidates, activeCandidates, selectedCandidates, rejectedCandidates] =
      await Promise.all([
        JobOpening.countDocuments(),
        JobOpening.countDocuments({ status: "open"   }),
        JobOpening.countDocuments({ status: "closed" }),
        Candidate.countDocuments(),
        Candidate.countDocuments({ status: "active"   }),
        Candidate.countDocuments({ status: "selected" }),
        Candidate.countDocuments({ status: "rejected" }),
      ]);

    const candidatesByStage = await Candidate.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);

    const jobsByDepartment = await JobOpening.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs, openJobs, closedJobs,
        totalCandidates, activeCandidates, selectedCandidates, rejectedCandidates,
        candidatesByStage, jobsByDepartment,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createJobOpening, getJobOpenings, getJobOpeningById, updateJobOpening, updateJobStatus, deleteJobOpening,
  addCandidate, getCandidates, getCandidateById, updateCandidate, updateCandidateStage, deleteCandidate,
  getRecruitmentStats,
};
