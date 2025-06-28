import { Box, Typography } from '@mui/joy';
import { ColorSchemeToggle } from './ThemeProvider';
import { useColorScheme } from '@mui/joy/styles';

export default function Header() {
  const { mode } = useColorScheme();
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.body',
        py: 2,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Center title
        boxShadow: 'sm',
        mb: 2,
        position: 'relative',
      }}
    >
      <Typography
        level="h2"
        sx={{
          color: mode === 'dark' ? '#fff' : 'primary.solidBg',
          fontWeight: 900,
          letterSpacing: 1,
          transition: 'color 0.2s',
          fontSize: { xs: '1.3rem', sm: '2rem', md: '2.5rem' }, // Smaller on mobile
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
