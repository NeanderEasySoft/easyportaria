import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  TablePagination,
  Fade,
  styled,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableFooter,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddCircleIcon,
  Remove as RemoveCircleIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { UnidadesService, Unidade, FiltroUnidade } from '../services/unidades.service';
import ProdutosService, { Produto } from '../services/produtos.service';
import CarrinhoService from '../services/carrinho.service';

// Estilização para células da tabela
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
}));

// Estilização para linhas da tabela
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledStatus = styled('span')<{ status: string }>(({ status }) => {
  let backgroundColor = '#e0e0e0';
  let color = '#000000';

  switch (status) {
    case 'Ativo':
      backgroundColor = '#4caf50';
      color = '#ffffff';
      break;
    case 'Inativo':
      backgroundColor = '#f44336';
      color = '#ffffff';
      break;
  }

  return {
    backgroundColor,
    color,
    padding: '3px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    fontSize: '0.875rem',
    fontWeight: '500',
  };
});

const StyledStatusRetirada = styled('span')<{ status: string }>(({ status }) => {
  let backgroundColor = '#e0e0e0';
  let color = '#000000';

  switch (status) {
    case 'Retirado':
      backgroundColor = '#4caf50';
      color = '#ffffff';
      break;
    case 'Não Retirado':
      backgroundColor = '#f44336';
      color = '#ffffff';
      break;
  }

  return {
    backgroundColor,
    color,
    padding: '3px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    fontSize: '0.875rem',
    fontWeight: '500',
  };
});

