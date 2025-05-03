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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  faturamentoPorMes: {
    mes: string;
    valor: number;
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

      {/* Gráficos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 calc(66.666% - 12px)', minWidth: 400 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Faturamento por Mês
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.faturamentoPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value)
                  }
                />
                <Legend />
                <Bar dataKey="valor" name="Faturamento" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 calc(33.333% - 12px)', minWidth: 300 }}>
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