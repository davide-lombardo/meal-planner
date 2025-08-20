import { Box, Typography, Card, CardContent, Chip } from '@mui/joy';
import { Database, History, BarChart3, ShoppingCart, Settings, Zap } from 'lucide-react';
import Layout from '../components/common/Layout';
import { useTheme } from '@mui/joy/styles';

const steps = [
  {
    icon: Database,
    title: "Recipe Pool",
    description: "All your saved recipes become ingredients for the perfect menu",
    detail: "Every recipe you add gets thrown into the mix for consideration"
  },
  {
    icon: History,
    title: "History Avoidance",
    description: "Smart tracking prevents menu fatigue",
    detail: "The app remembers what you've eaten recently and avoids repetition"
  },
  {
    icon: BarChart3,
    title: "Category & Type Balance",
    description: "Maintains variety across meal types and categories",
    detail: "Balances meat, vegetarian, lunch, dinner according to your settings"
  },
  {
    icon: Settings,
    title: "Advanced Logic",
    description: "Powerful features for personalized planning",
    detail: "Weighted selection, ingredient-based planning, locked meals, and more"
  },
  {
    icon: ShoppingCart,
    title: "Shopping List",
    description: "Automatic grocery list generation",
    detail: "Instantly creates your shopping list from selected recipes"
  }
];

const advancedFeatures = [
  "Weighted selection - favor less-used recipes",
  "Ingredient-based planning - use what you have",
  "Locked meals - fix specific recipes to slots",
  "User preferences - prioritize or avoid recipes",
  "Caching - lightning-fast repeated generations",
  "Analytics - track usage patterns over time"
];

export default function HowItWorks() {
  const theme = useTheme();
  return (
    <Layout 
      title="How It Works"
      subtitle="Your personal meal planning assistant that learns your preferences and creates balanced, varied menus"
    >
      {/* Steps */}
      <Box sx={{ mb: 6 }}>
        {steps.map((step, index) => (
          <Card 
            key={index}
            variant="outlined"
            sx={{ 
              mb: 3, 
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
          >
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Zap size={28} style={{ color: theme.palette.primary.solidBg }} />
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'primary.100',
                  color: 'primary.solidBg',
                  flexShrink: 0
                }}>
                  <step.icon size={24} style={{ color: theme.palette.primary.solidBg }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip 
                      size="sm" 
                      variant="soft" 
                      color="primary"
                      sx={{ fontSize: 12, fontWeight: 600 }}
                    >
                      Step {index + 1}
                    </Chip>
                    <Typography level="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {step.title}
                    </Typography>
                  </Box>
                  <Typography level="body-md" sx={{ color: 'text.secondary', mb: 1 }}>
                    {step.description}
                  </Typography>
                  <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                    {step.detail}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Advanced Features Callout */}
      <Card 
        variant="outlined"
        sx={{ 
          p: 4, 
          borderRadius: 3,
          bgcolor: 'warning.50',
          border: '2px solid',
          borderColor: 'warning.200',
          mb: 4
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Zap size={28} style={{ color: theme.palette.primary.solidBg }} />
            <Typography level="h3" sx={{ fontWeight: 700, color: 'warning.800' }}>
              Advanced Features
            </Typography>
          </Box>
          <Typography level="body-md" sx={{ color: 'warning.700', mb: 3 }}>
            Unlock these powerful features in your configuration settings:
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2 
          }}>
            {advancedFeatures.map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  bgcolor: 'warning.500',
                  flexShrink: 0
                }} />
                <Typography level="body-sm" sx={{ color: 'warning.800', fontWeight: 500 }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Bottom Summary */}
      <Card 
        variant="outlined"
        sx={{ 
          p: 4, 
          borderRadius: 3,
          bgcolor: 'success.50',
          border: '1px solid',
          borderColor: 'success.200',
          textAlign: 'center'
        }}
      >
        <CardContent>
          <Typography level="h4" sx={{ fontWeight: 700, color: 'success.800', mb: 2 }}>
            The Result?
          </Typography>
          <Typography level="body-lg" sx={{ color: 'success.700', lineHeight: 1.6 }}>
            Weekly menus that are <strong>healthy</strong>, <strong>diverse</strong>, and <strong>tailored to your tastes</strong> — 
            all while saving you time and mental energy. No more "what's for dinner?" stress!
          </Typography>
        </CardContent>
      </Card>
    </Layout>
  );
}