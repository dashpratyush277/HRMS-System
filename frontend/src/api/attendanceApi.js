import api from "./axios";

export const getAttendance        = (params = {}) => api.get("/attendance", { params });
export const getAttendanceById    = (id)          => api.get(`/attendance/${id}`);
export const markAttendance       = (data)        => api.post("/attendance", data);
export const bulkMarkAttendance   = (records)     => api.post("/attendance/bulk", { records });
export const updateAttendance     = (id, data)    => api.put(`/attendance/${id}`, data);
export const deleteAttendance     = (id)          => api.delete(`/attendance/${id}`);
export const getAttendanceStats   = (params = {}) => api.get("/attendance/stats", { params });
export const getMyAttendance      = (params = {}) => api.get("/attendance/my", { params });
export const getEmployeeAttendance = (employeeId, params = {}) =>
  api.get(`/attendance/employee/${employeeId}`, { params });
