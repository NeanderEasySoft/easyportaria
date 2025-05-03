import api from './api';

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
      const response = await api.get('/api/v1/produtos', { 
        params: filtros 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao listar produtos');
    }
  }

  static async buscarPorId(id: number): Promise<Produto> {
    try {
      const response = await api.get(`/api/v1/produtos/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao buscar produto');
    }
  }

  static async criar(produto: Omit<Produto, 'id_produto'>): Promise<Produto> {
    try {
      const response = await api.post('/api/v1/produtos', produto);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao criar produto');
    }
  }

  static async atualizar(id: number, produto: Omit<Produto, 'id_produto'>): Promise<Produto> {
    try {
      const response = await api.put(`/api/v1/produtos/${id}`, produto);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data || 'Erro ao atualizar produto');
    }
  }

  static async excluir(id: number): Promise<void> {
    try {
      await api.delete(`/api/v1/produtos/${id}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export default ProdutosService;