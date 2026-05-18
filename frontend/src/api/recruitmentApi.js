import api from "./axios";

// Job Openings
export const getJobOpenings    = (params) => api.get("/recruitment/jobs", { params });
export const getJobOpeningById = (id)     => api.get(`/recruitment/jobs/${id}`);
export const createJobOpening  = (data)   => api.post("/recruitment/jobs", data);
export const updateJobOpening  = (id, data) => api.put(`/recruitment/jobs/${id}`, data);
export const updateJobStatus   = (id, status) => api.put(`/recruitment/jobs/${id}/status`, { status });
export const deleteJobOpening  = (id)     => api.delete(`/recruitment/jobs/${id}`);

// Candidates
export const getCandidates       = (params)     => api.get("/recruitment/candidates", { params });
export const getCandidateById    = (id)         => api.get(`/recruitment/candidates/${id}`);
export const addCandidate        = (data)       => api.post("/recruitment/candidates", data);
export const updateCandidate     = (id, data)   => api.put(`/recruitment/candidates/${id}`, data);
export const updateCandidateStage = (id, data)  => api.put(`/recruitment/candidates/${id}/stage`, data);
export const deleteCandidate     = (id)         => api.delete(`/recruitment/candidates/${id}`);

// Stats
export const getRecruitmentStats = () => api.get("/recruitment/stats");
