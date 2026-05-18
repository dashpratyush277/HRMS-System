import api from "./axios";

export const applyLeave          = (data)               => api.post("/leaves", data);
export const getLeaves           = (params = {})        => api.get("/leaves", { params });
export const getLeaveById        = (id)                 => api.get(`/leaves/${id}`);
export const updateLeaveStatus   = (id, data)           => api.put(`/leaves/${id}/status`, data);
export const cancelLeave         = (id)                 => api.put(`/leaves/${id}/cancel`);
export const getMyLeaves         = (params = {})        => api.get("/leaves/my", { params });
export const getLeaveBalance     = (employeeId, params = {}) => api.get(`/leaves/balance/${employeeId}`, { params });
export const getMyLeaveBalance   = (params = {})        => api.get("/leaves/my/balance", { params });
export const updateLeaveBalance  = (employeeId, data, params = {}) => api.put(`/leaves/balance/${employeeId}`, data, { params });
export const getLeaveStats       = (params = {})        => api.get("/leaves/stats", { params });
