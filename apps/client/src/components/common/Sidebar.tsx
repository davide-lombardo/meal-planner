import React, { useState, useEffect } from 'react';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemDecorator, Typography, Drawer, useTheme } from '@mui/joy';
import { Home, Settings, Info, Menu as MenuIcon, ChevronLeft, Refrigerator, History, X as CloseIcon, CookingPot, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', icon: <Home size={20} />, path: '/' },
  { label: 'Discover', icon: <CookingPot size={20} />, path: '/discovery' },
  { label: 'History', icon: <History size={20} />, path: '/history' },
  { label: 'Calendar', icon: <CalendarIcon size={20} />, path: '/calendar' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-width', { detail: open ? 220 : 64 }));
  }, [open]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const renderNavList = () => (
    <List
      sx={{
        flex: 1,
        mt: 2,
        ...(isMobile && mobileOpen
          ? {
              width: '100%',
              maxWidth: '100vw',
              boxSizing: 'border-box',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              minHeight: 0,
            }
          : {}),
      }}
    >
      {navItems.map(({ label, icon, path }) => {
        const selected = location.pathname === path;
        // Mobile-only styles
        const mobileItemStyles = isMobile && mobileOpen ? {
          minHeight: 72,
          px: 0,
          justifyContent: 'center',
          alignItems: 'center',
          width: 'calc(100vw - 32px)',
          maxWidth: '420px',
          boxSizing: 'border-box',
        } : {};
        const mobileIconStyles = isMobile && mobileOpen ? {
          minWidth: 0,
          mr: 0,
          ml: 2, 
          fontSize: 32,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        } : {};
        const mobileLabelStyles = isMobile && mobileOpen ? {
          fontSize: 22,
          textAlign: 'center',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        } : {};
        return (
          <ListItem key={path} sx={{ mb: 0.5, p: 0 }}>
            <ListItemButton
              selected={selected}
              onClick={() => handleNav(path)}
              sx={{
                borderRadius: 'md',
                minHeight: 48,
                px: open || isMobile ? 2 : 1.5,
                justifyContent: open || isMobile ? 'flex-start' : 'center',
                overflow: 'hidden',
                transition: 'background-color 0.2s, color 0.2s, padding-left 0.2s, padding-right 0.2s, width 0.2s',
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: theme.palette.primary[theme.palette.mode === 'dark' ? 700 : 100],
                  color: theme.palette.primary[theme.palette.mode === 'dark' ? 100 : 700],
                  '& .Sidebar-icon, & .Sidebar-label': {
                    color: theme.palette.primary[theme.palette.mode === 'dark' ? 100 : 700],
                  },
                },
                '&:hover': {
                  bgcolor: theme.palette.primary[theme.palette.mode === 'dark' ? 700 : 100],
                  color: theme.palette.primary[theme.palette.mode === 'dark' ? 100 : 700],
                  '& .Sidebar-icon, & .Sidebar-label': {
                    color: theme.palette.primary[theme.palette.mode === 'dark' ? 100 : 700],
                  },
                },
                '&:focus-visible': {
                  outline: 'none',
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.neutral.outlinedBorder}`,
                },
                ...mobileItemStyles,
              }}
            >
              <ListItemDecorator
                className="Sidebar-icon"
                sx={{
                  minWidth: 0,
                  mr: open || isMobile ? 2 : 0,
                  ml: 1,
                  color: selected
                    ? theme.palette.primary[theme.palette.mode === 'dark' ? 100 : 700]
                    : theme.palette.neutral[theme.palette.mode === 'dark' ? 100 : 700],
                  transition: 'color 0.2s, margin-right 0.2s',
                  ...mobileIconStyles,
                }}
              >
                {React.cloneElement(icon, isMobile && mobileOpen ? { size: 32 } : { size: 20 })}
              </ListItemDecorator>

              {(open || isMobile) && (
                <Typography
                  className="Sidebar-label"
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    opacity: open || isMobile ? 1 : 0,
                    transition: 'color 0.2s, opacity 0.2s ease-out',
                    color: selected
                      ? theme.palette.primary[theme.palette.mode === 'dark' ? 100 : 700]
                      : theme.palette.neutral[theme.palette.mode === 'dark' ? 100 : 700],
                    ...mobileLabelStyles,
                  }}
                >
                  {label}
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const sidebarBoxProps = {
    sx: {
      width: isMobile ? '100vw' : open ? 220 : 64,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.level1',
      transition: 'width 0.2s ease-in-out, flex-basis 0.2s ease-in-out',
    },
  };

  if (isMobile) {
    return (
      <>
        <Box sx={{ position: 'fixed', top: 4, left: 16, zIndex: 1000, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            variant="plain"
            color="neutral"
            aria-label="Open sidebar"
            sx={{
              bgcolor: 'background.level2',
              borderRadius: '50%',
              boxShadow: 'sm',
              p: 1,
              '&:hover': {
                bgcolor: 'background.level3',
              },
            }}
          >
            <MenuIcon size={28} />
          </IconButton>
        </Box>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          anchor="left"
          size="md"
          sx={{ zIndex: 1000 }}
          slotProps={{ content: { sx: { p: 0, width: '100vw', maxWidth: '100vw', position: 'relative' } } }}
          hideBackdrop={false}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2, pb: 0 }}>
            <IconButton onClick={() => setMobileOpen(false)} variant="plain" color="neutral" aria-label="Close sidebar">
              <CloseIcon size={28} />
            </IconButton>
          </Box>
          <Box {...sidebarBoxProps}>{renderNavList()}</Box>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: open ? 220 : 64,
        transition: 'width 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-right 0.3s ease-in-out',
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
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
        {!isMobile && (
          <IconButton onClick={() => setOpen((o) => !o)} variant="plain" color="neutral" sx={{ mr: open ? 1 : 0, transition: 'margin-right 0.2s' }} aria-label={open ? "Close sidebar" : "Open sidebar"}>
            {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </IconButton>
        )}
      </Box>
      <Box {...sidebarBoxProps}>{renderNavList()}</Box>
    </Box>
  );
}