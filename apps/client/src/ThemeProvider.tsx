import * as React from 'react';
import { CssBaseline, useColorScheme, IconButton } from '@mui/joy';
import { extendTheme, CssVarsProvider } from '@mui/joy/styles';
import { lightTheme, darkTheme } from './theme';
import { Sun, Moon } from 'lucide-react';

declare module '@mui/joy/styles' {
  interface Palette {
    category: typeof lightTheme.category;
    shadow: typeof lightTheme.shadow;
  }
}

const theme = extendTheme({
  colorSchemes: {
    light: { palette: { ...lightTheme } },
    dark: { palette: { ...darkTheme } },
  },
});
// ...existing code...

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
