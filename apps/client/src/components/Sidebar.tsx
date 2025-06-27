import React, { useState } from 'react';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemDecorator, Typography } from '@mui/joy';
import { Home, PlusCircle, Settings, Info, Menu as MenuIcon, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', icon: <Home size={20} />, path: '/' },
  { label: 'Add Recipe', icon: <PlusCircle size={20} />, path: '/add' },
  { label: 'Config', icon: <Settings size={20} />, path: '/config' },
  { label: 'How it works', icon: <Info size={20} />, path: '/how-it-works' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Communicate sidebar width to parent via custom event
  React.useEffect(() => {
    const event = new CustomEvent('sidebar-width', { detail: open ? 220 : 64 });
    window.dispatchEvent(event);
  }, [open]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
        <IconButton onClick={() => setOpen(o => !o)} variant="plain" color="neutral" sx={{ mr: open ? 1 : 0 }}>
          {open ? <ChevronLeft size={22} /> : <MenuIcon size={22} />}
        </IconButton>
        {open && <Typography level="h4" sx={{ fontWeight: 900, fontSize: 22, ml: 1 }}>Meal Planner</Typography>}
      </Box>
      <List sx={{ flex: 1, mt: 2 }}>
        {navItems.map(item => (
          <ListItem key={item.path} sx={{ mb: 0.5, p: 0 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 8,
                minHeight: 48,
                px: open ? 2 : 1.5,
                justifyContent: open ? 'flex-start' : 'center',
                bgcolor: location.pathname === item.path ? 'primary.solidBg' : 'transparent',
                color: location.pathname === item.path ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: 'primary.softBg',
                  color: 'primary.solidColor',
                },
              }}
            >
              <ListItemDecorator sx={{ minWidth: 0, mr: open ? 1.5 : 0 }}>{item.icon}</ListItemDecorator>
              {open && <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
