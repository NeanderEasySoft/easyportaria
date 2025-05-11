import { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { pingServer } from '../services/ping.service';

const PingTest = () => {
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    console.log('VITE_API_URL lida pelo frontend:', import.meta.env.VITE_API_URL);
    setLoading(true);
    setError('');
    setResponse('');
    console.log('Iniciando teste de ping...');

    try {
      const result = await pingServer();
      setResponse(result.message);
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      console.log('Teste de ping finalizado.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Teste de Conexão com o Servidor
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handlePing}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testando...' : 'Testar Conexão'}
      </Button>

      {response && (
        <Alert severity="success" sx={{ mb: 1 }}>
          Resposta do servidor: {response}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default PingTest;