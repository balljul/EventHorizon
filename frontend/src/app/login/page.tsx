'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Zoom,
  Grow,
  IconButton,
  InputAdornment,
  Chip,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  Email,
  RocketLaunch,
  Stars,
  AutoAwesome,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const particleFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
  25% { transform: translateY(-10px) translateX(5px); opacity: 1; }
  50% { transform: translateY(-5px) translateX(-5px); opacity: 0.8; }
  75% { transform: translateY(-15px) translateX(3px); opacity: 0.9; }
`;

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingParticles = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `${particleFloat} ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.6,
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode
            ? 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 219, 226, 0.3) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
          zIndex: 0,
        },
      }}
    >
      <FloatingParticles />
      
      {/* Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <IconButton
          onClick={() => setIsDarkMode(!isDarkMode)}
          sx={{
            color: 'white',
            backgroundColor: alpha(theme.palette.background.paper, 0.1),
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>

      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
          }}
        >
          <Fade in timeout={1000}>
            <Paper
              elevation={24}
              sx={{
                padding: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                background: isDarkMode
                  ? 'linear-gradient(145deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 35, 0.95) 100%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: isDarkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: isDarkMode
                  ? '0 32px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 32px 64px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  animation: `${shimmer} 3s ease-in-out infinite`,
                },
              }}
            >
              <Slide direction="down" in timeout={800}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 4,
                  }}
                >
                  <Zoom in timeout={1200}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '50%',
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                          : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        mb: 3,
                        position: 'relative',
                        animation: `${pulse} 2s ease-in-out infinite`,
                        boxShadow: isDarkMode
                          ? '0 20px 40px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.1)'
                          : '0 20px 40px rgba(79, 172, 254, 0.4)',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
                          borderRadius: '50%',
                          zIndex: -1,
                          animation: `${float} 6s ease-in-out infinite`,
                        },
                      }}
                    >
                      <RocketLaunch sx={{ fontSize: 32 }} />
                    </Box>
                  </Zoom>
                  
                  <Typography 
                    component="h1" 
                    variant="h3" 
                    fontWeight="bold"
                    sx={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      textAlign: 'center',
                    }}
                  >
                    EventHorizon
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Stars sx={{ color: isDarkMode ? '#ffd700' : '#ff6b6b', fontSize: 16 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                        fontWeight: 500,
                      }}
                    >
                      Welcome to the Future
                    </Typography>
                    <AutoAwesome sx={{ color: isDarkMode ? '#ffd700' : '#ff6b6b', fontSize: 16 }} />
                  </Box>

                  <Chip
                    label="Experience Innovation"
                    sx={{
                      background: isDarkMode
                        ? 'linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))'
                        : 'linear-gradient(45deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2))',
                      color: isDarkMode ? '#667eea' : '#4facfe',
                      fontWeight: 600,
                      borderRadius: 3,
                      border: isDarkMode 
                        ? '1px solid rgba(102, 126, 234, 0.3)'
                        : '1px solid rgba(79, 172, 254, 0.3)',
                    }}
                  />
                </Box>
              </Slide>

              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      width: '100%', 
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : undefined,
                      color: isDarkMode ? '#ff6b6b' : undefined,
                      border: isDarkMode ? '1px solid rgba(244, 67, 54, 0.2)' : undefined,
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <Grow in timeout={1000}>
                <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{ width: '100%' }}
                >
                  <TextField
                    {...register('email')}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: isDarkMode ? '#667eea' : '#4facfe' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: isDarkMode 
                            ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                            : '0 8px 25px rgba(79, 172, 254, 0.3)',
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: isDarkMode 
                            ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                            : '0 8px 25px rgba(79, 172, 254, 0.4)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
                      },
                      '& .MuiOutlinedInput-input': {
                        color: isDarkMode ? 'white' : undefined,
                      },
                    }}
                  />
                  
                  <TextField
                    {...register('password')}
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: isDarkMode ? '#667eea' : '#4facfe' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: isDarkMode 
                            ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                            : '0 8px 25px rgba(79, 172, 254, 0.3)',
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: isDarkMode 
                            ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                            : '0 8px 25px rgba(79, 172, 254, 0.4)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
                      },
                      '& .MuiOutlinedInput-input': {
                        color: isDarkMode ? 'white' : undefined,
                      },
                    }}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      backgroundSize: '200% 200%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      textTransform: 'none',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(102, 126, 234, 0.4)'
                        : '0 8px 32px rgba(79, 172, 254, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        backgroundPosition: '100% 0',
                        boxShadow: isDarkMode
                          ? '0 12px 40px rgba(102, 126, 234, 0.6)'
                          : '0 12px 40px rgba(79, 172, 254, 0.6)',
                      },
                      '&:disabled': {
                        background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#ccc',
                        transform: 'none',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                        transition: 'left 0.5s',
                      },
                      '&:hover::before': {
                        left: '100%',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={28} sx={{ color: 'white' }} />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RocketLaunch />
                        Launch Into EventHorizon
                      </Box>
                    )}
                  </Button>
                </Box>
              </Grow>
            </Paper>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}