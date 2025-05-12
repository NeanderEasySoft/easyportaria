import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import {
  Room as RoomIcon
} from '@mui/icons-material';
import { IMaskInput } from 'react-imask';
import { Unidade } from '../services/proprietarios.service';
import { RuasService, Rua } from '../services/ruas.service';

// --- INÍCIO DOS COMPONENTES DE MÁSCARA CUSTOMIZADOS ---
interface CustomMaskProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const CelularMaskCustom = React.forwardRef<HTMLInputElement, CustomMaskProps>(
  function CelularMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(00) 00000-0000"
        inputRef={ref}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  },
);

const TelefoneFixoMaskCustom = React.forwardRef<HTMLInputElement, CustomMaskProps>(
  function TelefoneFixoMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(00) 0000-0000"
        inputRef={ref}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  },
);
// --- FIM DOS COMPONENTES DE MÁSCARA CUSTOMIZADOS ---

interface ModalAlteracaoProprietarioProps {
  open: boolean;
  onClose: () => void;
  proprietario: Unidade | null;
  onSave: (dadosEditados: Partial<Unidade>) => Promise<void>;
}

const ModalAlteracaoProprietario: React.FC<ModalAlteracaoProprietarioProps> = ({
  open,
  onClose,
  proprietario,
  onSave,
}) => {
  const [dadosFormularioEdicao, setDadosFormularioEdicao] = useState<Partial<Unidade>>({});
  const [erroFormularioEdicao, setErroFormularioEdicao] = useState<string>('');
  const [salvandoAlteracao, setSalvandoAlteracao] = useState(false);
  const [buscandoGeo, setBuscandoGeo] = useState(false);

  // Estados para a lista de ruas
  const [ruas, setRuas] = useState<Rua[]>([]);
  const [loadingRuas, setLoadingRuas] = useState(false);
  const [erroRuas, setErroRuas] = useState<string>('');

  // Buscar ruas quando o modal for aberto
  useEffect(() => {
    if (open) {
      const fetchRuas = async () => {
        setLoadingRuas(true);
        setErroRuas('');
        try {
          const data = await RuasService.listar();
          setRuas(data);
        } catch (err) {
          console.error("Erro ao carregar ruas:", err);
          setErroRuas('Erro ao carregar lista de ruas. Tente novamente.');
        }
        setLoadingRuas(false);
      };
      fetchRuas();
    } else {
      // Limpar lista de ruas e erros quando o modal é fechado para não persistir em aberturas futuras
      setRuas([]);
      setErroRuas('');
      setLoadingRuas(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && proprietario) {
      setDadosFormularioEdicao({
        id_unidade: proprietario.id_unidade,
        idunidade: proprietario.idunidade,
        nomeunidade: proprietario.nomeunidade,
        tipo: proprietario.tipo,
        pessoa: proprietario.pessoa,
        email: proprietario.email,
        recado: proprietario.recado,
        fone: proprietario.fone,
        celular: proprietario.celular,
        comercial: proprietario.comercial,
        endereco: proprietario.endereco || '',
        numero: proprietario.numero,
        latitude: proprietario.latitude,
        longitude: proprietario.longitude,
      });
      setErroFormularioEdicao('');
    } else if (open && !proprietario) {
      setDadosFormularioEdicao({
        nomeunidade: '',
        pessoa: '',
        tipo: '',
        email: '',
        recado: '',
        fone: '',
        celular: '',
        comercial: '',
        endereco: '',
        numero: '',
      } as Partial<Unidade>);
      setErroFormularioEdicao('');
    }
  }, [proprietario, open]);

  // NOVO useEffect para validar o endereço após as ruas serem carregadas
  useEffect(() => {
    // Executa somente se estiver editando um proprietário (proprietario existe),
    // as ruas foram carregadas (loadingRuas é false e não há erroRuas),
    // e o modal está aberto.
    if (
      open &&
      proprietario &&
      proprietario.endereco &&
      !loadingRuas &&
      ruas.length > 0 &&
      !erroRuas
    ) {
      const enderecoAtualExisteNaLista = ruas.some(
        (rua) => rua.nomerua === proprietario.endereco
      );
  
      // Sempre mantém o endereço original do proprietário
      // Apenas adiciona uma flag separada se ele for inválido
      setDadosFormularioEdicao((prev) => ({
        ...prev,
        endereco: proprietario.endereco,
        enderecoInvalido: !enderecoAtualExisteNaLista, // adiciona essa flag
      }));
    
    }
  }, [proprietario, ruas, loadingRuas, erroRuas, open]);
  

  const handleChangeFormularioEdicao = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    
    if (name === 'latitude' || name === 'longitude') {
      setDadosFormularioEdicao(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value) 
      }));
    } else {
      setDadosFormularioEdicao(prev => ({
        ...prev,
        [name]: value 
      }));
    }
  };

  const handleCapturarGeolocalizacao = () => {
    if (navigator.geolocation) {
      setBuscandoGeo(true);
      setErroFormularioEdicao('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDadosFormularioEdicao(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setBuscandoGeo(false);
        },
        (error) => {
          console.error("Erro ao obter geolocalização:", error);
          setErroFormularioEdicao(`Erro ao obter geolocalização: ${error.message}`);
          setBuscandoGeo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setErroFormularioEdicao("Geolocalização não é suportada por este navegador.");
    }
  };

  const handleSalvar = async () => {
    if (proprietario && !dadosFormularioEdicao.id_unidade) { 
      setErroFormularioEdicao("ID da unidade para alteração não encontrado. Contate o suporte.");
      return;
    }
    if (!dadosFormularioEdicao.nomeunidade?.trim()) {
      setErroFormularioEdicao("O nome da unidade/local não pode ser vazio.");
      return;
    }
    if (!dadosFormularioEdicao.pessoa?.trim()) {
      setErroFormularioEdicao("O nome da pessoa não pode ser vazio.");
      return;
    }
    if (!dadosFormularioEdicao.tipo?.trim()) {
      setErroFormularioEdicao("O campo Tipo é obrigatório.");
      return;
    }
    const { altitude, ...dadosRelevantes } = dadosFormularioEdicao;
    const dadosParaSalvar: Partial<Unidade> = dadosRelevantes;
    setSalvandoAlteracao(true);
    setErroFormularioEdicao('');
    try {
      await onSave(dadosParaSalvar);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.mensagem || err.message || 'Erro desconhecido ao salvar alterações.';
      setErroFormularioEdicao(errorMsg);
    } finally {
      setSalvandoAlteracao(false);
    }
  };

  const handleClose = () => {
    if (salvandoAlteracao || buscandoGeo) return;
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown={salvandoAlteracao || buscandoGeo}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {proprietario ? `Alterar: ${proprietario.nomeunidade || 'Carregando...'}` : 'Incluir Novo Proprietário'}
        {proprietario?.idunidade && (
          <Typography component="span" variant="subtitle1" color="text.secondary" sx={{ ml: 1 }}>
            (ID Lello: {proprietario.idunidade})
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {erroFormularioEdicao && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erroFormularioEdicao}
          </Alert>
        )}
        {erroRuas && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {erroRuas} (O campo de endereço funcionará como texto livre)
          </Alert>
        )}
        
        <Grid component="form" noValidate autoComplete="off" container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              margin="dense"
              id="nomeunidade"
              name="nomeunidade"
              label="Nome Unidade/Local"
              value={dadosFormularioEdicao.nomeunidade || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
              error={!dadosFormularioEdicao.nomeunidade?.trim() && !!erroFormularioEdicao && erroFormularioEdicao.includes("unidade")}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              margin="dense"
              id="pessoa"
              name="pessoa"
              label="Nome da Pessoa"
              value={dadosFormularioEdicao.pessoa || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
              error={!dadosFormularioEdicao.pessoa?.trim() && !!erroFormularioEdicao && erroFormularioEdicao.includes("pessoa")}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" disabled={salvandoAlteracao}>
              <InputLabel id="tipo-select-label">Tipo</InputLabel>
              <Select
                labelId="tipo-select-label"
                id="tipo"
                name="tipo"
                value={dadosFormularioEdicao.tipo || ''}
                label="Tipo"
                onChange={handleChangeFormularioEdicao}
              >
                <MenuItem value={"Proprietario"}>Proprietário</MenuItem>
                <MenuItem value={"Inquilino"}>Inquilino</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            {loadingRuas ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">Carregando ruas...</Typography>
              </Box>
            ) : ruas.length > 0 ? (
              <FormControl fullWidth margin="dense" disabled={salvandoAlteracao}>
                <InputLabel id="endereco-select-label">Endereço (Rua)</InputLabel>
                <Select
                  labelId="endereco-select-label"
                  id="endereco"
                  name="endereco"
                  value={dadosFormularioEdicao.endereco || ''}
                  label="Endereço (Rua)"
                  onChange={handleChangeFormularioEdicao}
                >
                  <MenuItem value=""><em>Nenhuma</em></MenuItem> {/* Opção para limpar */} 
                  {ruas.map((rua) => (
                    <MenuItem key={rua.idrua} value={rua.nomerua}>
                      {rua.nomerua}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              // Fallback para TextField se não houver ruas ou erro ao carregar (exceto se já houver erroRuas)
              <TextField
                fullWidth
                margin="dense"
                id="endereco"
                name="endereco"
                label="Endereço (Rua) - não foi possível carregar lista"
                value={dadosFormularioEdicao.endereco || ''}
                onChange={handleChangeFormularioEdicao}
                disabled={salvandoAlteracao}
                helperText={erroRuas ? erroRuas : ''}
                error={!!erroRuas}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              id="numero"
              name="numero"
              label="Número"
              value={dadosFormularioEdicao.numero || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
            />
          </Grid>

          <Grid item xs={12} sm={6}> 
            <TextField
              fullWidth
              margin="dense"
              id="email"
              name="email"
              label="Email"
              type="email"
              value={dadosFormularioEdicao.email || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}> 
            <TextField
              fullWidth
              margin="dense"
              id="celular"
              name="celular"
              label="Celular"
              value={dadosFormularioEdicao.celular || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
              InputProps={{
                inputComponent: CelularMaskCustom as any,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              id="fone"
              name="fone"
              label="Telefone Fixo"
              value={dadosFormularioEdicao.fone || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
              InputProps={{
                inputComponent: TelefoneFixoMaskCustom as any,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              id="comercial"
              name="comercial"
              label="Telefone Comercial"
              value={dadosFormularioEdicao.comercial || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
              InputProps={{
                inputComponent: TelefoneFixoMaskCustom as any,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              id="recado"
              name="recado"
              label="Telefone Recado"
              value={dadosFormularioEdicao.recado || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
              InputProps={{
                inputComponent: TelefoneFixoMaskCustom as any,
              }}
            />
          </Grid>

          <Grid item xs={12} container spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs="auto">
              <Button 
                variant="outlined"
                color="primary" 
                onClick={handleCapturarGeolocalizacao} 
                disabled={salvandoAlteracao || buscandoGeo}
                startIcon={buscandoGeo ? <CircularProgress size={20} /> : <RoomIcon />}
              >
                {buscandoGeo ? 'Capturando...' : 'Obter Geolocalização'}
              </Button>
            </Grid>
            {(dadosFormularioEdicao.latitude && dadosFormularioEdicao.longitude) && (
              <Grid item xs={true}>
                <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                  Lat: {dadosFormularioEdicao.latitude?.toFixed(6) || '-'}, Lon: {dadosFormularioEdicao.longitude?.toFixed(6) || '-'}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  href={`https://www.google.com/maps/search/?api=1&query=${dadosFormularioEdicao.latitude},${dadosFormularioEdicao.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<RoomIcon />}
                  sx={{ ml: 2 }}
                >
                  Ver no Google Maps
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={salvandoAlteracao || buscandoGeo}>Cancelar</Button>
        <Button 
          onClick={handleSalvar} 
          variant="contained" 
          color="primary" 
          disabled={salvandoAlteracao || buscandoGeo}
        >
          {salvandoAlteracao ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAlteracaoProprietario; 