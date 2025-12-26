// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  ROOT: '/',
  UPLOAD_CSV: '/upload-csv',
  CLEAN_DATA: '/clean-data',
  TRAIN_MODEL: '/train-model',
  GET_METRICS: '/metrics',
  PREDICT: '/predict',
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export default API_BASE_URL;