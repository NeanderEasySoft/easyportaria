import axios from 'axios';
import { API_URLS } from '../config/api.config';

export interface Produto {
  id_produto: number;
  descricao: string;
  valor: number;
  status: string;
}

export interface FiltroProduto {
  descricao?: string;
}

class ProdutosService {
  static async listar(filtros?: FiltroProduto): Promise<Produto[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.descricao) {
        params.append('descricao', filtros.descricao);
      }

      const response = await axios.get(`${API_URLS.api}/produtos`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao listar produtos');
    }
  }

  static async buscarPorId(id: number): Promise<Produto> {
    try {
      const response = await axios.get(`${API_URLS.api}/produtos/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao buscar produto');
    }
  }

  static async criar(produto: Omit<Produto, 'id_produto'>): Promise<Produto> {
    try {
      const response = await axios.post(`${API_URLS.api}/produtos`, produto);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao criar produto');
    }
  }

  static async atualizar(id: number, produto: Omit<Produto, 'id_produto'>): Promise<Produto> {
    try {
      const response = await axios.put(`${API_URLS.api}/produtos/${id}`, produto);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao atualizar produto');
    }
  }

  static async excluir(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URLS.api}/produtos/${id}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export default ProdutosService;