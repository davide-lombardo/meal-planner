import * as React from 'react';
import { Box, Button, Input, Typography, Stack, Card, Textarea } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../components/common/FormField';

export default function AddRecipe() {
  const [name, setName] = React.useState('');
  const [ingredients, setIngredients] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ingredients.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    // Split ingredients by line, trim, and filter out empty lines
    const ingredienti = ingredients.split('\n').map(i => i.trim()).filter(Boolean);
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const newRecipe = { name, ingredienti };
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
              <FormField label="Recipe Name" htmlFor="recipe-name" required>
                <Input id="recipe-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Spaghetti Carbonara" />
              </FormField>
              <FormField label="Ingredients (one per line)" htmlFor="ingredients" required>
                <Textarea id="ingredients" minRows={4} value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder={"e.g.\n200g spaghetti\n2 eggs\n100g pancetta"} />
              </FormField>
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
