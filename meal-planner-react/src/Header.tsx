import * as React from 'react';
import { Box, Typography, Stack } from '@mui/joy';
import { ColorSchemeToggle } from './ThemeProvider';
import { useColorScheme } from '@mui/joy/styles';

export default function Header() {
  const { mode } = useColorScheme();
  return (
    <Box sx={{ width: '100%', bgcolor: 'background.body', py: 2, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'sm', mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <img
          src="/illustrations/chef.svg"
          alt="Logo"
          style={{ height: 40, filter: 'none' }}
        />
        <Typography
          level="h2"
          sx={{
            color: mode === 'dark' ? '#fff' : 'primary.solidBg',
            fontWeight: 900,
            letterSpacing: 1,
            transition: 'color 0.2s',
          }}
        >
          Meal Planner
        </Typography>
      </Stack>
      <ColorSchemeToggle />
    </Box>
  );
}
