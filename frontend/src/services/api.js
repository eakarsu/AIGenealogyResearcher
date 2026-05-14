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

// Handle 401 and 429 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    if (error.response && error.response.status === 429) {
      const rateLimitError = new Error(
        (error.response.data && error.response.data.error) ||
        'AI rate limit exceeded. Max 20 requests per hour. Please try again later.'
      );
      rateLimitError.isRateLimit = true;
      return Promise.reject(rateLimitError);
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
export const getAll = async (table, page = 1, limit = 20) => {
  const res = await api.get(`/${toRoute(table)}?page=${page}&limit=${limit}`);
  // Support both paginated { data, pagination } and plain array responses
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

// Relationships
export const getRelationships = async (page = 1, limit = 20) => {
  const res = await api.get(`/relationships?page=${page}&limit=${limit}`);
  return res.data;
};

export const createRelationship = async (data) => {
  const res = await api.post('/relationships', data);
  return res.data;
};

export const deleteRelationship = async (id) => {
  const res = await api.delete(`/relationships/${id}`);
  return res.data;
};

export default api;
