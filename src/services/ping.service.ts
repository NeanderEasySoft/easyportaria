import api from './api';

interface PingResponse {
  message: string;
}

export const pingServer = async (): Promise<PingResponse> => {
  try {
    console.log('Tentando fazer ping no servidor...');
    
    const response = await api.get<PingResponse>('/ping');
    
    console.log('Resposta do servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro detalhado:', {
      error,
      config: error?.config,
      response: error?.response,
      message: error?.message
    });
    throw error;
  }
};