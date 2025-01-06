import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('Using API URL:', API_URL); // API URL'ini kontrol et

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url?.startsWith('/') ? config.url : `/${config.url}`;
    config.url = url;
    console.log('API isteği:', `${config.baseURL}${url}`);
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API yanıtı başarılı:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API error:', {
      url: error.config?.url,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Event API fonksiyonları
export const eventAPI = {
  getEvents: async () => {
    try {
      console.log('Events getiriliyor...');
      const response = await api.get('/api/events');
      console.log('Events alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Events getirme hatası:', error);
      throw error;
    }
  },

  createEvent: async (eventData: any) => {
    try {
      console.log('Event oluşturuluyor:', eventData);
      const response = await api.post('/api/events', eventData);
      console.log('Event oluşturuldu:', response.data);
      return response.data;
    } catch (error) {
      console.error('Event oluşturma hatası:', error);
      throw error;
    }
  },

  addResponse: async (eventId: string, responseData: any) => {
    try {
      console.log('Yanıt ekleniyor:', { eventId, responseData });
      const response = await api.post(`/api/events/${eventId}/responses`, responseData);
      console.log('Yanıt eklendi:', response.data);
      return response.data;
    } catch (error) {
      console.error('Yanıt ekleme hatası:', error);
      throw error;
    }
  }
};

// Test fonksiyonu
export const testAPI = async () => {
  try {
    const response = await api.get('/api/status');
    console.log('API test sonucu:', response.data);
    return response.data;
  } catch (error) {
    console.error('API test hatası:', error);
    throw error;
  }
};

export default api; 