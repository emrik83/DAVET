import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://davet-f52s.onrender.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API İsteği:', {
      method: config.method,
      url: `${API_URL}${config.url}`,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Yanıtı:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Hatası:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const createEvent = async (eventData: any) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Event oluşturma hatası:', error);
    throw error;
  }
};

export const getEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error('Event getirme hatası:', error);
    throw error;
  }
};

export const addResponse = async (eventId: string, responseData: any) => {
  try {
    const response = await api.post(`/events/${eventId}/responses`, responseData);
    return response.data;
  } catch (error) {
    console.error('Yanıt ekleme hatası:', error);
    throw error;
  }
};

export const checkApiStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('API durum kontrolü hatası:', error);
    throw error;
  }
}; 