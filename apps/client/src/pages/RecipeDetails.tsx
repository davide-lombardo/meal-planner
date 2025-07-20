import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Sheet,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/joy';
import { ArrowLeft, Pencil, Trash2, Soup, ExternalLink, Drumstick, Milk, Egg, Fish, Leaf, Sun, Cloud, Snowflake, CloudRain } from 'lucide-react';
import ConfirmDialog from '../components/dialog/ConfirmDialog';
import { CONFIG } from '../utils/constants';
import { Recipe } from 'shared';

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState('');
  const [showError, setShowError] = React.useState('');
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch(`${CONFIG.API_BASE_URL}/recipes`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data: Recipe[]) => {
        const found = data.find((r) => r.id === id);
        setRecipe(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch recipe:', err);
        setError('Failed to load recipe. Please try again.');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/recipes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete');
      }
      setShowSuccess('Recipe deleted successfully!');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      setShowError('Failed to delete recipe. Please try again.');
    }
  };

  const handleEdit = () => {
    navigate('/', { state: { editRecipe: recipe } });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.body',
        }}
      >
        <CircularProgress size="lg" variant="soft" />
        <Typography level="body-lg" sx={{ ml: 2, color: 'text.secondary' }}>
          Loading recipe...
        </Typography>
      </Box>
    );
  }

  if (error || !recipe) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 4,
          bgcolor: 'background.body',
        }}
      >
        <Typography level="h3" color="danger" sx={{ mb: 2 }}>
          {error || 'Recipe not found.'}
        </Typography>
        <Button
          startDecorator={<ArrowLeft />}
          onClick={() => navigate('/')}
          variant="soft"
          color="neutral"
        >
          Back to Recipes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', pb: 6 }}>
      {/* Hero Section */}
      <Sheet
        sx={{
          width: '100%',
          minHeight: 200,
          bgcolor: 'primary.solidBg',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 8 },
          py: { xs: 4, md: 6 },
          borderRadius: 0,
          boxShadow: 'md',
          mb: 0,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(45deg, var(--joy-palette-primary-solidBg) 30%, var(--joy-palette-primary-softActiveBg) 90%)',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <IconButton
            onClick={() => navigate('/')}
            variant="soft"
            color="primary"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
              color: '#fff',
            }}
            aria-label="Back to recipes"
          >
            <ArrowLeft />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 2, md: 4 },
            textAlign: { xs: 'center', md: 'left' },
            mb: 2,
          }}
        >
          <Soup size={56} style={{ opacity: 0.9, flexShrink: 0 }} />
          <Box>
            <Typography
              level="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: 32, md: 48 },
                mb: 1,
                color: '#fff',
                letterSpacing: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {recipe.nome}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
                mt: 1,
              }}
            >
              {/* Category Chip */}
              {recipe.categoria && (
                <Chip
                  startDecorator={
                    recipe.categoria === 'pesce' ? <Fish size={16} /> :
                    recipe.categoria === 'carne' ? <Drumstick size={16} /> :
                    recipe.categoria === 'formaggio' ? <Milk size={16} /> :
                    recipe.categoria === 'uova' ? <Egg size={16} /> :
                    recipe.categoria === 'legumi' ? <Leaf size={16} /> : null
                  }
                  sx={{
                    bgcolor: theme => recipe.categoria ? theme.palette.category[recipe.categoria] : 'background.level2',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 8,
                    letterSpacing: 0.5,
                    boxShadow: 'sm',
                    textTransform: 'capitalize',
                  }}
                  size="md"
                >
                  {recipe.categoria}
                </Chip>
              )}
              {/* Type Chip */}
              {recipe.tipo && (
                <Chip
                  variant="soft"
                  sx={{
                    bgcolor: 'background.level2',
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: 13,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                  size="md"
                >
                  {recipe.tipo}
                </Chip>
              )}
              {/* Seasons Chips */}
              {recipe.stagioni && recipe.stagioni.length > 0 && recipe.stagioni.map((season, idx) => (
                <Chip
                  key={season + idx}
                  startDecorator={
                    season === 'spring' ? <CloudRain size={15} /> :
                    season === 'summer' ? <Sun size={15} /> :
                    season === 'autumn' ? <Cloud size={15} /> :
                    season === 'winter' ? <Snowflake size={15} /> : null
                  }
                  sx={{
                    bgcolor: 'background.level2',
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: 13,
                    px: 1.1,
                    py: 0.3,
                    borderRadius: 8,
                    textTransform: 'capitalize',
                  }}
                  size="md"
                >
                  {season}
                </Chip>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Action Buttons in Hero Section */}
        <Box sx={{ display: 'flex', gap: 2, mt: { xs: 3, md: 4 } }}>
          <Button
            startDecorator={<Pencil />}
            variant="plain"
            color="neutral"
            onClick={handleEdit}
            sx={{ fontWeight: 700, borderRadius: 8, px: 3, py: 1.2 }}
            aria-label="Edit Recipe"
          >
            Edit
          </Button>
          <Button
            startDecorator={<Trash2 />}
            variant="plain"
            color="neutral"
            onClick={handleDelete}
            sx={{ fontWeight: 700, borderRadius: 8, px: 3, py: 1.2 }}
            aria-label="Delete Recipe"
          >
            Delete
          </Button>
        </Box>
      </Sheet>

      <Box sx={{ maxWidth: 700, mx: 'auto', mt: -6, position: 'relative', zIndex: 2 }}>
        <Card
          sx={{
            maxWidth: 700,
            mx: 'auto',
            p: { xs: 2, md: 4 },
            borderRadius: 16,
            boxShadow: 'xl',
            bgcolor: 'background.level1',
            border: '1px solid',
            borderColor: 'divider',
            mt: 4,
          }}
        >
          <CardContent>
            <Typography
              level="h3"
              sx={{ fontWeight: 800, mb: 2, color: 'text.primary', letterSpacing: 0.5 }}
            >
              Ingredients
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ul
              style={{
                margin: 0,
                paddingLeft: 24,
                color: 'inherit',
                fontSize: 17,
                lineHeight: 2,
              }}
            >
              {recipe.ingredienti.map((ing: string, idx: number) => (
                <li key={idx} style={{ color: 'inherit', marginBottom: 4 }}>
                  {ing}
                </li>
              ))}
            </ul>
          </CardContent>
          {recipe.link && (
            <Box sx={{ mt: 3, mb: 1, px: { xs: 2, md: 4 } }}>
              <a
                href={recipe.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'primary.solidBg',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                }}
              >
                View full recipe <ExternalLink size={18} />
              </a>
            </Box>
          )}
        </Card>
        {/* Snackbars for feedback */}
        <Snackbar
          open={!!showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          variant="solid"
          color="success"
        >
          <Alert color="success" variant="solid">
            {showSuccess}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!showError}
          autoHideDuration={3000}
          onClose={() => setShowError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          variant="solid"
          color="danger"
        >
          <Alert color="danger" variant="solid">
            {showError}
          </Alert>
        </Snackbar>
      </Box>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${recipe.nome}"? This action cannot be undone.`}
      />
    </Box>
  );
}
