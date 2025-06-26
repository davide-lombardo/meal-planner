import { Card, CardContent, Typography, Box, IconButton } from '@mui/joy';
import { Pencil, Trash2 } from 'lucide-react';

export type Recipe = {
  id: string;
  nome: string;
  categoria?: string;
  tipo?: string;
  ingredienti: string[];
};

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  return (
    <Card variant="soft" sx={{
      bgcolor: 'neutral.solidBg',
      color: 'text.primary',
      minWidth: 280,
      maxWidth: 340,
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
      '&:hover': {
        transform: 'translateY(-4px) scale(1.025)',
        boxShadow: 'lg',
      },
    }}>
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
          <Typography level="body-xs" sx={{ color: 'warning.solidBg', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
            {recipe.tipo}
          </Typography>
        )}
        <Typography level="body-md" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}>Ingredienti</Typography>
        <ul style={{ margin: 0, paddingLeft: 18, color: 'inherit', fontSize: 15, lineHeight: 1.7 }}>
          {recipe.ingredienti.map((ing, idx) => (
            <li key={idx} style={{ color: 'inherit', marginBottom: 2 }}>{ing}</li>
          ))}
        </ul>
      </CardContent>
      <Box sx={{ display: 'flex', gap: 1.5, px: 3, pb: 2.5, pt: 1.5, justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', background: 'rgba(0,0,0,0.01)' }}>
        <IconButton data-testid={`edit-btn-${recipe.id}`} variant="soft" color="primary" onClick={() => onEdit(recipe)} aria-label="Edit recipe" sx={{ borderRadius: 8 }}>
          <Pencil size={18} />
        </IconButton>
        <IconButton data-testid={`delete-btn-${recipe.id}`} variant="soft" color="danger" onClick={() => onDelete(recipe)} aria-label="Delete recipe" sx={{ borderRadius: 8 }}>
          <Trash2 size={18} />
        </IconButton>
      </Box>
    </Card>
  );
}
