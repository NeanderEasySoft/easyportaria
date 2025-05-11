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
  styled,
  IconButton,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { UnidadesService, Unidade, FiltroUnidade } from '../services/proprietarios.service';
import React from 'react';
import ModalAlteracaoProprietario from '../components/ModalAlteracaoProprietario';

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

export default function Proprietarios() {
  const [proprietarios, setProprietarios] = useState<Unidade[]>([]);
  const [nomeUnidade, setNomeUnidade] = useState('');
  const [nomePessoa, setNomePessoa] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para controlar o Modal de Alteração externo
  const [modalAlteraAberto, setModalAlteraAberto] = useState(false);
  const [proprietarioParaAlterar, setProprietarioParaAlterar] = useState<Unidade | null>(null);
  // O estado 'salvandoAlteracao' será gerenciado internamente pelo ModalAlteracaoProprietario,
  // mas podemos ter um estado de carregamento geral para a página se a operação de salvar for longa.
  const [atualizandoProprietario, setAtualizandoProprietario] = useState(false);
  const [erroAtualizacao, setErroAtualizacao] = useState('');

  const buscarProprietarios = async () => {
    try {
      setLoading(true);
      setErro('');
      
      const filtros: FiltroUnidade = {};
      if (nomeUnidade) filtros.nomeunidade = nomeUnidade;
      if (nomePessoa) filtros.pessoa = nomePessoa;
      
      const data = await UnidadesService.listar(filtros);
      
      if (!Array.isArray(data)) {
        setErro('Erro ao processar dados dos proprietários: formato inesperado.');
        setProprietarios([]);
        setLoading(false);
        return;
      }

      const proprietariosOrdenados = [...data].sort((a, b) => {
        const nomeA = a && typeof a.nomeunidade === 'string' ? a.nomeunidade : '';
        const nomeB = b && typeof b.nomeunidade === 'string' ? b.nomeunidade : '';
        return nomeA.localeCompare(nomeB, 'pt-BR');
      });
      
      setProprietarios(proprietariosOrdenados);
      setPage(0);
    } catch (error: any) {
      setErro(`Erro ao buscar proprietários: ${error.message}`);
      setProprietarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProprietarios();
    }, 500);

    return () => clearTimeout(timer);
  }, [nomeUnidade, nomePessoa]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const proprietariosPaginados = proprietarios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatarMensagemWhatsApp = async (proprietario: Unidade): Promise<string> => {
    let mensagem = `Olá ${proprietario.pessoa}!\\n\\n`;
    mensagem += `Segue informação referente à unidade ${proprietario.nomeunidade}.\\n\\n`;
    mensagem += `*Dados do Cliente:*\\n`;
    mensagem += `Unidade: ${proprietario.nomeunidade}\\n`;
    mensagem += `Pessoa: ${proprietario.pessoa}\\n`;
    if (proprietario.tipo) mensagem += `Tipo: ${proprietario.tipo}\\n`;

    return encodeURIComponent(mensagem);
  };

  const enviarMensagemWhatsApp = async (proprietario: Unidade) => {
    if (!proprietario.celular) {
      alert('Esta unidade/proprietário não possui número de celular cadastrado.');
      return;
    }

    try {
      const telefone = proprietario.celular.replace(/\D/g, '');
      const mensagem = await formatarMensagemWhatsApp(proprietario);
      const url = `https://wa.me/55${telefone}?text=${mensagem}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao preparar a mensagem. Por favor, tente novamente.');
    }
  };

  const handleAbrirModalCriar = () => {
    setProprietarioParaAlterar(null);
    setModalAlteraAberto(true);
    setErroAtualizacao('');
  };

  const handleAbrirModalAlterar = (proprietario: Unidade) => {
    setProprietarioParaAlterar(proprietario);
    setModalAlteraAberto(true);
    setErroAtualizacao('');
  };

  const handleFecharModalAlterar = () => {
    setModalAlteraAberto(false);
  };
  
  const handleSalvarModal = async (dadosFormulario: Partial<Unidade>) => {
    setAtualizandoProprietario(true);
    setErroAtualizacao('');
    try {
      if (proprietarioParaAlterar && proprietarioParaAlterar.id_unidade) {
        await UnidadesService.atualizar(proprietarioParaAlterar.id_unidade, dadosFormulario);
        alert('Proprietário atualizado com sucesso!'); 
      } else {
        await UnidadesService.criar(dadosFormulario);
        alert('Proprietário incluído com sucesso!'); 
      }
      handleFecharModalAlterar();
      buscarProprietarios();
    } catch (err: any) {
      const errorMsg = err.response?.data?.mensagem || err.message || (proprietarioParaAlterar ? 'Erro desconhecido ao atualizar.' : 'Erro desconhecido ao incluir.');
      setErroAtualizacao(errorMsg);
      throw err; 
    } finally {
      setAtualizandoProprietario(false);
    }
  };

  const handleAlterar = (proprietario: Unidade) => {
    handleAbrirModalAlterar(proprietario);
  };

  const handleExcluir = async (proprietario: Unidade) => {
    if (window.confirm(`Tem certeza que deseja excluir "${proprietario.nomeunidade}"?`)) {
      try {
        setLoading(true);
        await UnidadesService.excluir(proprietario.id_unidade);
        alert(`Proprietário "${proprietario.nomeunidade}" excluído com sucesso.`);
        buscarProprietarios();
      } catch (error: any) {
        const errorMessage = error?.response?.data?.mensagem || error.message || 'Erro desconhecido ao excluir.';
        setErro(`Erro ao excluir proprietário: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Box sx={{ p: 0, m: 0, width: '100%'}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
          Gestão de Proprietários 
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAbrirModalCriar}
        >
          Incluir Proprietário
        </Button>
      </Box>

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
              label="Nome da Unidade/Local"
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
              label="Nome da Pessoa (Proprietário)"
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
        </Box>
      </Paper>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      {/* Indicador de carregamento global para buscar/excluir */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Indicador de carregamento para salvar/criar (pode ser sobreposto ou em local diferente se desejado) */}
      {atualizandoProprietario && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {/* Este CircularProgress é para o estado 'atualizandoProprietario' (operações do modal) */}
          {/* A lógica do Fade abaixo já considera 'atualizandoProprietario' para esconder a tabela */}
          {/* Poderíamos ter um indicador mais específico aqui se o 'loading' geral não for suficiente */}
        </Box>
      )}

      <Paper sx={{ opacity: loading || atualizandoProprietario ? 0.5 : 1, pointerEvents: loading || atualizandoProprietario ? 'none' : 'auto' }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: 'auto', minWidth: 160 }}>Ações</StyledTableCell>
                <StyledTableCell>Unidade</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Tipo</StyledTableCell>
                <StyledTableCell>Pessoa (Proprietário)</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Telefones</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' }, minWidth: 300 }}>Endereço</StyledTableCell>
                <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Número</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proprietariosPaginados.map((proprietario) => (
                <StyledTableRow key={proprietario.id_unidade}>
                  <TableCell sx={{ width: 'auto', minWidth: 160 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'start', flexWrap: 'nowrap' }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleAlterar(proprietario)}
                        size="small"
                        title="Alterar Proprietário"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleExcluir(proprietario)}
                        size="small"
                        title="Excluir Proprietário"
                      >
                        <DeleteIcon />
                      </IconButton>
                      {proprietario.celular && (
                        <IconButton
                          color={'primary'}
                          onClick={async () => await enviarMensagemWhatsApp(proprietario)}
                          size="small"
                          title={`Enviar mensagem por WhatsApp`}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      )}
                      {proprietario.latitude && proprietario.longitude && (
                        <IconButton 
                          color="info"
                          size="small" 
                          title="Ver no Mapa"
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${proprietario.latitude},${proprietario.longitude}`, '_blank')}
                        >
                          <RoomIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{proprietario.nomeunidade}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{proprietario.tipo}</TableCell>
                  <TableCell
                      sx={{
                        whiteSpace: { xs: 'normal', md: 'nowrap' },
                        wordBreak: 'break-word',
                        maxWidth: { xs: 120, md: 'initial' },
                        overflowWrap: 'break-word',
                      }}
                    >
                      {proprietario.pessoa}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {[proprietario.celular, proprietario.fone, proprietario.comercial].filter(tel => tel).join(' / ') || '-'}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, minWidth: 250 }}>{proprietario.endereco || '-'}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{proprietario.numero || '-'}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={proprietarios.length}
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

      {/* Modal de Alteração EXTERNO */}
      {modalAlteraAberto && (
        <ModalAlteracaoProprietario
          open={modalAlteraAberto}
          onClose={handleFecharModalAlterar}
          proprietario={proprietarioParaAlterar} 
          onSave={handleSalvarModal}
        />
      )}
      {/* Fim do Modal de Alteração EXTERNO */}

      {/* Exibir erro de atualização global, se houver e o modal estiver fechado ou não for específico do form */}
      {erroAtualizacao && !modalAlteraAberto && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          Erro ao salvar: {erroAtualizacao}
        </Alert>
      )}

    </Box>
  );
}