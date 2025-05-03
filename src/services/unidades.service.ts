import api from './api';

export interface Unidade {
  id_unidade: number;
  idunidade: string;
  nomeunidade: string;
  tipo: string;
  pessoa: string;
  email: string;
  recado: string;
  fone: string;
  celular: string;
  comercial: string;
  id_carrinho?: number;
  data_carrinho?: string;
  status_carrinho?: string;
  status_retirada?: string;
  total_carrinho?: number;
}

export interface FiltroUnidade {
  nomeunidade?: string;
  pessoa?: string;
  id_carrinho?: number;
  status_carrinho?: string;
  status_retirada?: string;
}

export const UnidadesService = {
  listar: async (filtros?: FiltroUnidade) => {
    try {
      console.log('Iniciando busca com filtros:', filtros);
      
      const response = await api.get<Unidade[]>('/api/v1/unidades', { 
        params: filtros
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro na busca:', error);
      throw error;
    }
  },

  excluir: async (id: number) => {
    try {
      await api.delete(`/api/v1/unidades/${id}`);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      throw error;
    }
  }
};