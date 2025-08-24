import { Card, CardContent, Typography, Box, IconButton, Menu, MenuItem } from '@mui/joy';
import { Drumstick, Milk, Egg, Fish, Pencil, Trash2, EllipsisVertical, Leaf } from 'lucide-react';
import { Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import { Recipe } from 'shared/schemas';
import { useTheme } from '@mui/joy';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;  
  onDelete?: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  // Map category to theme palette colors
  const categoryMap = {
    pesce: {
      color: theme.palette.category.pesce,
      icon: <Fish size={16} />,
    },
    carne: {
      color: theme.palette.category.carne,
      icon: <Drumstick size={16} />,
    },
    formaggio: {
      color: theme.palette.category.formaggio,
      icon: <Milk size={16} />,
    },
    uova: {
      color: theme.palette.category.uova,
      icon: <Egg size={16} />,
    },
    legumi: {
      color: theme.palette.category.legumi,
      icon: <Leaf size={16} />,
    },
  };

  // Get the category details from the map
  const categoryDetails = recipe.categoria && categoryMap[recipe.categoria] ? categoryMap[recipe.categoria] : null;

  // Menu state and handlers
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (open) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onEdit?.(recipe);
  };

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete?.(recipe);
  };

  return (
    <Card
      variant="soft"
      sx={{
        bgcolor: theme.palette.background.level1,
        color: theme.palette.text.primary,
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
      }}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
        <IconButton
          aria-label="more actions"
          aria-controls={open ? `recipe-menu-${recipe.id}` : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleMenuToggle}
          size="sm"
          variant="plain"
          sx={{
            borderRadius: '50%',
            p: 0.5,
            color: theme.palette.text.primary,
            '&:hover': {
              bgcolor: 'transparent',
              color: theme.palette.text.primary,
              boxShadow: 'none',
            },
            '&:focus-visible': {
              bgcolor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <EllipsisVertical />
        </IconButton>
        <Menu
          id={`recipe-menu-${recipe.id}`}
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          placement="bottom-end"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={onEditClick} sx={{ gap: 1 }}>
            <Pencil size={16} /> Edit
          </MenuItem>
          <MenuItem onClick={onDeleteClick} sx={{ gap: 1, color: 'danger.600' }}>
            <Trash2 size={16} /> Delete
          </MenuItem>
        </Menu>
      </Box>

      <CardContent
        sx={{
          p: 3,
          pt: 2.5,
          pb: 1.5,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Typography
          level="h3"
          sx={{
            fontWeight: 900,
            fontSize: 22,
            lineHeight: 1.2,
            mb: 1,
            pr: 0,
            flex: '0 0 auto',
            minWidth: 0,
            whiteSpace: 'normal',
            overflow: 'visible',
            textOverflow: 'unset',
            transition: 'padding-right 0.2s',
          }}
          title={recipe.nome}
        >
          {recipe.nome}
        </Typography>

        <Box sx={{ mt: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          {recipe.categoria && categoryDetails && (
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                border: '1.5px solid',
                borderColor: categoryDetails?.color,
                color: categoryDetails?.color,
                bgcolor: 'transparent',
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
              {categoryDetails?.icon}
              {recipe.categoria}
            </Box>
          )}
          {recipe.tipo && (
            <Box
              sx={{
                px: 0.6,
                py: 0.2,
                color: theme.palette.text.secondary,
                borderRadius: 2,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: 0.8,
                userSelect: 'none',
                alignSelf: 'center',
                minWidth: 40,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {recipe.tipo === 'pranzo' && <Sun size={14} />}
              {recipe.tipo === 'cena' && <Moon size={14} />}
              {recipe.tipo}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
