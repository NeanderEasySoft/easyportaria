import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const api = axios.create(API_CONFIG);

// Interceptor para logs
api.interceptors.request.use(request => {
  console.log('Enviando requisição:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    params: request.params
  });
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Resposta recebida:', response.data);
    return response;
  },
  error => {
    console.error('Erro na requisição:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;