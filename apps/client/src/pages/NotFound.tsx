import { Box, Typography, Button } from '@mui/joy';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: 'background.body',
        color: 'text.primary',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      <Box sx={{ maxWidth: 400, mb: 4 }}>
        <img
          src="/illustrations/not-found.svg"
          alt="404 - Not Found"
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>
      <Typography level="h1" sx={{ fontWeight: 800, fontSize: 36, mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography level="body-lg" sx={{ fontSize: 18, mb: 4 }}>
        Looks like this page doesn't exist. Maybe it was a typo, or the page moved.
      </Typography>
      <Button
        startDecorator={<ArrowLeft />}
        variant="solid"
        color="primary"
        size="lg"
        onClick={() => navigate('/')}
        sx={{ borderRadius: 10, fontWeight: 600 }}
      >
        Go Home
      </Button>
    </Box>
  );
}
