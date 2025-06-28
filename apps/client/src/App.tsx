import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './ThemeProvider';
import AppRouter from './AppRouter';
import Sidebar from './components/Sidebar';

export default function App({ children }: { children?: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = React.useState(220);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => setSidebarWidth(e.detail);
    window.addEventListener('sidebar-width', handler);
    return () => window.removeEventListener('sidebar-width', handler);
  }, []);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div
            style={{
              flex: 1,
              marginLeft: isMobile ? 0 : sidebarWidth,
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              transition: 'margin-left 0.2s',
            }}
          >
            <AppRouter />
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
