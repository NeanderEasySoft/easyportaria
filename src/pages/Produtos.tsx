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
  IconButton,
  CircularProgress,
  Alert,
  TablePagination,
  Fade,
  styled,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ProdutosService, { Produto, FiltroProduto } from '../services/produtos.service';

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

interface FormProduto {
  descricao: string;
  valor: number;
  status: string;
}

interface FormErrors {
  descricao?: string;
  valor?: string;
  status?: string;
}

const produtoVazio: FormProduto = {
  descricao: '',
  valor: 0,
  status: 'Ativo'
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estados para o modal de edição/criação
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<FormProduto>(produtoVazio);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState<number | null>(null);
  const [erros, setErros] = useState<FormErrors>({});

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      setErro('');
      
      const filtros: FiltroProduto = {};
      if (filtroDescricao) filtros.descricao = filtroDescricao;
      
      const data = await ProdutosService.listar(filtros);
      setProdutos(data);
      setPage(0);
    } catch (error: any) {
      setErro(`Erro ao buscar produtos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProdutos();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtroDescricao]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const abrirModalCriacao = () => {
    setModoEdicao(false);
    setProdutoEmEdicao({
      descricao: '',
      valor: 0,
      status: 'Ativo'
    });
    setIdEmEdicao(null);
    setErros({});
    setErro('');
    setModalAberto(true);
  };

  const abrirModalEdicao = async (produto: Produto) => {
    setModoEdicao(true);
    setProdutoEmEdicao({
      descricao: produto.descricao,
      valor: produto.valor,
      status: produto.status
    });
    setIdEmEdicao(produto.id_produto);
    setErros({});
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setErros({});
    setErro('');
  };

  const validarFormulario = (): boolean => {
    const novosErros: FormErrors = {};
    
    if (!produtoEmEdicao.descricao.trim()) {
      novosErros.descricao = 'A descrição é obrigatória';
    }
    
    if (produtoEmEdicao.valor <= 0) {
      novosErros.valor = 'O valor deve ser maior que zero';
    }

    if (!produtoEmEdicao.status) {
      novosErros.status = 'O status é obrigatório';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      setErro('');

      const produtoParaSalvar = {
        ...produtoEmEdicao,
        valor: Number(produtoEmEdicao.valor.toFixed(2))
      };

      if (modoEdicao && idEmEdicao) {
        await ProdutosService.atualizar(idEmEdicao, produtoParaSalvar);
      } else {
        await ProdutosService.criar(produtoParaSalvar);
      }

      fecharModal();
      buscarProdutos();
    } catch (error: any) {
      setErro(`Erro ao ${modoEdicao ? 'atualizar' : 'criar'} produto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      setLoading(true);
      setErro('');
      
      await ProdutosService.excluir(id);
      buscarProdutos();
    } catch (error: any) {
      // Extrai a mensagem de erro do backend
      let mensagemErro = 'Erro ao excluir produto';
      if (error.response?.data?.error) {
        mensagemErro = error.response.data.error;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const produtosPaginados = produtos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ color: 'primary.main', fontWeight: 'medium' }}
        >
          Cadastro de Pulseiras
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: { xs: '1', md: '3' } }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Buscar por descrição"
              value={filtroDescricao}
              onChange={(e) => setFiltroDescricao(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1', md: '1' } }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirModalCriacao}
            >
              Nova Pulseira
            </Button>
          </Box>
        </Box>
      </Paper>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro.replace(/produto/g, 'pulseira')}
        </Alert>
      )}

      <Paper>
        <Fade in={!loading} timeout={loading ? 0 : 1000}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Descrição</StyledTableCell>
                  <StyledTableCell align="right">Valor</StyledTableCell>
                  <StyledTableCell align="center">Status</StyledTableCell>
                  <StyledTableCell align="center">Ações</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : produtosPaginados.length > 0 ? (
                  produtosPaginados.map((produto) => (
                    <StyledTableRow key={produto.id_produto}>
                      <TableCell>{produto.id_produto}</TableCell>
                      <TableCell>{produto.descricao}</TableCell>
                      <TableCell align="right">
                        {formatarValor(produto.valor)}
                      </TableCell>
                      <TableCell align="center">
                        {produto.status}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => abrirModalEdicao(produto)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleExcluir(produto.id_produto)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhuma pulseira encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={produtos.length}
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
        open={modalAberto} 
        onClose={fecharModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {modoEdicao ? 'Editar Pulseira' : 'Nova Pulseira'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Descrição"
              value={produtoEmEdicao.descricao}
              onChange={(e) => setProdutoEmEdicao(prev => ({
                ...prev,
                descricao: e.target.value
              }))}
              error={!!erros.descricao}
              helperText={erros.descricao?.replace(/produto/g, 'pulseira')}
              required
              multiline
              rows={2}
              inputProps={{
                maxLength: 200
              }}
            />
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={produtoEmEdicao.valor}
              onChange={(e) => setProdutoEmEdicao(prev => ({
                ...prev,
                valor: Number(e.target.value)
              }))}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              error={!!erros.valor}
              helperText={erros.valor?.replace(/produto/g, 'pulseira')}
              required
              inputProps={{
                min: 0,
                step: 0.01,
                max: 99999999.99
              }}
            />
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={produtoEmEdicao.status}
              onChange={(e) => setProdutoEmEdicao(prev => ({
                ...prev,
                status: e.target.value
              }))}
              error={!!erros.status}
              helperText={erros.status?.replace(/produto/g, 'pulseira')}
              required
              SelectProps={{
                native: true
              }}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal}>Cancelar</Button>
          <Button 
            onClick={handleSalvar} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}