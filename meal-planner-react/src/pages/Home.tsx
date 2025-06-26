import * as React from 'react';
import { Box, Typography, Button, Card, CardContent, Stack, Modal, ModalDialog, DialogContent, DialogTitle, DialogActions, FormControl, FormLabel, Input, IconButton } from '@mui/joy';
import { sendMealPlanEmail } from '../utils/sendMealPlanEmail';
import { Pencil, Trash2 } from 'lucide-react';

function RecipeDialog({ open, onClose, onSave, initialRecipe }: {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: any) => void;
  initialRecipe?: any;
}) {
  const [nome, setNome] = React.useState(initialRecipe?.nome || '');
  const [ingredienti, setIngredienti] = React.useState(initialRecipe?.ingredienti?.join(', ') || '');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setNome(initialRecipe?.nome || '');
    setIngredienti(initialRecipe?.ingredienti?.join(', ') || '');
  }, [initialRecipe, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !ingredienti.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    onSave({ ...initialRecipe, nome, ingredienti: ingredienti.split(',').map((i: string) => i.trim()) });
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog aria-labelledby="edit-recipe-title">
        <DialogTitle id="edit-recipe-title">{initialRecipe ? 'Edit Recipe' : 'Add New Recipe'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ minWidth: 350 }}>
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Nome Ricetta</FormLabel>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="e.g. Pasta alla carbonara" />
            </FormControl>
            <FormControl required>
              <FormLabel>Ingredienti (separati da virgola)</FormLabel>
              <Input value={ingredienti} onChange={e => setIngredienti(e.target.value)} placeholder="pasta, uova, guanciale, ..." />
            </FormControl>
            {error && <Typography color="danger" level="body-sm" sx={{ mt: 1 }}>{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={onClose}>Cancel</Button>
            <Button type="submit" color="primary" variant="solid">{initialRecipe ? 'Save' : 'Add Recipe'}</Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
}

export default function Home() {
  const [recipes, setRecipes] = React.useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editRecipe, setEditRecipe] = React.useState<any | null>(null);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState('');
  const [sendSuccess, setSendSuccess] = React.useState('');

  React.useEffect(() => {
    const local = localStorage.getItem('recipes');
    if (local) {
      setRecipes(JSON.parse(local));
    } else {
      import('../data/recipes.json').then((data) => setRecipes(data.default));
    }
  }, []);

  const handleSendMealPlan = async () => {
    setSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      const subject = 'Your Meal Plan';
      const text = recipes.map(r => `${r.nome || r.name}: ${Array.isArray(r.ingredienti) ? r.ingredienti.join(', ') : r.ingredienti || r.description}`).join('\n');
      const html = `<ul>` + recipes.map(r => `<li><b>${r.nome || r.name}</b>: ${Array.isArray(r.ingredienti) ? r.ingredienti.join(', ') : r.ingredienti || r.description}</li>`).join('') + `</ul>`;
      await sendMealPlanEmail(subject, text, html);
      setSendSuccess('Email sent successfully!');
    } catch (err: any) {
      setSendError('Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const handleAddRecipe = (recipe: { nome: string; ingredienti: string[] }) => {
    const updated = [...recipes, recipe];
    setRecipes(updated);
    localStorage.setItem('recipes', JSON.stringify(updated));
  };

  const handleEditRecipe = (updatedRecipe: any) => {
    const updated = recipes.map((r) => (r === editRecipe ? updatedRecipe : r));
    setRecipes(updated);
    localStorage.setItem('recipes', JSON.stringify(updated));
  };

  const handleDeleteRecipe = (recipeToDelete: any) => {
    const updated = recipes.filter((r) => r !== recipeToDelete);
    setRecipes(updated);
    localStorage.setItem('recipes', JSON.stringify(updated));
  };

  return (
    <Box sx={{ bgcolor: 'background.body', minHeight: '100vh', py: 6 }}>
      <Stack spacing={2} alignItems="center">
        <Button color="primary" variant="solid" size="lg" sx={{ px: 6, fontWeight: 700, borderRadius: 8, mb: 2 }} onClick={handleSendMealPlan} disabled={sending}>
          {sending ? 'Sending...' : 'Send Meal Plan to Email'}
        </Button>
        {sendError && <Typography color="danger" level="body-sm">{sendError}</Typography>}
        {sendSuccess && <Typography color="success" level="body-sm">{sendSuccess}</Typography>}
        <Typography level="h1" sx={{ color: 'neutral.900', fontWeight: 800, letterSpacing: 1, mb: 1 }}>
          Meal Planner
        </Typography>
        <Typography level="body-lg" sx={{ color: 'neutral.900', mb: 2, maxWidth: 600, textAlign: 'center' }}>
          Plan your meals, add new recipes, and send your meal plan to your email. Enjoy a beautiful, easy-to-use interface!
        </Typography>
        <Button color="primary" variant="solid" size="lg" sx={{ px: 4, fontWeight: 700, borderRadius: 8 }} onClick={() => { setEditRecipe(null); setDialogOpen(true); }}>
          + Add New Recipe
        </Button>
        <Box sx={{ width: '100%', maxWidth: 700, mt: 4 }}>
          {recipes.length === 0 ? (
            <Typography level="body-lg" sx={{ color: 'neutral.700', textAlign: 'center' }}>No recipes found.</Typography>
          ) : (
            <Stack spacing={2}>
              {recipes.map((recipe, idx) => (
                <Card key={idx} variant="outlined" sx={{ bgcolor: 'background.body', borderRadius: 6, boxShadow: 'sm', borderColor: 'warning.solidBg', position: 'relative' }}>
                  <CardContent>
                    <Typography level="h3" sx={{ color: 'primary.solidBg', fontWeight: 700 }}>{recipe.nome || recipe.name}</Typography>
                    <Typography level="body-md" sx={{ color: 'neutral.900', mt: 1 }}>
                      {Array.isArray(recipe.ingredienti) ? recipe.ingredienti.join(', ') : recipe.ingredienti || recipe.description}
                    </Typography>
                    <IconButton aria-label="Edit" color="primary" sx={{ position: 'absolute', top: 8, right: 40 }} onClick={() => { setEditRecipe(recipe); setDialogOpen(true); }}>
                      <Pencil size={20} />
                    </IconButton>
                    <IconButton aria-label="Delete" color="danger" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => handleDeleteRecipe(recipe)}>
                      <Trash2 size={20} />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
      <RecipeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={editRecipe ? handleEditRecipe : handleAddRecipe} initialRecipe={editRecipe} />
    </Box>
  );
}
