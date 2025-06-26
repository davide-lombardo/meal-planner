import * as React from 'react';
import { Box, Button, FormControl, FormLabel, Input, Typography, Stack, Card } from '@mui/joy';
import { useNavigate } from 'react-router-dom';

export default function AddRecipe() {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const newRecipe = { name, description };
    localStorage.setItem('recipes', JSON.stringify([...recipes, newRecipe]));
    navigate('/');
  };

  return (
    <Box sx={{ bgcolor: 'background.body', minHeight: '100vh', py: 6 }}>
      <Stack spacing={2} alignItems="center">
        <Card variant="soft" sx={{ bgcolor: 'warning.solidBg', borderRadius: 6, boxShadow: 'sm', minWidth: 350, maxWidth: 400 }}>
          <Box sx={{ p: 4 }}>
            <Typography level="h2" sx={{ color: 'primary.solidBg', fontWeight: 800, mb: 2, textAlign: 'center' }}>
              Add New Recipe
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl required>
                <FormLabel>Recipe Name</FormLabel>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Spaghetti Carbonara" />
              </FormControl>
              <FormControl required>
                <FormLabel>Description</FormLabel>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description or ingredients" />
              </FormControl>
              {error && <Typography color="danger" level="body-sm">{error}</Typography>}
              <Button type="submit" color="primary" variant="solid" size="lg" sx={{ fontWeight: 700, borderRadius: 8, mt: 2 }}>
                Add Recipe
              </Button>
              <Button variant="plain" color="primary" onClick={() => navigate('/')} sx={{ mt: 1 }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}
