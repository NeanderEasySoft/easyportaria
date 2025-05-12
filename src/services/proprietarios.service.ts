import api from './api';

export interface proprietarios {
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
}

export interface FiltroUnidade {
  nomeunidade?: string;
  pessoa?: string;
}

export interface Unidade {
  id_unidade: number;
  idunidade: string;
  nomeunidade: string;
  tipo: string;
  pessoa: string;
  email: string | null;
  recado: string | null;
  fone: string | null;
  celular: string | null;
  comercial: string | null;
  endereco: string | null;
  numero: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
}


export const UnidadesService = {
  listar: async (filtros?: FiltroUnidade): Promise<Unidade[]> => {
    try {
      console.log('Enviando para /api/v1/unidadesall com filtros:', filtros);
      const response = await api.get<Unidade[]>('/api/v1/unidadesall', { 
        params: filtros 
      });
      return response.data;
    } catch (error) {
      console.error('Erro na busca (proprietarios.service.ts):', error);
      throw error;
    }
  },

  atualizar: async (id: number, dadosUnidade: Partial<Unidade>): Promise<Unidade> => {
    try {
      const response = await api.put<Unidade>(`/api/v1/unidades/${id}`, dadosUnidade);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar unidade (proprietarios.service.ts):', error);
      throw error;
    }
  },

  criar: async (dadosUnidade: Partial<Unidade>): Promise<Unidade> => {
    try {
      // O frontend envia dadosUnidade com chaves minúsculas
      // O backend (DoPostUnidade e TUnidadeService.CreateUnidade) PRECISA esperar chaves minúsculas
      // e retornar a unidade criada com chaves minúsculas.
      const response = await api.post<Unidade>('/api/v1/unidades', dadosUnidade);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar unidade (proprietarios.service.ts):', error);
      throw error;
    }
  },

  excluir: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/v1/unidades/${id}`);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      throw error;
    }
  }
};