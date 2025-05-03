import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Unidades from './pages/Unidades';
import Produtos from './pages/Produtos';
import Dashboard from './pages/Dashboard';
import PingTest from './components/PingTest';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/unidades" element={<Unidades />} />
            <Route path="/produtos" element={<Produtos />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <PingTest />
    </ThemeProvider>
  );
}

export default App;