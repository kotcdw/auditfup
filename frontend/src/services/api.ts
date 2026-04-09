import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) => 
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id: number, data: { name: string; email: string; role: string }) => 
    api.put(`/auth/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', data)
};

export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const findingsAPI = {
  getAll: (params?: { status?: string; risk_level?: string; department?: string; search?: string }) => 
    api.get('/findings', { params }),
  getById: (id: number) => api.get(`/findings/${id}`),
  create: (data: any) => api.post('/findings', data),
  update: (id: number, data: any) => api.put(`/findings/${id}`, data),
  delete: (id: number) => api.delete(`/findings/${id}`),
  addComment: (id: number, comment: string) => 
    api.post(`/findings/${id}/comments`, { comment }),
  getStats: () => api.get('/findings/stats')
};

export default api;