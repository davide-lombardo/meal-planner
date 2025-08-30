import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './ThemeProvider';
import AppRouter from './AppRouter';
import Sidebar from './components/common/Sidebar';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { syncKindeTokenToSession } from './utils/authSession';

export default function App() {
  const [sidebarWidth, setSidebarWidth] = React.useState(220);
  const [isMobile, setIsMobile] = React.useState(false);
  const { getToken, isAuthenticated } = useKindeAuth();

  React.useEffect(() => {
    const handler = (e: CustomEvent) => setSidebarWidth(e.detail);
    window.addEventListener('sidebar-width', handler as EventListener);
    return () => window.removeEventListener('sidebar-width', handler as EventListener);
  }, []);

  // Sync Kinde token to sessionStorage whenever authentication changes
  React.useEffect(() => {
    async function syncToken() {
      if (isAuthenticated) {
        const token = await getToken();
  syncKindeTokenToSession(token ?? null);
      } else {
        syncKindeTokenToSession(null);
      }
    }
    syncToken();
  }, [isAuthenticated, getToken]);

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
              transition: 'margin-left 0.2s ease-in-out, width 0.2s ease-in-out, padding 0.2s ease-in-out', 
            }}
          >
            <AppRouter />
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}