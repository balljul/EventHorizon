'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark' | 'cosmic';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

const createCustomTheme = (mode: ThemeMode): Theme => {
  const getThemeConfig = () => {
    switch (mode) {
      case 'dark':
        return {
          palette: {
            mode: 'dark' as const,
            primary: {
              main: '#667eea',
              light: '#764ba2',
              dark: '#4facfe',
            },
            secondary: {
              main: '#f093fb',
              light: '#ffeaa7',
              dark: '#ff6b6b',
            },
            background: {
              default: '#0a0a0a',
              paper: 'rgba(25, 25, 25, 0.95)',
            },
            text: {
              primary: 'rgba(255, 255, 255, 0.95)',
              secondary: 'rgba(255, 255, 255, 0.7)',
            },
          },
        };
      case 'cosmic':
        return {
          palette: {
            mode: 'dark' as const,
            primary: {
              main: '#7C4DFF',
              light: '#B388FF',
              dark: '#651FFF',
            },
            secondary: {
              main: '#FF4081',
              light: '#FF80AB',
              dark: '#F50057',
            },
            background: {
              default: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)',
              paper: 'rgba(15, 15, 35, 0.95)',
            },
            text: {
              primary: '#ffffff',
              secondary: 'rgba(255, 255, 255, 0.8)',
            },
          },
        };
      default: // light
        return {
          palette: {
            mode: 'light' as const,
            primary: {
              main: '#4facfe',
              light: '#00f2fe',
              dark: '#2196F3',
            },
            secondary: {
              main: '#764ba2',
              light: '#f093fb',
              dark: '#667eea',
            },
            background: {
              default: '#f8fafc',
              paper: 'rgba(255, 255, 255, 0.95)',
            },
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
            },
          },
        };
    }
  };

  return createTheme({
    ...getThemeConfig(),
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.125rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(20px)',
            border: mode === 'light' 
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '10px 24px',
          },
          contained: {
            boxShadow: mode === 'light'
              ? '0 4px 12px rgba(79, 172, 254, 0.3)'
              : '0 4px 12px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 6px 20px rgba(79, 172, 254, 0.4)'
                : '0 6px 20px rgba(102, 126, 234, 0.5)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px)',
            border: mode === 'light' 
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
  });
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('cosmic');

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode && ['light', 'dark', 'cosmic'].includes(savedMode)) {
      setMode(savedMode);
    }
  }, []);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = createCustomTheme(mode);

  const value = {
    mode,
    setMode: handleSetMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};