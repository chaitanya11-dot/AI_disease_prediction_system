import api from "./client";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

export const predictionApi = {
  getSymptoms: (search = "") => api.get(`/symptoms${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  predict: (data) => api.post("/predict", data),
  dashboardStats: () => api.get("/dashboard/stats"),
};

export const diseaseApi = {
  list: (params = {}) => api.get("/diseases", { params }),
  getById: (id) => api.get(`/diseases/${id}`),
  getByName: (name) => api.get(`/diseases/by-name/${encodeURIComponent(name)}`),
};

export const historyApi = {
  list: (params = {}) => api.get("/history", { params }),
  getDetail: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
  clearAll: () => api.delete("/history/clear-all"),
};

export const reportApi = {
  downloadUrl: (predictionId) => `${api.defaults.baseURL}/report/download/${predictionId}`,
  download: (predictionId) => api.get(`/report/download/${predictionId}`, { responseType: "blob" }),
  email: (predictionId) => api.post(`/report/email/${predictionId}`),
};

export const chatbotApi = {
  sendMessage: (message, history = []) => api.post("/chatbot/message", { message, history }),
};

export const adminApi = {
  analytics: () => api.get("/admin/analytics"),
  listUsers: (params = {}) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  listDiseases: () => api.get("/admin/diseases"),
  createDisease: (data) => api.post("/admin/diseases", data),
  updateDisease: (id, data) => api.put(`/admin/diseases/${id}`, data),
  deleteDisease: (id) => api.delete(`/admin/diseases/${id}`),
  listPredictions: (params = {}) => api.get("/admin/predictions", { params }),
  systemStatus: () => api.get("/admin/system-status"),
};
