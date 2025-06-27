import * as React from 'react';
import { CssBaseline, useColorScheme, IconButton } from '@mui/joy';
import { extendTheme, CssVarsProvider } from '@mui/joy/styles';
import { Sun, Moon } from 'lucide-react';

// Orange as primary accent, blue as secondary, neutrals for backgrounds
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: '#f7f7f7', // 60%: neutral light
        },
        primary: {
          solidBg: '#ff8500', // 10%: vibrant orange
          solidHoverBg: '#e67300',
          solidActiveBg: '#cc6600',
          plainColor: '#ff8500',
        },
        secondary: {
          solidBg: '#2d3a4a', // 30%: deep blue for cards/surfaces
          solidHoverBg: '#223042',
          solidActiveBg: '#1a2533',
          plainColor: '#2d3a4a',
        },
        warning: {
          solidBg: '#ffe066',
          solidHoverBg: '#ffd60a',
          solidActiveBg: '#ffb300',
          plainColor: '#ffd60a',
        },
        neutral: {
          solidBg: '#fff', // white for cards
        },
        text: {
          primary: '#181c1f', // high contrast text
          secondary: '#333',
        },
      },
    },
    dark: {
      palette: {
        background: {
          body: '#181c1f', // 60%: dark neutral
        },
        primary: {
          solidBg: '#ff8500', // 10%: orange accent
          solidHoverBg: '#e67300',
          solidActiveBg: '#cc6600',
          plainColor: '#ff8500',
        },
        secondary: {
          solidBg: '#223042', // 30%: deep blue for cards/surfaces
          solidHoverBg: '#1a2533',
          solidActiveBg: '#141a22',
          plainColor: '#223042',
        },
        warning: {
          solidBg: '#ffe066',
          solidHoverBg: '#ffd60a',
          solidActiveBg: '#ffb300',
          plainColor: '#ffd60a',
        },
        neutral: {
          solidBg: '#23272a', // dark card background
        },
        text: {
          primary: '#fff', // high contrast text
          secondary: '#e0e0e0',
        },
      },
    },
  },
});

export function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <IconButton
      variant="plain"
      color="primary"
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1200 }}
      aria-label="Toggle dark mode"
    >
      {mode === 'light' ? <Moon /> : <Sun />}
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
