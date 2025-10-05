import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c3aed', // Modern purple
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    secondary: {
      main: '#06b6d4', // Cyan accent
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#0f0f1a', // Deep dark blue-black
      paper: '#1a1a2e', // Slightly lighter
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#7c3aed #1a1a2e',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1a1a2e',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#7c3aed',
            borderRadius: '4px',
            '&:hover': {
              background: '#a78bfa',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(124, 58, 237, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(124, 58, 237, 0.3)',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a2e',
          borderRadius: 12,
          border: '1px solid rgba(124, 58, 237, 0.1)',
          '&:before': {
            display: 'none',
          },
          '&:hover': {
            borderColor: 'rgba(124, 58, 237, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            borderRadius: 10,
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(124, 58, 237, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(124, 58, 237, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7c3aed',
              borderWidth: '2px',
            },
            '& input': {
              color: '#f1f5f9',
            },
            '& textarea': {
              color: '#f1f5f9',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
            '&.Mui-focused': {
              color: '#7c3aed',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(26, 26, 46, 0.6)',
          transition: 'all 0.3s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(124, 58, 237, 0.2)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(124, 58, 237, 0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7c3aed',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(124, 58, 237, 0.25)',
            '&:hover': {
              backgroundColor: 'rgba(124, 58, 237, 0.35)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          border: '1px solid rgba(124, 58, 237, 0.2)',
          backgroundImage: 'linear-gradient(to bottom, #1a1a2e, #16162a)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: '#7c3aed',
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
