import * as React from 'react';
import { Box, Typography, Card, CardContent, Divider, Button } from '@mui/joy';
import { ChefHat, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', py: 6, px: 2 }}>
      <Button startDecorator={<ArrowLeft />} variant="soft" color="primary" onClick={() => navigate(-1)} sx={{ mb: 4, ml: { xs: 0, md: 2 }, fontWeight: 700, borderRadius: 8, boxShadow: 'sm' }}>
        Back
      </Button>
      <Card sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 12, boxShadow: 'lg', bgcolor: 'neutral.solidBg' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ChefHat size={36} style={{ marginRight: 16, color: '#ff8500' }} />
            <Typography level="h1" sx={{ fontWeight: 900, fontSize: { xs: 28, md: 36 }, letterSpacing: 1 }}>
              How Meal Plan Generation Works
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography level="body-lg" sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}>
            The app uses your saved recipes, recent meal history, and preferences to generate a balanced, varied weekly menu. Here’s how it works:
          </Typography>
          <ol style={{ color: 'inherit', fontSize: 17, lineHeight: 1.8, marginLeft: 18, marginBottom: 24 }}>
            <li><b>Recipe Pool:</b> All recipes you add are considered for the menu.</li>
            <li><b>History Avoidance:</b> The app checks your recent meal history to avoid repeating the same recipes too often.</li>
            <li><b>Category & Type:</b> It balances categories (e.g., meat, vegetarian) and types (e.g., lunch, dinner) according to your config.</li>
            <li><b>Advanced Logic:</b> You can enable advanced features in the config:
              <ul style={{ marginTop: 8 }}>
                <li><b>Weighted selection:</b> Prefer recipes less used in recent weeks.</li>
                <li><b>Ingredient-based planning:</b> Prioritize recipes using ingredients you have at home.</li>
                <li><b>Locked meals:</b> Fix a specific recipe for any meal slot.</li>
                <li><b>User preferences:</b> Prioritize or avoid specific recipes.</li>
                <li><b>Caching:</b> Fast repeated menu generation for the same constraints.</li>
                <li><b>Analytics:</b> See stats on recipe and category usage over time.</li>
              </ul>
            </li>
            <li><b>Shopping List:</b> The app automatically generates a grocery list based on the selected recipes’ ingredients.</li>
          </ol>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            This approach ensures your weekly menu is healthy, diverse, and tailored to your tastes—while saving you time and effort!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
