import { Box, Typography, IconButton, Chip } from '@mui/joy';
import { Edit2, Trash2 } from 'lucide-react';

export interface Recipe {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  ingredienti: string[];
  istruzioni: string;
  note: string;
  timestamp: number;
}

interface RecipeListItemProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export default function RecipeListItem({ recipe, onEdit, onDelete }: RecipeListItemProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
        flexWrap: 'wrap', 
        gap: { xs: 1, sm: 2 }, 
      }}
      data-testid={`recipe-list-item-${recipe.id}`}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography level="title-md" sx={{ mb: 0.5 }}>
          {recipe.nome}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {recipe.tipo && (
            <Chip variant="soft" color="primary" size="sm">
              {recipe.tipo}
            </Chip>
          )}
          {recipe.categoria && (
            <Chip variant="soft" color="neutral" size="sm">
              {recipe.categoria}
            </Chip>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          variant="outlined"
          color="neutral"
          size="sm"
          onClick={() => onEdit(recipe)}
          aria-label={`Edit ${recipe.nome}`}
        >
          <Edit2 size={16} />
        </IconButton>
        <IconButton
          variant="outlined"
          color="danger"
          size="sm"
          onClick={() => onDelete(recipe)}
          aria-label={`Delete ${recipe.nome}`}
        >
          <Trash2 size={16} />
        </IconButton>
      </Box>
    </Box>
  );
}