import api from './api';

interface PingResponse {
  message: string;
}

export const pingServer = async (): Promise<PingResponse> => {
  try {
    const response = await api.get<PingResponse>('/ping');
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer ping:', error);
    throw error;
  }
};