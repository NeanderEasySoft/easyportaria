import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Dashboard as DashboardIcon,
  NetworkCheck as NetworkCheckIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PingTest from './PingTest';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    marginLeft: drawerWidth,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Venda de Pulseiras', icon: <PeopleIcon />, path: '/unidades' },
  { text: 'Cadastro de Pulseiras', icon: <InventoryIcon />, path: '/produtos' },
  { text: 'Teste de Conexão', icon: <NetworkCheckIcon />, path: '/teste' },
];
export default function Layout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={() => setOpen(!open)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box 
            component="img"
            src="/logo-blue.png"
            alt="Blue Logo"
            sx={{ 
              height: '40px',
              display: { xs: 'none', sm: 'block' }
            }}
          />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'center'
          }}>
            <Box
              component="img"
              src="/logo-easysoft.png"
              alt="EasySoft Logo"
              sx={{ 
                width: '80%',
                mb: 2
              }}
            />
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={item.path === '/' ? location.pathname === '/' : location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Main open={open}>
        <Toolbar />
        <Box sx={{ mb: 2 }}>
          <PingTest />
        </Box>
        <Outlet />
      </Main>
    </Box>
  );
}