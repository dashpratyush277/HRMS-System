import api from "./axios";

// Goals
export const getGoals           = (params)     => api.get("/performance/goals", { params });
export const getGoalById        = (id)         => api.get(`/performance/goals/${id}`);
export const createGoal         = (data)       => api.post("/performance/goals", data);
export const updateGoal         = (id, data)   => api.put(`/performance/goals/${id}`, data);
export const updateGoalProgress = (id, data)   => api.put(`/performance/goals/${id}/progress`, data);
export const deleteGoal         = (id)         => api.delete(`/performance/goals/${id}`);
export const getMyGoals         = (params)     => api.get("/performance/my-goals", { params });

// Reviews
export const getReviews          = (params)    => api.get("/performance/reviews", { params });
export const getReviewById       = (id)        => api.get(`/performance/reviews/${id}`);
export const createReview        = (data)      => api.post("/performance/reviews", data);
export const updateReview        = (id, data)  => api.put(`/performance/reviews/${id}`, data);
export const updateReviewStatus  = (id, data)  => api.put(`/performance/reviews/${id}/status`, data);
export const deleteReview        = (id)        => api.delete(`/performance/reviews/${id}`);
export const getMyReviews        = (params)    => api.get("/performance/my-reviews", { params });

// Stats
export const getPerformanceStats = () => api.get("/performance/stats");
