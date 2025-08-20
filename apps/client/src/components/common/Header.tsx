import { Box, Typography } from '@mui/joy';
import { ColorSchemeToggle } from '../../ThemeProvider';

export default function Header() {
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.body',
        py: 2,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'sm',
        mb: 2,
        position: 'relative',
      }}
    >
      <Typography
        level="h2"
        sx={{
          color: 'text.primary',
          fontWeight: 900,
          letterSpacing: 1,
          transition: 'color 0.2s',
          fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' },
          flex: 1,
          textAlign: 'center',
        }}
      >
        Meal Planner
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 12, sm: 24 },
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <ColorSchemeToggle />
      </Box>
    </Box>
  );
}
