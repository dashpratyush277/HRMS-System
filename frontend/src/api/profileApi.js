import api from "./axios";

export const getMyProfile       = ()       => api.get("/profile/me");
export const updateMyProfile    = (data)   => api.put("/profile/me", data);
export const changePassword     = (data)   => api.put("/profile/change-password", data);
export const getMyProfileSummary = ()      => api.get("/profile/summary");
