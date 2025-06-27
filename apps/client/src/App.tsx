import * as React from 'react';
import ThemeProvider from './ThemeProvider';
import AppRouter from './AppRouter';

export default function App({ children }: { children?: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}
