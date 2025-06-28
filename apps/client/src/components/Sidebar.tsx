import React, { useState } from 'react';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemDecorator, Typography, Drawer } from '@mui/joy';
import { Home, Settings, Info, Menu as MenuIcon, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorSchemeToggle } from '../ThemeProvider';

// Explicitly type navItems to avoid TS 'never' errors
interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}
const navItems: NavItem[] = [
  { label: 'Home', icon: <Home size={20} />, path: '/' },
  { label: 'Config', icon: <Settings size={20} />, path: '/config' },
  { label: 'How it works', icon: <Info size={20} />, path: '/how-it-works' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Communicate sidebar width to parent via custom event (desktop only)
  React.useEffect(() => {
    const event = new CustomEvent('sidebar-width', { detail: open ? 220 : 64 });
    window.dispatchEvent(event);
  }, [open]);

  // Responsive check
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;

  // Sidebar content (shared for desktop and mobile)
  const sidebarContent = (
    <Box sx={{ width: isMobile ? '100vw' : open ? 220 : 64, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.level1' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
        {!isMobile && (
          <IconButton onClick={() => setOpen(o => !o)} variant="plain" color="neutral" sx={{ mr: open ? 1 : 0 }}>
            {open ? <ChevronLeft size={22} /> : <MenuIcon size={22} />}
          </IconButton>
        )}
        {/* No sidebar title */}
      </Box>
      <List sx={{ flex: 1, mt: 2 }}>
        {navItems.map(item => (
          <ListItem key={item.path} sx={{ mb: 0.5, p: 0 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 8,
                minHeight: 48,
                px: open || isMobile ? 2 : 1.5,
                justifyContent: open || isMobile ? 'flex-start' : 'center',
                bgcolor: location.pathname === item.path ? 'primary.solidBg' : 'transparent',
                color: location.pathname === item.path ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: 'primary.softBg',
                  color: 'primary.solidColor',
                },
              }}
            >
              <ListItemDecorator
                sx={{
                  minWidth: 0,
                  mr: open || isMobile ? 2 : 0,
                  ml: 1,
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : '#222',
                }}
              >
                {item.icon}
              </ListItemDecorator>
              {(open || isMobile) && <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Mobile burger button
  if (isMobile) {
    return (
      <>
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 2100, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            variant="plain"
            color="neutral"
            sx={{ mr: 1 }}
            aria-label="Open sidebar"
          >
            <MenuIcon size={28} />
          </IconButton>
          {/* Removed ColorSchemeToggle from Sidebar on mobile */}
        </Box>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          anchor="left"
          size="md"
          sx={{ zIndex: 2100 }}
          slotProps={{ content: { sx: { p: 0, width: '100vw', maxWidth: '100vw', position: 'relative' } } }}
          hideBackdrop={false}
        >
          {/* Close icon at top right of drawer */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2, pb: 0 }}>
            <IconButton onClick={() => setMobileOpen(false)} variant="plain" color="neutral" aria-label="Close sidebar">
              <ChevronLeft size={28} />
            </IconButton>
          </Box>
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  // Desktop sidebar
  return (
    <Box
      sx={{
        width: open ? 220 : 64,
        transition: 'width 0.2s',
        bgcolor: 'background.level1',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        boxShadow: 'md',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {sidebarContent}
    </Box>
  );
}
