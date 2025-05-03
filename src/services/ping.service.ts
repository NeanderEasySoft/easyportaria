import api from './api';
import axios from 'axios';

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
    if (axios.isAxiosError(error)) {
      console.error('Erro detalhado do Axios:', {
        config: error.config,
        response_status: error.response?.status,
        response_data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Erro desconhecido:', error);
    }
    throw error;
  }
};