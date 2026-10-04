import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gradguide_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/api/auth/login');
    
    // Show popup alert for any API failure
    const errorMsg = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    toast.error(`Action Failed: ${errorMsg}`, { duration: 5000 });

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('gradguide_token');
      localStorage.removeItem('gradguide_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

export const coursesAPI = {
  recommend: (profile, limit = 10) =>
    api.post(`/api/courses/recommend?limit=${limit}`, profile),
  search: (query, filters = {}) =>
    api.post('/api/courses/search', { query, filters }),
  getAll: () => api.get('/api/courses/all'),
  getCountries: () => api.get('/api/courses/countries'),
  getFields: () => api.get('/api/courses/fields'),
  getLivingCosts: () => api.get('/api/courses/living-costs'),
  getCourse: (id) => api.get(`/api/courses/${id}`),
  getAlternatives: (id, limit = 5) =>
    api.get(`/api/courses/${id}/alternatives?limit=${limit}`),
  compare: (ids) => api.post('/api/courses/compare', ids),
  addNote: (data) => api.post('/api/courses/session-notes', data),
  getNotes: () => api.get('/api/courses/session-notes/all'),
};

export const loansAPI = {
  assess: (data) => api.post('/api/loans/assess', data),
  calculateCost: (data) => api.post('/api/loans/calculate-cost', data),
  calculateEMI: (principal, rate, tenure = 10) =>
    api.post(`/api/loans/calculate-emi?principal=${principal}&rate=${rate}&tenure=${tenure}`),
  getLenders: () => api.get('/api/loans/lenders'),
  uploadDocument: (file, docType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    return api.post('/api/loans/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getDocuments: () => api.get('/api/loans/documents'),
};

export const jobsAPI = {
  getListings: (params = {}) => api.get('/api/jobs/listings', { params }),
  getJob: (id) => api.get(`/api/jobs/listings/${id}`),
  saveJob: (data) => api.post('/api/jobs/save', data),
  getSaved: () => api.get('/api/jobs/saved'),
  removeSaved: (id) => api.delete(`/api/jobs/saved/${id}`),
  trackApplication: (jobId, status, notes = '') =>
    api.post(`/api/jobs/track-application?job_id=${jobId}&status=${status}&notes=${notes}`),
  getApplications: () => api.get('/api/jobs/applications'),
  getStats: () => api.get('/api/jobs/stats'),
  refresh: () => api.post('/api/jobs/refresh'),
};

export default api;
