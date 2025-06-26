import * as React from 'react';
import { CssBaseline, useColorScheme, IconButton } from '@mui/joy';
import { extendTheme, CssVarsProvider } from '@mui/joy/styles';
import { Sun, Moon } from 'lucide-react';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: '#f7f9fb', // cool white
        },
        primary: {
          solidBg: '#27ae60', // HelloFresh green
          solidHoverBg: '#219150',
          solidActiveBg: '#1e874a',
          plainColor: '#27ae60',
        },
        warning: {
          solidBg: '#ffe066', // yellow main
          solidHoverBg: '#ffd60a',
          solidActiveBg: '#ffb300',
          plainColor: '#ffd60a',
        },
        neutral: {
          solidBg: '#fff', // white for cards
        },
        text: {
          primary: '#181c1f', // dark text in light mode
          secondary: '#333',
        },
      },
    },
    dark: {
      palette: {
        background: {
          body: '#181c1f', // dark background
        },
        primary: {
          solidBg: '#7fff7f', // Brighter green for contrast
          solidHoverBg: '#4caf50',
          solidActiveBg: '#388e3c',
          plainColor: '#7fff7f',
        },
        warning: {
          solidBg: '#ffe066', // yellow main
          solidHoverBg: '#ffd60a',
          solidActiveBg: '#ffb300',
          plainColor: '#ffd60a',
        },
        neutral: {
          solidBg: '#23272a', // dark card background
        },
        text: {
          primary: '#fff', // white text in dark mode
          secondary: '#e0e0e0',
        },
      },
    },
  },
  typography: {
    body1: {
      color: 'var(--joy-palette-text-primary, #181c1f)',
    },
    body2: {
      color: 'var(--joy-palette-text-secondary, #333)',
    },
    h1: {
      color: 'var(--joy-palette-text-primary, #181c1f)',
    },
    h2: {
      color: 'var(--joy-palette-text-primary, #181c1f)',
    },
    h3: {
      color: 'var(--joy-palette-text-primary, #181c1f)',
    },
  },
  radius: {
    sm: '12px',
    md: '18px',
    lg: '28px',
  },
  shadow: {
    md: '0 4px 24px 0 rgba(39, 174, 96, 0.18)',
  },
});

export function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <IconButton
      variant="soft"
      color="primary"
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      sx={{ ml: 2 }}
      aria-label="Toggle dark mode"
    >
      {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </IconButton>
  );
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
