import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (name, email, password) => {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// Convert table names: underscores to hyphens to match backend routes
const toRoute = (table) => table.replace(/_/g, '-');

// CRUD
export const getAll = async (table) => {
  const res = await api.get(`/${toRoute(table)}`);
  return res.data;
};

export const getById = async (table, id) => {
  const res = await api.get(`/${toRoute(table)}/${id}`);
  return res.data;
};

export const create = async (table, data) => {
  const res = await api.post(`/${toRoute(table)}`, data);
  return res.data;
};

export const update = async (table, id, data) => {
  const res = await api.put(`/${toRoute(table)}/${id}`, data);
  return res.data;
};

export const deleteRecord = async (table, id) => {
  const res = await api.delete(`/${toRoute(table)}/${id}`);
  return res.data;
};

// AI
export const aiQuery = async (feature, data) => {
  const res = await api.post(`/ai/${feature}`, data);
  return res.data;
};

export default api;
