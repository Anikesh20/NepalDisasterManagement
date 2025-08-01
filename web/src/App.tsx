import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { AppBar, Box, Button, createTheme, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, ThemeProvider, Toolbar, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link, Navigate, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import Dashboard from './modules/Dashboard';
import Disasters from './modules/Disasters';
import Donations from './modules/Donations';
import HistoricalData from './modules/HistoricalData';
import Reports from './modules/Reports';
import Users from './modules/Users';
import Volunteers from './modules/Volunteers';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
  { text: 'User Management', path: '/users', icon: <PeopleIcon />, label: 'User Management' },
  { text: 'Report Management', path: '/reports', icon: <AssignmentIcon />, label: 'Report Management' },
  { text: 'Donation Management', path: '/donations', icon: <MonetizationOnIcon />, label: 'Donation Management' },
  { text: 'Volunteer Management', path: '/volunteers', icon: <VolunteerActivismIcon />, label: 'Volunteer Management' },
  { text: 'Historical Data', path: '/historical-data', icon: <HistoryEduIcon />, label: 'Historical Data' },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: '#1a237e',
          color: '#fff',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              aria-label={item.label}
              sx={{
                color: location.pathname === item.path ? '#fff' : '#c7d2fe',
                background: location.pathname === item.path ? '#3949ab' : 'transparent',
                borderRadius: 2,
                mb: 1,
                '&:hover': { background: '#3949ab', color: '#fff' },
              }}
              // REMOVE onClick={onClose} so sidebar stays open
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ background: '#3949ab' }} />
        <Button
          startIcon={<LogoutIcon />}
          sx={{
            color: '#fff',
            justifyContent: 'flex-start',
            width: '100%',
            borderRadius: 2,
            mt: 2,
            mb: 2,
            pl: 3,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 16,
            '&:hover': { background: '#3949ab', color: '#fff' },
          }}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 240;
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#1a237e' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          transition: 'margin 0.3s cubic-bezier(.4,0,.2,1)',
          marginLeft: mobileOpen ? `${drawerWidth}px` : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/disasters" element={<Disasters />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/donations" element={<Donations />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/historical-data" element={<HistoricalData />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const theme = createTheme({
  palette: {
    primary: { main: '#1a237e' },
    secondary: { main: '#3949ab' },
    background: { default: '#f8f9fa' },
  },
  typography: {
    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
