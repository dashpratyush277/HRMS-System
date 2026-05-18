import api from "./axios";

export const generatePayroll      = (data)        => api.post("/payroll", data);
export const generateBulkPayroll  = (data)        => api.post("/payroll/bulk", data);
export const getPayrolls          = (params = {}) => api.get("/payroll", { params });
export const getPayrollById       = (id)          => api.get(`/payroll/${id}`);
export const updatePayroll        = (id, data)    => api.put(`/payroll/${id}`, data);
export const updatePaymentStatus  = (id, data)    => api.put(`/payroll/${id}/status`, data);
export const deletePayroll        = (id)          => api.delete(`/payroll/${id}`);
export const getMyPayslips        = (params = {}) => api.get("/payroll/my", { params });
export const getPayrollStats      = (params = {}) => api.get("/payroll/stats", { params });
