import api from './api';

export const TestService = {
  testarConexao: async () => {
    try {
      // Tenta uma requisição GET simples
      const response = await api.get('/unidades');
      console.log('Conexão bem sucedida:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao testar conexão:', {
        mensagem: error.message,
        url: error.config?.url,
        método: error.config?.method,
        headers: error.config?.headers,
        response: error.response?.data || 'Sem resposta do servidor'
      });
      return false;
    }
  },

  testarEndpoints: async () => {
    const endpoints = [
      { url: '/unidades', método: 'GET' },
      { url: '/produtos', método: 'GET' },
      { url: '/carrinhos', método: 'GET' }
    ];

    console.log('Iniciando teste dos endpoints...');
    
    const resultados = await Promise.all(
      endpoints.map(async ({ url, método }) => {
        try {
          console.log(`Testando ${método} ${url}...`);
          const response = await api.request({
            url,
            method: método
          });
          
          return {
            endpoint: url,
            método,
            status: 'sucesso',
            statusCode: response.status,
            dados: response.data
          };
        } catch (error: any) {
          return {
            endpoint: url,
            método,
            status: 'erro',
            statusCode: error.response?.status,
            mensagem: error.message,
            detalhes: error.response?.data || 'Sem resposta do servidor'
          };
        }
      })
    );

    console.log('Resultados dos testes:', JSON.stringify(resultados, null, 2));
    return resultados;
  }
}; 