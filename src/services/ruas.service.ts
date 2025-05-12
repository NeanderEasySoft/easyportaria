import api from './api';

export interface Rua {
  idrua: number;
  nomerua: string;
}

export const RuasService = {
  listar: async (): Promise<Rua[]> => {
    try {
      const response = await api.get<Rua[]>('/api/v1/ruas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lista de ruas:', error);
      throw error; // Ou tratar o erro de forma mais específica
    }
  },
}; 