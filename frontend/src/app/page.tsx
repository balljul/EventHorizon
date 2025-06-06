'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { CircularProgress, Box, IconButton, Fade } from '@mui/material';
import { Brightness4, Brightness7, Palette } from '@mui/icons-material';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';
import MainLayout from '../components/layout/MainLayout';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { mode, setMode } = useThemeMode();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: mode === 'cosmic' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)'
            : mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user is admin (assuming admin role is in user.roles array)
  const isAdmin = user.roles?.includes('admin') || user.roles?.includes('administrator');

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'cosmic'] as const;
    const currentIndex = themes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % themes.length;
    setMode(themes[nextIndex]);
  };

  return (
    <MainLayout>
      {/* Theme Toggle */}
      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <Fade in timeout={1000}>
          <IconButton
            onClick={cycleTheme}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {mode === 'cosmic' ? <Palette /> : mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Fade>
      </Box>

      {/* Render appropriate dashboard based on user role */}
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </MainLayout>
  );
}