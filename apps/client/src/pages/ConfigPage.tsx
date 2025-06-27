import * as React from 'react';
import { Box, Typography, Card, CardContent, Divider, Input, Button, Snackbar, Alert } from '@mui/joy';

export default function ConfigPage() {
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetch('http://localhost:4000/api/config')
      .then(res => res.json())
      .then(data => { setConfig(data); setLoading(false); })
      .catch(() => { setError('Failed to load config'); setLoading(false); });
  }, []);

  const handleChange = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:4000/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save config');
      setSuccess('Configuration saved!');
    } catch {
      setError('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;
  if (!config) return <Box sx={{ p: 4, color: 'danger.solidBg' }}>Failed to load configuration.</Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', py: 6, px: 2 }}>
      <Card sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 12, boxShadow: 'lg', bgcolor: 'neutral.solidBg' }}>
        <CardContent>
          <Typography level="h1" sx={{ fontWeight: 900, fontSize: { xs: 24, md: 32 }, letterSpacing: 1, mb: 2 }}>
            Meal Planner Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography level="body-md" sx={{ mb: 2, color: 'text.secondary' }}>
            Adjust your meal planner preferences below. Changes will affect how your weekly menu is generated.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography level="body-sm" sx={{ mb: 0.5 }}>Max times a recipe can repeat per week</Typography>
              <Input type="number" value={config.maxRepeats ?? ''} onChange={e => handleChange('maxRepeats', Number(e.target.value))} sx={{ maxWidth: 120 }} />
            </Box>
            <Box>
              <Typography level="body-sm" sx={{ mb: 0.5 }}>Days to avoid repeating the same recipe</Typography>
              <Input type="number" value={config.avoidDays ?? ''} onChange={e => handleChange('avoidDays', Number(e.target.value))} sx={{ maxWidth: 120 }} />
            </Box>
            {/* Add more config fields as needed */}
          </Box>
          <Button onClick={handleSave} sx={{ mt: 3 }} color="primary" variant="solid" disabled={loading}>Save</Button>
        </CardContent>
      </Card>
      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert color="success" variant="solid">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={2500} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert color="danger" variant="solid">{error}</Alert>
      </Snackbar>
    </Box>
  );
}
