import api from "./axios";

export const getAuditLogs   = (params = {}) => api.get("/audit-logs", { params });
export const getAuditStats  = ()            => api.get("/audit-logs/stats");
export const getAuditLogById = (id)         => api.get(`/audit-logs/${id}`);
