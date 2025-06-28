import { Card, CardContent, Typography, Box, IconButton } from '@mui/joy';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type Category = 'pesce' | 'carne' | 'formaggio' | 'uova';
export type RecipeType = 'pranzo' | 'cena';

export type Recipe = {
  id: string;
  nome: string;
  categoria: Category;
  tipo: RecipeType;
  ingredienti: string[];
};

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      variant="soft"
      sx={{
        bgcolor: 'neutral.solidBg',
        color: 'text.primary',
        width: 320,
        height: 220,
        mb: 3,
        borderRadius: 10,
        boxShadow: 'md',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 0,
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.025)',
          boxShadow: 'lg',
        },
      }}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography level="h3" sx={{ fontWeight: 900, fontSize: 22, flex: 1, lineHeight: 1.2, pr: 1 }}>{recipe.nome}</Typography>
          {recipe.categoria && (
            <Box sx={{ ml: 1, px: 1.5, py: 0.5, bgcolor: 'primary.solidBg', color: '#fff', borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, minWidth: 0, whiteSpace: 'nowrap' }}>
              {recipe.categoria}
            </Box>
          )}
        </Box>
        {recipe.tipo && (
          <Typography level="body-xs" sx={{ color: recipe.tipo.toLowerCase() === 'pranzo' || recipe.tipo.toLowerCase() === 'cena' ? '#b88600' : 'warning.solidBg', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
            {recipe.tipo}
          </Typography>
        )}
      </CardContent>
      <Box sx={{ display: 'flex', gap: 1.5, px: 3, pb: 2.5, pt: 1.5, justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', background: 'rgba(0,0,0,0.01)' }} onClick={e => e.stopPropagation()}>
        <IconButton data-testid={`edit-btn-${recipe.id}`} variant="soft" color="primary" onClick={() => onEdit(recipe)} aria-label="Edit recipe" sx={{ borderRadius: 8 }}>
          <Pencil size={18} />
        </IconButton>
        <IconButton data-testid={`delete-btn-${recipe.id}`} variant="soft" color="primary" onClick={() => onDelete(recipe)} aria-label="Delete recipe" sx={{ borderRadius: 8 }}>
          <Trash2 size={18} />
        </IconButton>
      </Box>
    </Card>
  );
}
