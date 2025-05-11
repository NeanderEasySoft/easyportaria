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
  IconButton,
  Box,
} from '@mui/material';
import {
  Room as RoomIcon
} from '@mui/icons-material';
import { IMaskInput } from 'react-imask';
import { Unidade } from '../services/proprietarios.service';

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
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (proprietario) {
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
        endereco: proprietario.endereco,
        numero: proprietario.numero,
        latitude: proprietario.latitude,
        longitude: proprietario.longitude,
      });
      setErroFormularioEdicao('');
    } else {
      const { altitude, ...resto } = dadosFormularioEdicao;
      setDadosFormularioEdicao(resto);
    }
  }, [proprietario, open]);

  useEffect(() => {
    if (dadosFormularioEdicao.latitude && dadosFormularioEdicao.longitude) {
      setMapImageUrl(null);
    } else {
      setMapImageUrl(null);
    }
  }, [dadosFormularioEdicao.latitude, dadosFormularioEdicao.longitude]);

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
      console.error("Erro ao salvar alteração no modal:", err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro desconhecido ao salvar alterações.';
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
        
        <Grid component="form" noValidate autoComplete="off" container spacing={2} sx={{ mt: 1 }}>
        
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
                <MenuItem value={"Proprietário"}>Proprietário</MenuItem>
                <MenuItem value={"Inquilino"}>Inquilino</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="dense"
              id="endereco"
              name="endereco"
              label="Endereço"
              value={dadosFormularioEdicao.endereco || ''}
              onChange={handleChangeFormularioEdicao}
              disabled={salvandoAlteracao}
            />

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
            <Grid item>
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
              <Grid item xs>
                <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                  Lat: {dadosFormularioEdicao.latitude?.toFixed(6) || '-'}, Lon: {dadosFormularioEdicao.longitude?.toFixed(6) || '-'}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  href={`https://www.google.com/maps/search/?api=1&query=${dadosFormularioEdicao.latitude},${dadosFormularioEdicao.longitude}`}
                  target="_blank" // Abrir em nova aba
                  rel="noopener noreferrer" // Por segurança
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
        <Button onClick={handleClose} color="primary" disabled={salvandoAlteracao || buscandoGeo}>
          Cancelar
        </Button>
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