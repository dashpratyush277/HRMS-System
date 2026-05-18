import api from "./axios";

export const exportPayslipPDF      = (payrollId)     => api.get(`/exports/payslip/${payrollId}/pdf`, { responseType: "blob" });
export const exportAttendanceExcel = (params = {})   => api.get("/exports/attendance/excel", { params, responseType: "blob" });
export const exportLeavesExcel     = (params = {})   => api.get("/exports/leaves/excel",     { params, responseType: "blob" });
export const exportPayrollExcel    = (params = {})   => api.get("/exports/payroll/excel",    { params, responseType: "blob" });
export const exportEmployeesExcel  = (params = {})   => api.get("/exports/employees/excel",  { params, responseType: "blob" });
