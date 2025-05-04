import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as DeliveryIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

// Estilização do card de estatística
const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: '50%',
  marginBottom: theme.spacing(2),
}));

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface DashboardData {
  totalPedidos: number;
  totalFaturamento: number;
  pedidosEntregues: number;
  totalUnidades: number;
  totalProdutosVendidos: number;
  totalProdutosPagos: number;
  pedidosPorStatus: {
    status: string;
    quantidade: number;
  }[];
  quantidadePorProduto: {
    produto: string;
    quantidade: number;
  }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/dashboard');
      setData(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Cards de Estatísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 calc(16.666% - 24px)', minWidth: 200 }}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'primary.light' }}>
              <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 30 }} />
            </IconWrapper>
            <Typography variant="h4" component="div">
              {data.totalPedidos}
            </Typography>
            <Typography color="text.secondary" variant="subtitle1" align="center">
              Pedidos Totais
            </Typography>
          </StatsCard>
        </Box>

        <Box sx={{ flex: '1 1 calc(16.666% - 24px)', minWidth: 200 }}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'success.light' }}>
              <MoneyIcon sx={{ color: 'success.main', fontSize: 30 }} />
            </IconWrapper>
            <Typography variant="h4" component="div">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(data.totalFaturamento)}
            </Typography>
            <Typography color="text.secondary" variant="subtitle1" align="center">
              Faturamento Total
            </Typography>
          </StatsCard>
        </Box>

        <Box sx={{ flex: '1 1 calc(16.666% - 24px)', minWidth: 200 }}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'warning.light' }}>
              <DeliveryIcon sx={{ color: 'warning.main', fontSize: 30 }} />
            </IconWrapper>
            <Typography variant="h4" component="div">
              {data.pedidosEntregues}
            </Typography>
            <Typography color="text.secondary" variant="subtitle1" align="center">
              Pedidos Entregues
            </Typography>
          </StatsCard>
        </Box>

        <Box sx={{ flex: '1 1 calc(16.666% - 24px)', minWidth: 200 }}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'info.light' }}>
              <PeopleIcon sx={{ color: 'info.main', fontSize: 30 }} />
            </IconWrapper>
            <Typography variant="h4" component="div">
              {data.totalUnidades}
            </Typography>
            <Typography color="text.secondary" variant="subtitle1" align="center">
              Total de Unidades
            </Typography>
          </StatsCard>
        </Box>

        <Box sx={{ flex: '1 1 calc(16.666% - 24px)', minWidth: 200 }}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'secondary.light' }}>
              <InventoryIcon sx={{ color: 'secondary.main', fontSize: 30 }} />
            </IconWrapper>
            <Typography variant="h4" component="div">
              {data.totalProdutosVendidos}
            </Typography>
            <Typography color="text.secondary" variant="subtitle1" align="center">
              Pulseiras Vendidas
            </Typography>
          </StatsCard>
        </Box>

        <Box sx={{ flex: '1 1 calc(16.666% - 24px)', minWidth: 200 }}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'success.light' }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 30 }} />
            </IconWrapper>
            <Typography variant="h4" component="div">
              {data.totalProdutosPagos}
            </Typography>
            <Typography color="text.secondary" variant="subtitle1" align="center">
              Pulseiras Pagas
            </Typography>
          </StatsCard>
        </Box>
      </Box>

      {/* Gráficos e Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>

        {/* Adicionar grade de Cards para Quantidade por Produto */}
        <Box sx={{ width: '100%', mb: 3 }}> {/* Container para a seção de cards */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Quantidade Vendida por Produto
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {data.quantidadePorProduto.map((item) => (
              <Paper
                key={item.produto} // Usar nome do produto como chave
                sx={{
                  p: 2,
                  flex: '1 1 calc(20% - 16px)', // Tenta encaixar 5 por linha
                  minWidth: 150, // Largura mínima
                  textAlign: 'center',
                  bgcolor: 'background.paper', // Garante fundo padrão
                }}
                elevation={2}
              >
                <Typography variant="h5" component="div" sx={{ color: '#00C49F' }}> {/* Valor em destaque */}
                  {item.quantidade}
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}> {/* Nome do produto */}
                  {item.produto}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Gráfico de Pizza de Status dos Pedidos (mantido) */}
        <Box sx={{ flex: '1 1 100%', minWidth: 300 }}> {/* Fazer ocupar a linha inteira agora */}
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Status dos Pedidos
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pedidosPorStatus}
                  dataKey="quantidade"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.pedidosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={entry.status} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 