import axios from 'axios';

const API_BASE_URL = 'http://99.79.46.88/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 403) {
      console.error('Permission denied. Check your role and authentication.');
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },
  getCurrentUser: async () => (await api.get('/users/me/')).data,
};

export const boxesAPI = {
  getAll: async () => (await api.get('/boxes/')).data,
  getById: async (id: number) => (await api.get(`/boxes/${id}/`)).data,
  create: async (data: any) => (await api.post('/boxes/', data)).data,
  update: async (id: number, data: any) => (await api.patch(`/boxes/${id}/`, data)).data,
  finalize: async (id: number) => (await api.post(`/boxes/${id}/finalize/`)).data,
  uploadPhoto: async (id: number, photoField: string, file: File) => {
    const formData = new FormData();
    formData.append(photoField, file);
    const response = await api.patch(`/boxes/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const partsAPI = {
  getAll: async () => (await api.get('/parts/')).data,
  create: async (data: any) => (await api.post('/parts/', data)).data,
  update: async (id: number, data: any) => (await api.patch(`/parts/${id}/`, data)).data,
  delete: async (id: number) => await api.delete(`/parts/${id}/`),
};

export const salesAPI = {
  getAll: async () => (await api.get('/sales/')).data,
  getById: async (id: number) => (await api.get(`/sales/${id}/`)).data,
  create: async (data: any) => (await api.post('/sales/', data)).data,
  publish: async (id: number) => (await api.post(`/sales/${id}/publish/`)).data,
  getBids: async (id: number) => (await api.get(`/sales/${id}/bids/`)).data,
};

export const bidsAPI = {
  getMyBids: async () => (await api.get('/bids/my-bids/')).data,
  create: async (data: any) => (await api.post('/bids/', data)).data,
  approve: async (id: number) => (await api.patch(`/bids/${id}/approve/`)).data,
  decline: async (id: number) => (await api.patch(`/bids/${id}/decline/`)).data,
};