import * as React from 'react';
import { Box, Typography, Button, Stack, CircularProgress, Snackbar, Alert } from '@mui/joy';
import { PlusCircle, Mail, Loader2 } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import type { Recipe } from '../components/RecipeCard';
import RecipeDialog from '../components/RecipeDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const API_URL = 'http://localhost:4000/api/recipes';

export default function Home() {
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editRecipe, setEditRecipe] = React.useState<Recipe | null>(null);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState('');
  const [sendSuccess, setSendSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; recipe: Recipe | null }>({ open: false, recipe: null });
  const [error, setError] = React.useState('');

  // Fetch recipes from backend
  React.useEffect(() => {
    setLoading(true);
    setError('');
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch recipes');
        return res.json();
      })
      .then(data => setRecipes(data))
      .catch(() => setError('Failed to load recipes.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSendMealPlan = async () => {
    setSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      const response = await fetch('http://localhost:4000/api/send-meal-plan-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to send meal plan');
      setSendSuccess('Meal plan sent!');
    } catch (e) {
      setSendError('Failed to send meal plan.');
    } finally {
      setSending(false);
    }
  };

  // Save (add or edit) recipe via backend
  const handleSaveRecipe = async (recipe: Recipe) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (recipe.id) {
        response = await fetch(`${API_URL}/${recipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe),
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe),
        });
      }
      if (!response.ok) throw new Error('Failed to save recipe');
      // Refetch recipes
      const recipesRes = await fetch(API_URL);
      setRecipes(await recipesRes.json());
      setDialogOpen(false);
    } catch {
      setError('Failed to save recipe.');
    } finally {
      setLoading(false);
    }
  };

  // Delete recipe via backend
  const confirmDeleteRecipe = async () => {
    if (!deleteDialog.recipe) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/${deleteDialog.recipe.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete recipe');
      // Refetch recipes
      const recipesRes = await fetch(API_URL);
      setRecipes(await recipesRes.json());
      setDeleteDialog({ open: false, recipe: null });
    } catch {
      setError('Failed to delete recipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    setDeleteDialog({ open: true, recipe });
  };

  return (
    <Box sx={{ bgcolor: 'background.body', minHeight: '100vh', py: 0, color: 'text.primary' }}>
      {/* Hero Section */}
      <Box sx={{
        width: '100%',
        minHeight: 260,
        bgcolor: theme => theme.palette.mode === 'dark' ? '#11151a' : 'primary.solidBg',
        color: '#fff',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 8 },
        py: { xs: 4, md: 6 },
        borderRadius: 0,
        boxShadow: 'md',
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ zIndex: 2 }}>
          <Typography level="h1" sx={{ fontWeight: 900, fontSize: { xs: 32, md: 48 }, mb: 2, color: '#fff' }}>
            Plan Your Week, Eat Better
          </Typography>
          <Typography level="body-lg" sx={{ fontSize: { xs: 16, md: 22 }, mb: 3, color: '#fff', maxWidth: 500 }}>
            Discover, organize, and share your favorite recipes. Generate a weekly menu and shopping list in one click!
          </Typography>
          <Button data-testid="add-recipe-btn" startDecorator={<PlusCircle />} size="lg" color="warning" variant="solid" sx={{ fontWeight: 700, borderRadius: 8, mr: 2 }} onClick={() => { setEditRecipe(null); setDialogOpen(true); }}>
            Add Recipe
          </Button>
          <Button data-testid="send-meal-plan-btn" startDecorator={<Mail />} size="lg" color="primary" variant="soft" sx={{ fontWeight: 700, borderRadius: 8 }} onClick={handleSendMealPlan} disabled={sending}>
            {sending ? <Loader2 className="spin" size={18} /> : 'Send Meal Plan'}
          </Button>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' }, zIndex: 1 }}>
          <img src="/illustrations/chef.svg" alt="Chef Illustration" style={{ height: 180 }} />
        </Box>
        <Box sx={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.08, zIndex: 0 }}>
          <img src="/illustrations/chef.svg" alt="Background Chef" style={{ height: 320 }} />
        </Box>
      </Box>

      {/* Recipes Section */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, py: 2 }}>
        <Typography level="h2" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
          Your Recipes
        </Typography>
        {error && (
          <Alert color="danger" variant="solid" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress size="lg" color="primary" />
          </Box>
        ) : recipes.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
            <img src="/illustrations/empty.svg" alt="No Recipes" style={{ height: 120, marginBottom: 16 }} />
            <Typography level="body-lg">No recipes yet. Add your first recipe!</Typography>
          </Box>
        ) : (
          <Stack direction="row" flexWrap="wrap" spacing={3} useFlexGap sx={{ justifyContent: 'flex-start' }}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={r => { setEditRecipe(r); setDialogOpen(true); }}
                onDelete={handleDeleteRecipe}
                data-testid={`recipe-card-${recipe.id}`}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Dialogs */}
      <RecipeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSaveRecipe} initialRecipe={editRecipe} data-testid="recipe-dialog" />
      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, recipe: null })} onConfirm={confirmDeleteRecipe} message="Are you sure you want to delete this recipe? This action cannot be undone." data-testid="confirm-dialog" />
      <Snackbar open={!!sendSuccess} autoHideDuration={3000} onClose={() => setSendSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert color="success" variant="solid">{sendSuccess}</Alert>
      </Snackbar>
      <Snackbar open={!!sendError} autoHideDuration={3000} onClose={() => setSendError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert color="danger" variant="solid">{sendError}</Alert>
      </Snackbar>
      {/* Footer */}
      <Box sx={{ width: '100%', bgcolor: 'background.body', color: 'text.secondary', textAlign: 'center', py: 4, mt: 8, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography level="body-md" sx={{ mb: 1 }}>
          Made with <span style={{ color: '#27ae60', fontWeight: 700 }}>Meal Planner</span> &copy; {new Date().getFullYear()} | Inspired by HelloFresh | <a href="https://undraw.co/" style={{ color: 'inherit', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">Illustrations by unDraw</a>
        </Typography>
      </Box>
    </Box>
  );
}
