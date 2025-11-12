import axios from 'axios';

const API_BASE_URL = 'http://99.79.46.88/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add JWT token
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

// Response interceptor for token refresh and error handling
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
      // Don't auto-logout on 403, just log the error
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
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
  getCurrentUser: async () => (await api.get('/auth/user/')).data,
};

// Box API
export const boxesAPI = {
  getAll: async () => (await api.get('/boxes/')).data,
  getById: async (id: number) => (await api.get(`/boxes/${id}/`)).data,
  create: async (data: any) => (await api.post('/boxes/', data)).data,
  update: async (id: number, data: any) => (await api.patch(`/boxes/${id}/`, data)).data,
  delete: async (id: number) => await api.delete(`/boxes/${id}/`),
  finalize: async (id: number) => (await api.post(`/boxes/${id}/finalize/`)).data,
  unfinalize: async (id: number) => (await api.post(`/boxes/${id}/unfinalize/`)).data,
  uploadPhoto: async (id: number, photoField: string, file: File) => {
    const formData = new FormData();
    formData.append(photoField, file);
    const response = await api.patch(`/boxes/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Part API
export const partsAPI = {
  getAll: async () => (await api.get('/parts/')).data,
  getByBox: async (boxId: number) => (await api.get(`/parts/?box=${boxId}`)).data,
  getById: async (id: number) => (await api.get(`/parts/${id}/`)).data,
  create: async (data: any) => (await api.post('/parts/', data)).data,
  update: async (id: number, data: any) => (await api.patch(`/parts/${id}/`, data)).data,
  delete: async (id: number) => await api.delete(`/parts/${id}/`),
  uploadPhoto: async (id: number, photoField: string, file: File) => {
    const formData = new FormData();
    formData.append(photoField, file);
    const response = await api.patch(`/parts/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Sale API
export const salesAPI = {
  getAll: async () => (await api.get('/sales/')).data,
  getById: async (id: number) => (await api.get(`/sales/${id}/`)).data,
  create: async (data: any) => (await api.post('/sales/', data)).data,
  update: async (id: number, data: any) => (await api.patch(`/sales/${id}/`, data)).data,
  delete: async (id: number) => await api.delete(`/sales/${id}/`),
  publish: async (id: number) => (await api.post(`/sales/${id}/publish/`)).data,
  close: async (id: number) => (await api.post(`/sales/${id}/close/`)).data,
  getBids: async (id: number) => (await api.get(`/sales/${id}/bids/`)).data,
  getMarketplace: async () => (await api.get('/sales/marketplace/')).data,
};

// Bid API
export const bidsAPI = {
  getAll: async () => (await api.get('/bids/')).data,
  getMyBids: async () => (await api.get('/bids/my_bids/')).data,
  getById: async (id: number) => (await api.get(`/bids/${id}/`)).data,
  create: async (data: any) => (await api.post('/bids/', data)).data,
  update: async (id: number, data: any) => (await api.patch(`/bids/${id}/`, data)).data,
  accept: async (id: number) => (await api.post(`/bids/${id}/accept/`)).data,
  reject: async (id: number) => (await api.post(`/bids/${id}/reject/`)).data,
};
