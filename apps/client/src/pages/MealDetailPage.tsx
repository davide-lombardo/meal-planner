import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button, Chip, Sheet, Divider, IconButton } from '@mui/joy';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import RecipeDialog from '../components/dialog/RecipeDialog';
import { useTheme } from '@mui/joy/styles';

interface MealDetail {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube?: string;
  [key: string]: any;
}

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      .then(res => res.json())
      .then(data => {
        setMeal(data.meals ? data.meals[0] : null);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch recipe details');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="danger">{error}</Typography>;
  if (!meal) return <Typography>No recipe found.</Typography>;

  // Collect ingredients and measures
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${ingredient}${measure ? ` - ${measure}` : ''}`);
    }
  }

  // Only prepopulate name, ingredients, and link, but set valid defaults for categoria and tipo
  const initialRecipe = meal ? {
    id: meal.idMeal,
    nome: meal.strMeal,
    categoria: 'pesce', // default valid category
    tipo: 'pranzo',     // default valid type
    ingredienti: ingredients,
    link: meal.strYoutube || '',
    stagioni: [],
    timestamp: null,
    user_id: '',
  } : undefined;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', pb: 6 }}>
      {/* Hero Section */}
      <Sheet
        sx={{
          width: '100%',
          minHeight: 200,
          bgcolor: 'primary.200',
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
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <IconButton
            onClick={() => navigate(-1)}
            variant="soft"
            color="primary"
            sx={{ bgcolor: 'background.level1', '&:hover': { bgcolor: 'background.level2' }, color: 'text.primary' }}
            aria-label="Back"
          >
            <ArrowLeft />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 2, md: 4 }, textAlign: { xs: 'center', md: 'left' }, mb: 2 }}>
          <Box sx={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', boxShadow: 'md', bgcolor: 'background.level1', mr: { md: 4 } }}>
            <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Box>
            <Typography level="h1" sx={{ fontWeight: 900, fontSize: { xs: 32, md: 48 }, mb: 1, color: 'text.primary', letterSpacing: 1 }}>{meal.strMeal}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' }, mt: 1 }}>
              <Chip sx={{ bgcolor: 'background.level2', color: 'text.primary', fontSize: 14, px: 1.5, py: 0.5, borderRadius: 8 }} size="md">{meal.strCategory}</Chip>
              <Chip sx={{ bgcolor: 'background.level2', color: 'text.primary', fontSize: 14, px: 1.5, py: 0.5, borderRadius: 8 }} size="md">{meal.strArea}</Chip>
            </Box>
          </Box>
        </Box>
      </Sheet>
      <Box sx={{ maxWidth: 700, mx: 'auto', mt: -6, position: 'relative', zIndex: 2 }}>
        <Card sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 16, boxShadow: 'xl', bgcolor: 'background.level1', border: '1px solid', borderColor: 'divider', mt: 4 }}>
          <CardContent>
            <Typography level="h3" sx={{ fontWeight: 900, mb: 2, color: 'primary.plainColor', letterSpacing: 1, fontSize: { xs: 24, md: 32 } }}>Ingredients</Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, px: 1, py: 1, bgcolor: 'background.level2', borderRadius: 8, boxShadow: 'sm', minHeight: 56 }}>
              {ingredients.map((ing, idx) => (
                <Chip key={idx} sx={{ fontSize: 16, fontWeight: 500, px: 2, py: 1, bgcolor: 'background.body', color: 'text.primary', borderRadius: 6, boxShadow: 'xs' }} variant="soft" size="lg">{ing}</Chip>
              ))}
            </Box>
            <Typography level="h3" sx={{ fontWeight: 900, mt: 4, mb: 2, color: 'primary.plainColor', letterSpacing: 1, fontSize: { xs: 24, md: 32 } }}>Instructions</Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography level="body-md" mb={2} sx={{ whiteSpace: 'pre-line' }}>{meal.strInstructions}</Typography>
            <Box sx={{ mt: 3, mb: 1, display: 'flex', gap: 2 }}>
              <Button
                component="a"
                href={meal.strYoutube}
                target="_blank"
                rel="noopener noreferrer"
                color="success"
                variant="soft"
                startDecorator={<ExternalLink size={18} />}
                sx={{ fontWeight: 700, borderRadius: 8 }}
              >
                Watch on YouTube
              </Button>
              <Button
                color="primary"
                variant="solid"
                sx={{ fontWeight: 700, borderRadius: 8 }}
                onClick={() => setDialogOpen(true)}
              >
                Add to Menu Plan
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      {/* RecipeDialog Modal */}
      <RecipeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={() => setDialogOpen(false)}
        initialRecipe={initialRecipe as any}
      />
    </Box>
  );
}
