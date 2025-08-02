import * as React from 'react';
import { Box, Typography, Button, Stack, Snackbar, Alert, Card, CardContent } from '@mui/joy';
import { PlusCircle, Mail, Loader2, Send } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import RecipeDialog from '../components/dialog/RecipeDialog';
import ConfirmDialog from '../components/dialog/ConfirmDialog';
import { useLocation } from 'react-router-dom';
import Skeleton from '@mui/joy/Skeleton';
import { RecipeSchema } from 'shared';
import FilterSection from '../components/FiltersSection';
import { CONFIG } from '../utils/constants';
import { Recipe, Category, RecipeType } from 'shared';
import ErrorAlert from '../components/ErrorAlert';

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const API_URL = `${CONFIG.API_BASE_URL}/recipes`;

export default function Home() {
  const location = useLocation();
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editRecipe, setEditRecipe] = React.useState<Recipe | null>(null);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState('');
  const [sendSuccess, setSendSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; recipe: Recipe | null }>({
    open: false,
    recipe: null,
  });
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [actionSuccess, setActionSuccess] = React.useState('');
  const [actionError, setActionError] = React.useState('');
  const [filterType, setFilterType] = React.useState<RecipeType | ''>('');
  const [filterCategory, setFilterCategory] = React.useState<Category | ''>('');
  const debouncedSearch = useDebouncedValue(search, 250);

  React.useEffect(() => {
    setLoading(true);
    setError('');
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch recipes');
        return res.json();
      })
      .then((data) => {
        // Validate and sort recipes by timestamp descending
        const validRecipes = data.filter((recipe: any) => {
          const result = RecipeSchema.safeParse(recipe);
          if (!result.success) {
            setError('Some recipes are invalid and were skipped.');
            console.error('Invalid recipe data:', recipe, result.error.format());
            return false;
          }
          return true;
        });
        setRecipes(validRecipes.sort((a: Recipe, b: Recipe) => (b.timestamp || 0) - (a.timestamp || 0)));
        setLoading(false);
      })
      .catch(() => setError('Failed to load recipes.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (location.state && location.state.editRecipe) {
      setEditRecipe(location.state.editRecipe);
      setDialogOpen(true);
      // Clean up state so dialog doesn't reopen on next visit
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSendMealPlan = async () => {
    setSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/send-meal-plan-html`, {
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

  const [telegramSending, setTelegramSending] = React.useState(false);
  const [telegramSuccess, setTelegramSuccess] = React.useState('');
  const [telegramError, setTelegramError] = React.useState('');
  const [config, setConfig] = React.useState<any>(null);

  React.useEffect(() => {
    fetch(`${CONFIG.API_BASE_URL}/config`)
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  const handleSendTelegram = async () => {
    setTelegramSending(true);
    setTelegramError('');
    setTelegramSuccess('');
    try {
      let chatId = undefined;
      if (config && config.menuOptions && config.menuOptions.telegramChatId) {
        chatId = config.menuOptions.telegramChatId;
      }
      const body = chatId ? { chatId } : {};
      const response = await fetch(`${CONFIG.API_BASE_URL}/send-telegram-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to send Telegram message');
      setTelegramSuccess('Messaggio Telegram inviato!');
    } catch (e) {
      setTelegramError('Errore invio messaggio Telegram.');
    } finally {
      setTelegramSending(false);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    setLoading(true);
    setError('');
    try {
      let response;
      // If recipe.id is empty or undefined, treat as new recipe
      if (!recipe.id) {
        // Generate a unique id and timestamp
        const now = Date.now();
        const newRecipe = { ...recipe, id: `r${now}`, timestamp: now };
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecipe),
        });
      } else {
        response = await fetch(`${API_URL}/${recipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe),
        });
      }
      if (!response.ok) throw new Error('Failed to save recipe');
      // Refetch recipes
      const recipesRes = await fetch(API_URL);
      setRecipes((await recipesRes.json()).sort((a: Recipe, b: Recipe) => (b.timestamp || 0) - (a.timestamp || 0)));
      setDialogOpen(false);
      setActionSuccess(recipe.id ? 'Recipe updated!' : 'Recipe added!');
    } catch {
      setError('Failed to save recipe.');
      setActionError('Failed to save recipe.');
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
      setActionSuccess('Recipe deleted!');
    } catch {
      setError('Failed to delete recipe.');
      setActionError('Failed to delete recipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    setDeleteDialog({ open: true, recipe });
  };

  // Get unique types and categories from recipes
  const types = Array.from(
    new Set(recipes.map((r) => r.tipo).filter((t): t is RecipeType => t !== undefined)),
  );
  const categories = Array.from(
    new Set(recipes.map((r) => r.categoria).filter((c): c is Category => c !== undefined)),
  );

  // Filter recipes by search and dropdowns
  const filteredRecipes = recipes.filter((r) => {
    const q = debouncedSearch.toLowerCase();
    const matchesSearch =
      r.nome.toLowerCase().includes(q) ||
      (r.categoria && r.categoria.toLowerCase().includes(q)) ||
      (r.tipo && r.tipo.toLowerCase().includes(q)) ||
      r.ingredienti.some((i: any) => i.toLowerCase().includes(q));
    const matchesType = !filterType || r.tipo === filterType;
    const matchesCategory = !filterCategory || r.categoria === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <Box sx={{ bgcolor: 'background.body', minHeight: '100vh', py: 0, color: 'text.primary' }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          minHeight: 260,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'background.level2' : 'primary.solidBg',
          color: 'color.white',
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
        }}
      >
        <Box sx={{ zIndex: 2 }}>
          <Typography
            level="h1"
            sx={{ fontWeight: 900, fontSize: { xs: 32, md: 48 }, mb: 2, color: '#fff' }}
          >
            Plan Your Week, Eat Better
          </Typography>
          <Typography
            level="body-lg"
            sx={{ fontSize: { xs: 16, md: 22 }, mb: 3, color: '#fff', maxWidth: 500 }}
          >
            Organize your favorite recipes. Generate a weekly menu and shopping list in one click!
          </Typography>
          <Button
            data-testid="add-recipe-btn"
            startDecorator={<PlusCircle />}
            size="lg"
            color="warning"
            variant="solid"
            sx={{ fontWeight: 700, borderRadius: 8, mr: 2, mb: 2, color: '#181c1f' }}
            onClick={() => {
              setEditRecipe(null);
              setDialogOpen(true);
            }}
          >
            Add Recipe
          </Button>
          <Button
            data-testid="send-meal-plan-btn"
            startDecorator={<Mail />}
            size="lg"
            color="primary"
            variant="soft"
            sx={{ fontWeight: 700, borderRadius: 8, mr: 2 }}
            onClick={handleSendMealPlan}
            disabled={sending}
          >
            {sending ? <Loader2 className="spin" size={18} /> : 'Send plan via Email'}
          </Button>
          <Button
            data-testid="send-telegram-btn"
            startDecorator={<Send />}
            size="lg"
            color="primary"
            variant="soft"
            sx={{ fontWeight: 700, borderRadius: 8 }}
            onClick={handleSendTelegram}
            disabled={telegramSending}
          >
            {telegramSending ? <Loader2 className="spin" size={18} /> : 'Send plan via Telegram'}
          </Button>
      {/* Telegram Snackbar */}
      <Snackbar
        open={!!telegramSuccess}
        autoHideDuration={3000}
        onClose={() => setTelegramSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert color="success" variant="solid">
          {telegramSuccess}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!telegramError}
        autoHideDuration={3000}
        onClose={() => setTelegramError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert color="danger" variant="solid">
          {telegramError}
        </Alert>
      </Snackbar>
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
        <FilterSection
          search={search}
          onSearchChange={setSearch}
          filterType={filterType}
          onTypeChange={setFilterType}
          filterCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          types={types}
          categories={categories}
          filteredCount={filteredRecipes.length}
          totalCount={recipes.length}
        />
        {error && (
          <ErrorAlert message={error} />
        )}
        {loading ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: 200 }}>
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                variant="soft"
                sx={{
                  bgcolor: 'neutral.solidBg',
                  width: 340,
                  height: 220,
                  mb: 3,
                  borderRadius: 12,
                  boxShadow: 'md',
                  p: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}
              >
                <CardContent sx={{ p: 3, pt: 2.5, pb: 1.5 }}>
                  <Skeleton
                    variant="text"
                    width={180}
                    height={32}
                    sx={{ mb: 2, borderRadius: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={20}
                      sx={{ borderRadius: 10 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={40}
                      height={20}
                      sx={{ borderRadius: 10 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : filteredRecipes.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
            <img
              src="/illustrations/empty.svg"
              alt="No Recipes"
              style={{ height: 120, marginBottom: 16 }}
            />
            <Typography level="body-lg">No recipes found.</Typography>
          </Box>
        ) : (
          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={3}
            useFlexGap
            sx={{ justifyContent: 'flex-start' }}
          >
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={(r) => {
                  setEditRecipe(r);
                  setDialogOpen(true);
                }}
                onDelete={handleDeleteRecipe}
                data-testid={`recipe-card-${recipe.id}`}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Dialogs */}
      <RecipeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveRecipe}
        initialRecipe={editRecipe}
        data-testid="recipe-dialog"
      />
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, recipe: null })}
        onConfirm={confirmDeleteRecipe}
        message={
          deleteDialog.recipe
            ? `Are you sure you want to delete the recipe "${deleteDialog.recipe.nome}"? This action cannot be undone.`
            : 'Are you sure you want to delete this recipe? This action cannot be undone.'
        }
        data-testid="confirm-dialog"
      />
      <Snackbar
        open={!!sendSuccess}
        autoHideDuration={3000}
        onClose={() => setSendSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert color="success" variant="solid">
          {sendSuccess}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!sendError}
        autoHideDuration={3000}
        onClose={() => setSendError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert color="danger" variant="solid">
          {sendError}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!actionSuccess}
        autoHideDuration={2500}
        onClose={() => setActionSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert color="success" variant="solid">
          {actionSuccess}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!actionError}
        autoHideDuration={2500}
        onClose={() => setActionError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert color="danger" variant="solid">
          {actionError}
        </Alert>
      </Snackbar>
      {/* Footer */}
      <Box
        sx={{
          width: '100%',
          bgcolor: 'background.body',
          color: 'text.secondary',
          textAlign: 'center',
          py: 4,
          mt: 8,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography level="body-md" sx={{ mb: 1 }}>
          <Typography
            component={'span'}
            sx={{
              display: 'inline',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Meal Planner
          </Typography>
          &copy; {new Date().getFullYear()} |{' '}
          <a
            href="https://undraw.co/"
            style={{ color: 'inherit', textDecoration: 'underline' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Illustrations by unDraw
          </a>
        </Typography>
        <Typography level="body-sm" sx={{ mt: 1 }}>
          <a
            href="/how-it-works"
            style={{
              color: '#ff8500',
              textDecoration: 'underline',
              fontWeight: 600,
              fontSize: 15,
              opacity: 0.9,
            }}
          >
            How it works
          </a>
        </Typography>
      </Box>
    </Box>
  );
}
