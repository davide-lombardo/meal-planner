import * as React from 'react';
import { CssBaseline, useColorScheme, IconButton } from '@mui/joy';
import { extendTheme, CssVarsProvider } from '@mui/joy/styles';
import { Sun, Moon } from 'lucide-react';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: '#f7f7f7',
          level1: '#fff',
          level2: '#f0f0f0',
        },
        primary: {
          solidBg: '#ff8500',
          solidHoverBg: '#e67300',
          solidActiveBg: '#cc6600',
          plainColor: '#ff8500',
        },
        warning: {
          solidBg: '#ffe066',
          solidHoverBg: '#ffd60a',
          solidActiveBg: '#ffb300',
          plainColor: '#ffd60a',
        },
        neutral: {
          solidBg: '#fff',
        },
        text: {
          primary: '#181c1f',
          secondary: '#666',
        },
        divider: '#e0e0e0',
      },
    },
    dark: {
      palette: {
        background: {
          body: '#181c1f',
          level1: '#23272a',
          level2: '#23272a',
        },
        primary: {
          solidBg: '#ff8500',
          solidHoverBg: '#e67300',
          solidActiveBg: '#cc6600',
          plainColor: '#ff8500',
        },
        warning: {
          solidBg: '#ffe066',
          solidHoverBg: '#ffd60a',
          solidActiveBg: '#ffb300',
          plainColor: '#ffd60a',
        },
        neutral: {
          solidBg: '#23272a',
        },
        text: {
          primary: '#fff',
          secondary: '#aaa',
        },
        divider: '#333',
      },
    },
  },
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
  },
  shadow: {
    sm: '0 1px 4px rgba(0,0,0,0.06)',
    md: '0 2px 8px rgba(0,0,0,0.10)',
    lg: '0 4px 16px rgba(0,0,0,0.12)',
  },
  typography: {
    h1: { fontWeight: 900, fontSize: '2.125rem', letterSpacing: '0.05em' },
    h2: { fontWeight: 800, fontSize: '1.375rem' },
    h3: { fontWeight: 700, fontSize: '1.125rem' },
  },
});

export function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <IconButton
      variant="plain"
      color="neutral"
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      sx={{ ml: 1 }}
    >
      {mode === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
    </IconButton>
  );
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <style>{`
        html, body {
          font-family: Inter, Roboto, Arial, sans-serif;
        }
        *:focus-visible {
          outline: 2px solid #ff8500;
          outline-offset: 2px;
        }
      `}</style>
      {children}
    </CssVarsProvider>
  );
}
