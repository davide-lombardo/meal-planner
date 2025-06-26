import * as React from 'react';
import ThemeProvider from './ThemeProvider';
import AppRouter from './AppRouter';
import Header from './Header';

export default function App({ children }: { children?: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Header />
      <AppRouter />
    </ThemeProvider>
  );
}
