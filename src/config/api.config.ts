// Configuração da API com suporte a variáveis de ambiente
// Última atualização: Configuração do Amplify
import axios from 'axios';

const getBaseUrl = () => {
  // Em desenvolvimento, usa HTTP direto
  if (!import.meta.env.PROD) {
    return 'http://200.150.203.85:9031';
  }
  
  // Em produção, usa a URL do API Gateway
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn('VITE_API_URL não está configurada no ambiente de produção');
    return 'http://200.150.203.85:9031'; // fallback
  }
  return apiUrl;
};

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  }
};

// Criar instância do axios
const api = axios.create(API_CONFIG);

// Adicionar interceptors para debug
api.interceptors.request.use(
  (config) => {
    // Log detalhado da requisição
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('Enviando requisição:', {
      método: config.method?.toUpperCase(),
      url: fullUrl,
      headers: config.headers,
      dados: config.data,
      parâmetros: config.params
    });

    return config;
  },
  (error) => {
    console.error('Erro ao preparar requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida com sucesso:', {
      status: response.status,
      dados: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro na resposta do servidor:', {
        status: error.response.status,
        dados: error.response.data,
        headers: error.response.headers,
        url: error.config.url
      });
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Erro de conexão:', {
        mensagem: 'Não foi possível conectar ao servidor.',
        detalhes: `Verifique se o servidor está rodando em ${getBaseUrl()}`,
        erro: error.message,
        url: error.config.url
      });
    } else {
      // Erro na configuração da requisição
      console.error('Erro na configuração:', {
        mensagem: 'Erro ao configurar a requisição',
        erro: error.message
      });
    }
    return Promise.reject(error);
  }
);

// Teste de conexão inicial
console.log('Tentando conectar ao servidor:', getBaseUrl());
api.get('/ping')
  .then(() => {
    console.log('✅ API conectada com sucesso');
    // Testa a rota de unidades após o ping bem sucedido
    return api.get('/api/v1/unidades')
      .then(() => console.log('✅ Rota /api/v1/unidades funcionando'))
      .catch((error) => console.warn('⚠️ Erro ao acessar /api/v1/unidades:', error.message));
  })
  .catch((error) => {
    console.warn('⚠️ Não foi possível conectar à API:', error.message);
    console.log('Verifique se:');
    console.log('1. O servidor está acessível em', getBaseUrl());
    console.log('2. O servidor está respondendo a requisições HTTP');
  });

// URLs base para diferentes recursos
export const API_URLS = {
  base: getBaseUrl(),
  api: `${getBaseUrl()}/api/v1`
};

export default api; 