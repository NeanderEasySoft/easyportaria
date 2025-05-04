import { Box, CircularProgress, Typography } from '@mui/material'
import Logo from '../assets/logo.png' // caminho relativo ao componente

function LoadingScreen() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      textAlign="center"
    >
      <img
        src={Logo}
        alt="Logo EasyBlue"
        style={{ width: 120, height: 'auto', marginBottom: 24 }}
      />

      <Typography variant="h6" gutterBottom>
        Carregando EasyBlue...
      </Typography>

      <CircularProgress color="primary" />
    </Box>
  )
}

export default LoadingScreen
