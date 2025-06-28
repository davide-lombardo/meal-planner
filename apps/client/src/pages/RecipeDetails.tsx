import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, IconButton, Sheet, Divider, Snackbar, Alert } from '@mui/joy';
import { ArrowLeft, Pencil, Trash2, Soup } from 'lucide-react';

interface Recipe {
  id: string;
  nome: string;
  categoria?: string;
  tipo?: string;
  ingredienti: string[];
  link?: string;
}

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState('');
  const [showError, setShowError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/api/recipes`)
      .then(res => res.json())
      .then((data: Recipe[]) => {
        const found = data.find((r) => r.id === id);
        setRecipe(found || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load recipe.');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/recipes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setShowSuccess('Recipe deleted');
      setTimeout(() => navigate('/'), 1200);
    } catch {
      setShowError('Failed to delete recipe');
    }
  };

  const handleEdit = () => {
    navigate('/', { state: { editRecipe: recipe } });
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;
  if (error || !recipe) return <Box sx={{ p: 4, color: 'danger.solidBg' }}>{error || 'Recipe not found.'}</Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', pb: 6 }}>
      {/* Back Button */}
      <Button startDecorator={<ArrowLeft />} variant="soft" color="primary" onClick={() => navigate(-1)} sx={{ mt: 3, ml: { xs: 1, md: 4 }, mb: 2, position: 'relative', zIndex: 10, fontWeight: 700, borderRadius: 8, boxShadow: 'sm' }}>
        Back
      </Button>
      {/* Hero Section */}
      <Sheet
        sx={{
          width: '100%',
          minHeight: 180,
          bgcolor: 'primary.solidBg',
          color: '#fff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: { xs: 2, md: 8 },
          py: { xs: 4, md: 6 },
          borderRadius: 0,
          boxShadow: 'md',
          mb: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Soup size={48} style={{ marginRight: 24, opacity: 0.9 }} />
        <Box>
          <Typography level="h1" sx={{ fontWeight: 900, fontSize: { xs: 28, md: 40 }, mb: 1, color: '#fff', letterSpacing: 1 }}>
            {recipe.nome}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
            {recipe.categoria && (
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'secondary.solidBg', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'inline-block', letterSpacing: 0.5 }}>
                {recipe.categoria}
              </Box>
            )}
            {recipe.tipo && (
              <Box sx={{ px: 1.2, py: 0.5, bgcolor: 'warning.solidBg', color: recipe.tipo.toLowerCase() === 'pranzo' || recipe.tipo.toLowerCase() === 'cena' ? '#b88600' : '#7a5c00', borderRadius: 12, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, ml: 0 }}>
                {recipe.tipo}
              </Box>
            )}
          </Box>
        </Box>
      </Sheet>
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: -6, position: 'relative', zIndex: 2 }}>
        <Card sx={{ p: { xs: 2, md: 4 }, borderRadius: 12, boxShadow: 'lg', bgcolor: 'neutral.solidBg', mt: 0 }}>
          <CardContent>
            <Typography level="h3" sx={{ fontWeight: 800, mb: 2, color: 'text.primary', letterSpacing: 0.5 }}>
              Ingredienti
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ul style={{ margin: 0, paddingLeft: 18, color: 'inherit', fontSize: 16, lineHeight: 1.8 }}>
              {recipe.ingredienti.map((ing: string, idx: number) => (
                <li key={idx} style={{ color: 'inherit', marginBottom: 2 }}>{ing}</li>
              ))}
            </ul>
          </CardContent>
          {recipe.link && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography level="body-md" sx={{ fontWeight: 600, mb: 0.5 }}>Link alla ricetta:</Typography>
              <a href={recipe.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', wordBreak: 'break-all', textDecoration: 'underline' }}>
                {recipe.link}
              </a>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1.5, pt: 2, justifyContent: 'flex-end' }}>
            <IconButton variant="soft" color="primary" aria-label="Edit recipe" onClick={handleEdit}>
              <Pencil size={20} />
            </IconButton>
            <IconButton variant="soft" color="primary" aria-label="Delete recipe" onClick={handleDelete}>
              <Trash2 size={20} />
            </IconButton>
          </Box>
        </Card>
        <Snackbar open={!!showSuccess} autoHideDuration={2000} onClose={() => setShowSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert color="success" variant="solid">{showSuccess}</Alert>
        </Snackbar>
        <Snackbar open={!!showError} autoHideDuration={2000} onClose={() => setShowError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert color="danger" variant="solid">{showError}</Alert>
        </Snackbar>
        <Button startDecorator={<ArrowLeft />} variant="plain" color="neutral" onClick={() => navigate(-1)} sx={{ mt: 4, mb: 2, display: { xs: 'flex', md: 'none' } }}>
          Back
        </Button>
      </Box>
    </Box>
  );
}
