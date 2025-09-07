import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/joy';
import { useNavigate } from 'react-router-dom';

interface DiscoveryRecipeCardProps {
  title: string;
  image: string;
  category: string;
  area: string;
  id: string;
}

const DiscoveryRecipeCard: React.FC<DiscoveryRecipeCardProps> = ({ title, image, category, area, id }) => {
  const navigate = useNavigate();
  const displayCategory = category && category.trim() ? category : 'Unknown';
  const displayArea = area && area.trim() ? area : 'Unknown';
  return (
    <Card
      variant="soft"
      sx={{
        bgcolor: 'background.level1',
        color: 'text.primary',
        width: 340,
        height: 320,
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
      onClick={() => navigate(`/meal/${id}`)}
    >
      <Box sx={{ width: '100%', height: 180, overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
      <CardContent sx={{ p: 3, pt: 2.5, pb: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography level="h3" sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1.2, mb: 1, pr: 0, minWidth: 0, whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', transition: 'padding-right 0.2s' }} title={title}>
          {title}
        </Typography>
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ px: 1.2, py: 0.3, border: '1.5px solid #ccc', color: 'text.secondary', bgcolor: 'transparent', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {displayCategory}
          </Box>
          <Box sx={{ px: 0.6, py: 0.2, color: 'text.secondary', borderRadius: 2, fontSize: 10, fontWeight: 500, letterSpacing: 0.8, userSelect: 'none', alignSelf: 'center', minWidth: 40, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {displayArea}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DiscoveryRecipeCard;