export default function Unidades() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [nomeUnidade, setNomeUnidade] = useState('');
  const [nomePessoa, setNomePessoa] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');
  const [statusCarrinho, setStatusCarrinho] = useState('');
  const [statusRetirada, setStatusRetirada] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalCarrinhoAberto, setModalCarrinhoAberto] = useState(false);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<Unidade | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [quantidades, setQuantidades] = useState<{ [key: number]: number }>({});
  const [dataCarrinho, setDataCarrinho] = useState<Date>(new Date());
  const [statusCarrinhoModal, setStatusCarrinhoModal] = useState<string>('Aberto');
  const [statusRetiradaCarrinhoModal, setStatusRetiradaCarrinhoModal] = useState<string>('Aguardando');
  const [carrinhoExistente, setCarrinhoExistente] = useState<boolean>(false);
  const [carrinhoId, setCarrinhoId] = useState<number | null>(null);
  const [erroCarrinho, setErroCarrinho] = useState<string>('');

  // Função auxiliar para converter data do formato brasileiro para Date
  const converterDataBrParaDate = (dataBr: string): Date => {
    const [data, hora] = dataBr.split(' ');
    const [dia, mes, ano] = data.split('/');
    const [horas, minutos] = hora.split(':');
    return new Date(Number(ano), Number(mes) - 1, Number(dia), Number(horas), Number(minutos));
  };

  // Função auxiliar para formatar data para o input datetime-local
  const formatarDataParaInput = (data: Date): string => {
    const offset = data.getTimezoneOffset();
    const dataLocal = new Date(data.getTime() - (offset * 60 * 1000));
    return dataLocal.toISOString().slice(0, 16);
  };

  const formatarDataParaBackend = (data: Date): string => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '');
  };

  const buscarUnidades = async () => {
    try {
      setLoading(true);
      setErro('');
      
      const filtros: FiltroUnidade = {};
      if (nomeUnidade) filtros.nomeunidade = nomeUnidade;
      if (nomePessoa) filtros.pessoa = nomePessoa;
      if (numeroPedido) filtros.id_carrinho = Number(numeroPedido);
      if (statusCarrinho) filtros.status_carrinho = statusCarrinho;
      if (statusRetirada) filtros.status_retirada = statusRetirada;
      
      const data = await UnidadesService.listar(filtros);
      // Ordena as unidades por nome
      const unidadesOrdenadas = [...data].sort((a, b) => 
        a.nomeunidade.localeCompare(b.nomeunidade, 'pt-BR')
      );
      setUnidades(unidadesOrdenadas);
      setPage(0);
    } catch (error: any) {
      setErro(`Erro ao buscar unidades: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const carregarProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const data = await ProdutosService.listar();
      // Filtra apenas produtos ativos
      setProdutos(data.filter(produto => produto.status === 'Ativo'));
    } catch (error: any) {
      setErro(`Erro ao carregar produtos: ${error.message}`);
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarUnidades();
    }, 500);

    return () => clearTimeout(timer);
  }, [nomeUnidade, nomePessoa, numeroPedido, statusCarrinho, statusRetirada]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const unidadesPaginadas = unidades.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAbrirCarrinho = async (unidade: Unidade) => {
    try {
      setLoading(true);
      setErroCarrinho('');
      setUnidadeSelecionada(unidade);

      // Busca carrinhos da unidade
      const carrinhos = await CarrinhoService.buscarPorUnidade(unidade.id_unidade);
      
      // Pega o carrinho mais recente (primeiro da lista, já que vem ordenado por data DESC)
      const ultimoCarrinho = carrinhos[0];

      if (ultimoCarrinho) {
        // Se encontrou carrinho, carrega os dados dele
        const carrinhoDetalhado = await CarrinhoService.buscarPorId(ultimoCarrinho.id_carrinho);
        
        setCarrinhoId(ultimoCarrinho.id_carrinho);
        setCarrinhoExistente(true);
        // Converte a data do formato brasileiro para Date
        setDataCarrinho(converterDataBrParaDate(ultimoCarrinho.data));
        setStatusCarrinhoModal(ultimoCarrinho.status);
        setStatusRetiradaCarrinhoModal(ultimoCarrinho.status_retirada);

        // Carrega os produtos e depois configura as quantidades
        await carregarProdutos();
        
        // Configura as quantidades dos itens existentes
        const quantidadesExistentes = carrinhoDetalhado.itens.reduce((acc, item) => ({
          ...acc,
          [item.id_produto]: item.quantidade
        }), {});
        
        setQuantidades(quantidadesExistentes);
      } else {
        // Inicializa um novo carrinho silenciosamente
        await inicializarNovoCarrinho();
      }

      setModalCarrinhoAberto(true);
    } catch (error: any) {
      // Só mostra erro se não for o caso de "nenhum carrinho encontrado"
      if (error.response?.status !== 404) {
        let mensagemErro = 'Erro ao carregar carrinho';
        if (error.response?.data?.error) {
          mensagemErro = error.response.data.error;
        } else if (error.message) {
          mensagemErro = error.message;
        }
        setErroCarrinho(mensagemErro);
      } else {
        // Se for 404 (nenhum carrinho encontrado), inicializa um novo
        await inicializarNovoCarrinho();
        setModalCarrinhoAberto(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const inicializarNovoCarrinho = async () => {
    setCarrinhoId(null);
    setCarrinhoExistente(false);
    setDataCarrinho(new Date());
    setStatusCarrinhoModal('Aberto');
    setStatusRetiradaCarrinhoModal('Aguardando');
    setQuantidades({});
    await carregarProdutos();
  };

  const handleSalvarCarrinho = async () => {
    if (!unidadeSelecionada) {
      setErroCarrinho('Unidade não selecionada');
      return;
    }

    try {
      setLoading(true);
      setErroCarrinho('');

      const itens = Object.entries(quantidades)
        .filter(([_, quantidade]) => quantidade > 0)
        .map(([idProduto, quantidade]) => ({
          id_produto: Number(idProduto),
          quantidade
        }));

      if (itens.length === 0) {
        setErroCarrinho('Adicione pelo menos um produto ao carrinho');
        return;
      }

      const carrinhoBase = {
        id_unidade: unidadeSelecionada.id_unidade,
        data: formatarDataParaBackend(dataCarrinho),
        total: calcularTotalGeral(),
        status: statusCarrinhoModal,
        status_retirada: statusRetiradaCarrinhoModal,
        itens
      };

      let response;
      if (carrinhoExistente && carrinhoId) {
        response = await CarrinhoService.atualizar(carrinhoId, carrinhoBase);
        alert(`Pedido #${carrinhoId} atualizado com sucesso!`);
      } else {
        response = await CarrinhoService.criar(carrinhoBase);
        alert(`Pedido #${response.id_carrinho} criado com sucesso!`);
      }
      
      handleFecharCarrinho();
      await buscarUnidades(); // Atualiza a grid após salvar
    } catch (error: any) {
      let mensagemErro = 'Erro ao salvar carrinho';
      
      if (error.response) {
        mensagemErro = error.response.data?.error || error.response.data?.message || mensagemErro;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      setErroCarrinho(`${mensagemErro}. Por favor, tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFecharCarrinho = async () => {
    setModalCarrinhoAberto(false);
    setUnidadeSelecionada(null);
    setCarrinhoExistente(false);
    setDataCarrinho(new Date());
    setStatusCarrinhoModal('Aberto');
    setStatusRetiradaCarrinhoModal('Aguardando');
    setQuantidades({});
    setCarrinhoId(null);
    setErroCarrinho('');
    buscarUnidades();
  };

  const handleQuantidadeChange = (produtoId: number, quantidade: number) => {
    setQuantidades(prev => ({
      ...prev,
      [produtoId]: quantidade
    }));
  };

  const handleIncrementarQuantidade = (produtoId: number) => {
    setQuantidades(prev => ({
      ...prev,
      [produtoId]: (prev[produtoId] || 0) + 1
    }));
  };

  const handleDecrementarQuantidade = (produtoId: number) => {
    setQuantidades(prev => ({
      ...prev,
      [produtoId]: Math.max(0, (prev[produtoId] || 0) - 1)
    }));
  };

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const calcularTotalGeral = (): number => {
    return produtos.reduce((total, produto) => {
      const quantidade = quantidades[produto.id_produto] || 0;
      return total + (produto.valor * quantidade);
    }, 0);
  };

  const formatarMensagemWhatsApp = async (unidade: Unidade, produtosAtuais: Produto[], quantidadesAtuais: { [key: number]: number }, status: string): Promise<string> => {
    let mensagem = '';
    const numeroPedido = carrinhoId || unidade.id_carrinho;

    if (status === 'Pago') {
      mensagem = `Olá ${unidade.pessoa}!\n\n`;
      mensagem += `Seu pedido ${numeroPedido ? `#${numeroPedido}` : ''} está pronto para retirada.\n\n`;
      mensagem += `*Instruções de Retirada:*\n`;
      mensagem += `1. Dirija-se ao local de retirada\n`;
      if (numeroPedido) {
        mensagem += `2. Informe o número do seu pedido: #${numeroPedido}\n`;
      }
      mensagem += `3. Status atual: ${statusRetiradaCarrinhoModal}\n\n`;
      mensagem += `*Dados do Cliente:*\n`;
      mensagem += `Unidade: ${unidade.nomeunidade}\n`;
      mensagem += `Pessoa: ${unidade.pessoa}\n`;
      mensagem += `Tipo: ${unidade.tipo}\n\n`;
      mensagem += `*Detalhes do Pedido:*\n`;
    } else {
      mensagem = `Olá ${unidade.pessoa}!\n\n`;
      mensagem += `*Dados do Cliente:*\n`;
      mensagem += `Unidade: ${unidade.nomeunidade}\n`;
      mensagem += `Pessoa: ${unidade.pessoa}\n`;
      mensagem += `Tipo: ${unidade.tipo}\n\n`;
      mensagem += `*Detalhes do Pedido:*\n`;
    }

    let produtosParaExibir = produtosAtuais;
    let quantidadesParaExibir = quantidadesAtuais;

    // Se estiver enviando da lista (fora do modal), busca os dados do último carrinho
    if (!modalCarrinhoAberto && unidade.id_carrinho) {
      try {
        const carrinhoDetalhado = await CarrinhoService.buscarPorId(unidade.id_carrinho);
        if (carrinhoDetalhado) {
          // Carrega os produtos
          const todosProdutos = await ProdutosService.listar();
          produtosParaExibir = todosProdutos.filter(p => p.status === 'Ativo');
          
          // Monta o objeto de quantidades a partir dos itens do carrinho
          quantidadesParaExibir = carrinhoDetalhado.itens.reduce((acc, item) => ({
            ...acc,
            [item.id_produto]: item.quantidade
          }), {});
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do carrinho:', error);
      }
    }

    let totalGeral = 0;
    produtosParaExibir.forEach(produto => {
      const quantidade = quantidadesParaExibir[produto.id_produto] || 0;
      if (quantidade > 0) {
        const total = produto.valor * quantidade;
        totalGeral += total;
        mensagem += `- ${produto.descricao}: ${quantidade} x ${formatarMoeda(produto.valor)} = ${formatarMoeda(total)}\n`;
      }
    });

    mensagem += `\n*Total: ${formatarMoeda(totalGeral)}*`;
    
    if (status === 'Aberto') {
      mensagem += `\n\nChave PIX (CNPJ): 25.044.410/0001-65`;
      if (numeroPedido) {
        mensagem += `\n\nFavor incluir na descrição: Pedido #${numeroPedido}`;
      }
    }

    return encodeURIComponent(mensagem);
  };

  const enviarPedidoWhatsApp = async (unidade: Unidade, status: string) => {
    if (!unidade.celular) {
      alert('Esta unidade não possui número de celular cadastrado.');
      return;
    }

    try {
      const telefone = unidade.celular.replace(/\D/g, '');
      const mensagem = await formatarMensagemWhatsApp(unidade, produtos, quantidades, status);
      const url = `https://wa.me/55${telefone}?text=${mensagem}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao preparar a mensagem. Por favor, tente novamente.');
    }
  };

  return (
    <Box sx={{ p: 0, m: 0, width: '100%' }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ color: 'primary.main', fontWeight: 'medium' }}
      >
        Venda de Pulseiras
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: 'stretch',
                  }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Nome da Unidade"
              value={nomeUnidade}
              onChange={(e) => setNomeUnidade(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Nome da Pessoa"
              value={nomePessoa}
              onChange={(e) => setNomePessoa(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Nº do Pedido"
              value={numeroPedido}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Permite apenas números
                setNumeroPedido(value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              select
              label="Status do Pedido"
              value={statusCarrinho}
              onChange={(e) => setStatusCarrinho(e.target.value)}
              SelectProps={{
                native: true
              }}
              InputLabelProps={{
                shrink: true
              }}
            >
              <option value="">Todos</option>
              <option value="Sem Pedido">Sem Pedido</option>
              <option value="Aberto">Aberto</option>
              <option value="Pago">Pago</option>
              <option value="Cancelado">Cancelado</option>
            </TextField>
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              select
              label="Status de Retirada"
              value={statusRetirada}
              onChange={(e) => setStatusRetirada(e.target.value)}
              SelectProps={{
                native: true
              }}
              InputLabelProps={{
                shrink: true
              }}
            >
              <option value="">Todos</option>
              <option value="Sem Pedido">Sem Pedido</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Separado">Separado</option>
              <option value="Retirado">Retirado</option>
              <option value="Cancelado">Cancelado</option>
            </TextField>
          </Box>
        </Box>
      </Paper>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      <Paper>
      <Fade in={!loading} timeout={loading ? 0 : 1000}>
      <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
      <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                <StyledTableCell sx={{ width: 100, minWidth: 100 }}>Ações</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>ID</StyledTableCell>
                <StyledTableCell>Unidade</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Tipo</StyledTableCell>
                <StyledTableCell>Pessoa</StyledTableCell>
                <StyledTableCell>Nº Pedido</StyledTableCell>
                <StyledTableCell>Status Pedido</StyledTableCell>
                <StyledTableCell>Status Retirada</StyledTableCell>
                <StyledTableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Total</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Email</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Telefones</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>ID Lello</StyledTableCell>
         
                    </TableRow>
              </TableHead>

              <TableBody>
              {unidadesPaginadas.map((unidade) => (
                <StyledTableRow key={unidade.id_unidade}>
                  {/* Ações – sempre visível */}
                  <TableCell sx={{ width: 100, minWidth: 100 }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                      <IconButton color="primary" onClick={() => handleAbrirCarrinho(unidade)} size="small">
                        <ShoppingCartIcon />
                      </IconButton>
                      {(unidade.status_carrinho === 'Pago' || unidade.status_carrinho === 'Aberto') && unidade.celular && (
                        <IconButton
                          color={unidade.status_carrinho === 'Pago' ? 'success' : 'primary'}
                          onClick={async () => await enviarPedidoWhatsApp(unidade, unidade.status_carrinho || 'Aberto')}
                          size="small"
                          title={`Enviar ${unidade.status_carrinho === 'Pago' ? 'instruções de retirada' : 'dados para pagamento'} por WhatsApp`}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>

                  {/* Campos com visibilidade condicional */}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{unidade.id_unidade}</TableCell>
                  <TableCell>{unidade.nomeunidade}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{unidade.tipo}</TableCell>
                  <TableCell
                      sx={{
                        whiteSpace: { xs: 'normal', md: 'nowrap' },
                        wordBreak: 'break-word',
                        maxWidth: { xs: 120, md: 'initial' },
                        overflowWrap: 'break-word',
                      }}
                    >
                      {unidade.pessoa}
                    </TableCell>
                  <TableCell>{unidade.id_carrinho || '-'}</TableCell>
                  <TableCell>
                    {unidade.status_carrinho ? (
                      <StyledStatus status={unidade.status_carrinho}>
                        {unidade.status_carrinho}
                      </StyledStatus>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {unidade.status_retirada ? (
                      <StyledStatusRetirada status={unidade.status_retirada}>
                        {unidade.status_retirada}
                      </StyledStatusRetirada>
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {unidade.total_carrinho ? formatarMoeda(unidade.total_carrinho) : '-'}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{unidade.email}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {[unidade.celular, unidade.fone, unidade.comercial].filter(tel => tel).join(' / ')}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{unidade.idunidade}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
             
            </Table>
          </TableContainer>
        </Fade>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={unidades.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      </Paper>

      <Dialog 
        open={modalCarrinhoAberto} 
        onClose={() => handleFecharCarrinho()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {carrinhoExistente ? 'Editar' : 'Novo'} Carrinho de Compras - {unidadeSelecionada?.nomeunidade} ({unidadeSelecionada?.tipo}) - {unidadeSelecionada?.pessoa}
          {carrinhoExistente && carrinhoId && (
            <Typography variant="subtitle2" color="text.secondary">
              Pedido #{carrinhoId}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 1, sm: 3 } }}>
          {erroCarrinho && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erroCarrinho}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Data"
                  value={formatarDataParaInput(dataCarrinho)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    try {
                      const novaData = new Date(e.target.value);
                      if (!isNaN(novaData.getTime())) {
                        setDataCarrinho(novaData);
                      }
                    } catch (error) {
                      // Ignora erros de parsing de data inválida
                    }
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={statusCarrinhoModal}
                  onChange={(e) => setStatusCarrinhoModal(e.target.value)}
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Pago">Pago</option>
                  <option value="Cancelado">Cancelado</option>
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  select
                  fullWidth
                  label="Status de Retirada"
                  value={statusRetiradaCarrinhoModal}
                  onChange={(e) => setStatusRetiradaCarrinhoModal(e.target.value)}
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value="Aguardando">Aguardando</option>
                  <option value="Separado">Separado</option>
                  <option value="Retirado">Retirado</option>
                  <option value="Cancelado">Cancelado</option>
                </TextField>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              Produtos Disponíveis
            </Typography>
            
            <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell>Descrição</StyledTableCell>
                    <StyledTableCell align="center">Quantidade</StyledTableCell>
                    <StyledTableCell align="right">Valor</StyledTableCell>
                    <StyledTableCell align="right">Total</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingProdutos ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : produtos.length > 0 ? (
                    produtos.map((produto) => (
                      <StyledTableRow key={produto.id_produto}>
                        <TableCell>{produto.id_produto}</TableCell>
                        <TableCell>{produto.descricao}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDecrementarQuantidade(produto.id_produto)}
                              color="primary"
                            >
                              <RemoveCircleIcon />
                            </IconButton>
                            <TextField
                              type="number"
                              size="small"
                              value={quantidades[produto.id_produto] || 0}
                              onChange={(e) => handleQuantidadeChange(produto.id_produto, Number(e.target.value))}
                              inputProps={{
                                min: 0,
                                style: { textAlign: 'center' }
                              }}
                              sx={{ width: '80px' }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleIncrementarQuantidade(produto.id_produto)}
                              color="primary"
                            >
                              <AddCircleIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatarMoeda(produto.valor)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatarMoeda(produto.valor * (quantidades[produto.id_produto] || 0))}
                        </TableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                      Total Geral:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1em', color: 'primary.main' }}>
                      {formatarMoeda(calcularTotalGeral())}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleFecharCarrinho()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="success"
            disabled={calcularTotalGeral() === 0 || loading}
            onClick={handleSalvarCarrinho}
            sx={{ fontWeight: 'bold', minWidth: 150 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Salvando...</span>
              </Box>
            ) : (
              'Finalizar Pedido'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}