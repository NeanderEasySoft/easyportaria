import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
} from '@mui/material'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import PingTest from './components/PingTest'
import LoadingScreen from './components/LoadingScreen'

// Lazy imports (pages)
//const Dashboard = lazy(() => import('./pages/Dashboard')) // Comentado
//const Unidades = lazy(() => import('./pages/Unidades'))   // Comentado
//const Produtos = lazy(() => import('./pages/Produtos'))   // Comentado
const Proprietarios = lazy(() => import('./pages/Proprietarios'))

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
})

function App() {
  if (import.meta.env.MODE !== 'production') {
    console.log('Ambiente:', import.meta.env.VITE_APP_ENV)
    console.log('API URL:', import.meta.env.VITE_API_URL)
    if (import.meta.env.VITE_ENABLE_LOGS === 'true') {
      console.log('Logs ativados')
    }
  }

  const appTitle = import.meta.env.VITE_APP_TITLE || 'Sistema'
  const appVersion = import.meta.env.VITE_APP_VERSION || '0.0.1'

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box minHeight="100vh" display="flex" flexDirection="column">
          <Box flex="1">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* <Route index element={<Dashboard />} /> */}
                  {/* <Route path="/unidades" element={<Unidades />} /> */}
                  {/* <Route path="/produtos" element={<Produtos />} /> */}
                  <Route path="/teste" element={<PingTest />} />
                  <Route path="/proprietarios" element={<Proprietarios />} />
                </Route>
              </Routes>
            </Suspense>
          </Box>
          <Box component="footer" p={2} textAlign="center" bgcolor="#f5f5f5">
            <Typography variant="body2" color="textSecondary">
              {appTitle} - versão {appVersion}
            </Typography>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
