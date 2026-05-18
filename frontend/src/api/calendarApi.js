import api from "./axios";

export const getMyCalendar   = (params = {}) => api.get("/calendar/my",   { params });
export const getTeamCalendar = (params = {}) => api.get("/calendar/team", { params });
