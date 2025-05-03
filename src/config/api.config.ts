// Configuração da API com suporte a variáveis de ambiente
// Última atualização: Configuração do Amplify
import axios from 'axios';

const getBaseUrl = () => {
  // Em desenvolvimento, usa HTTP direto
  if (!import.meta.env.PROD) {
    return 'http://200.150.203.85:9031';
  }
  
  // Em produção, usa a URL do API Gateway (que será configurada no Amplify)
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn('VITE_API_URL não está configurada no ambiente de produção');
    return 'http://200.150.203.85:9031'; // fallback
  }
  return apiUrl;
};

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: function (status: number) {
    console.log('Response status:', status);
    return status >= 200 && status < 300;
  }
};

// Criar instância do axios
const api = axios.create(API_CONFIG);

// Adicionar interceptors para debug
api.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
    return Promise.reject(error);
  }
);

// URLs base para diferentes recursos
export const API_URLS = {
  base: API_CONFIG.baseURL,
  api: `${API_CONFIG.baseURL}/api`
};

export default api; 