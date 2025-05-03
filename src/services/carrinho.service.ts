import api from './api';

export interface CarrinhoItem {
  id_carrinho?: number;
  id_carrinho_item?: number;
  id_produto: number;
  quantidade: number;
}

export interface Carrinho {
  id_carrinho?: number;
  id_unidade: number;
  data?: string;
  total: number;
  status: string;
  status_retirada?: string;
  itens: CarrinhoItem[];
}

export interface CarrinhoListagem {
  id_carrinho: number;
  id_unidade: number;
  data: string;
  total: number;
  status: string;
  status_retirada: string;
  nomeunidade: string;
}

class CarrinhoService {
  private readonly baseUrl = '/api/v1/carrinhos';

  async listar(): Promise<CarrinhoListagem[]> {
    const response = await api.get<CarrinhoListagem[]>(this.baseUrl);
    return response.data;
  }

  async buscarPorId(id: number): Promise<Carrinho> {
    const response = await api.get<Carrinho>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async buscarPorUnidade(idUnidade: number): Promise<CarrinhoListagem[]> {
    const response = await api.get<CarrinhoListagem[]>(`${this.baseUrl}/unidade/${idUnidade}`);
    return response.data;
  }

  async criar(carrinho: Carrinho): Promise<Carrinho> {
    const response = await api.post<Carrinho>(this.baseUrl, carrinho);
    return response.data;
  }

  async atualizar(id: number, carrinho: Omit<Carrinho, 'id_carrinho'>): Promise<Carrinho> {
    const response = await api.put<Carrinho>(`${this.baseUrl}/${id}`, carrinho);
    return response.data;
  }

  async atualizarStatus(id: number, status: string): Promise<Carrinho> {
    const response = await api.patch<Carrinho>(`${this.baseUrl}/${id}/status`, { status });
    return response.data;
  }

  async atualizarStatusRetirada(id: number, statusRetirada: string): Promise<Carrinho> {
    const response = await api.patch<Carrinho>(`${this.baseUrl}/${id}/status-retirada`, { status_retirada: statusRetirada });
    return response.data;
  }

  async excluir(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export default new CarrinhoService(); 