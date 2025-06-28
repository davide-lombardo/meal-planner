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
      {children}
    </CssVarsProvider>
  );
}
