import api from "./axios";

export const getDepartments     = (params = {}) => api.get("/departments", { params });
export const getDepartmentById  = (id)          => api.get(`/departments/${id}`);
export const createDepartment   = (data)        => api.post("/departments", data);
export const updateDepartment   = (id, data)    => api.put(`/departments/${id}`, data);
export const deleteDepartment   = (id)          => api.delete(`/departments/${id}`);
export const getDepartmentStats = ()            => api.get("/departments/stats");
