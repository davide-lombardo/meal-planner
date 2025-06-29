import { Card, CardContent, Typography, Box, IconButton } from '@mui/joy';
import { Drumstick } from 'lucide-react';
import { Milk } from 'lucide-react';
import { Egg } from 'lucide-react';
import { Fish } from 'lucide-react';
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
  link?: string; // Optional website link
};

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

const categoryMap = {
  pesce: {
    bgColor: '#87CEEB', // Sky Blue
    textColor: '#181c1f', // A dark color for light background
    icon: <Fish size={16} />
  },
  carne: {
    bgColor: '#FA8072', // Salmon
    textColor: '#181c1f', // A dark color for light background
    icon: <Drumstick size={16} />
  },
  formaggio: {
    bgColor: '#DAA520', // Goldenrod
    textColor: '#181c1f', // A dark color for light background
    icon: <Milk size={16} />
  },
  uova: {
    bgColor: '#228B22', // Forest Green
    textColor: '#ffffff', // White for dark background
    icon: <Egg size={16} />
  },
};

export default function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const navigate = useNavigate();

  // Get the category details from the map
  const categoryDetails = recipe.categoria ? categoryMap[recipe.categoria] : null;

  return (
    <Card
      variant="soft"
      sx={{
        bgcolor: 'neutral.solidBg',
        color: 'text.primary',
        width: 340,
        height: 220,
        mb: 3,
        borderRadius: 12,
        boxShadow: 'md',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        p: 0,
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.025)',
          boxShadow: 'lg',
        },
        '&:hover .card-actions': {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      {/* Floating actions, visible on hover only */}
      <Box
        className="card-actions"
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          display: 'flex',
          gap: 1,
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          data-testid={`edit-btn-${recipe.id}`}
          variant="soft"
          color="primary"
          onClick={() => onEdit(recipe)}
          aria-label="Edit recipe"
          sx={{
            borderRadius: '50%',
            bgcolor: 'background.body',
            boxShadow: 'sm',
            '&:hover': { bgcolor: 'primary.solidBg', color: '#fff' },
          }}
        >
          <Pencil size={18} />
        </IconButton>
        <IconButton
          data-testid={`delete-btn-${recipe.id}`}
          variant="soft"
          color="danger"
          onClick={() => onDelete(recipe)}
          aria-label="Delete recipe"
          sx={{
            borderRadius: '50%',
            bgcolor: 'background.body',
            boxShadow: 'sm',
            '&:hover': { bgcolor: 'danger.solidBg', color: '#fff' },
          }}
        >
          <Trash2 size={18} />
        </IconButton>
      </Box>
      <CardContent sx={{ p: 3, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
          <Typography
            level="h3"
            sx={{
              fontWeight: 900,
              fontSize: 22,
              lineHeight: 1.2,
              mb: 1,
              pr: 0,
              flex: 1,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'padding-right 0.2s',
            }}
            title={recipe.nome}
          >
            {recipe.nome}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
               {recipe.categoria && categoryDetails && (
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                bgcolor: categoryDetails.bgColor,
                color: categoryDetails.textColor, 
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.5,
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {categoryDetails.icon}
              {recipe.categoria}
            </Box>
          )}
          {recipe.tipo && (
            <Box
              sx={{
                px: 1,
                py: 0.3,
                bgcolor: 'warning.solidBg',
                color: '#b88600',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                ml: 0,
              }}
            >
              {recipe.tipo}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
