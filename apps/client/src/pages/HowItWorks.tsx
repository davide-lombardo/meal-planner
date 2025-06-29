import * as React from 'react';
import { Box, Typography, Card, CardContent, Divider, Button, Chip } from '@mui/joy';
import { ChefHat, ArrowLeft, Database, History, BarChart3, ShoppingCart, Settings, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.body', 
      py: 4, 
      px: 2,
      background: 'linear-gradient(135deg, var(--joy-palette-background-body) 0%, var(--joy-palette-background-surface) 100%)'
    }}>
      {/* Header */}
      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
        <Button 
          startDecorator={<ArrowLeft size={18} />} 
          variant="soft" 
          color="primary" 
          onClick={() => navigate('/')} 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            borderRadius: 12,
            px: 3,
            py: 1.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 'md'
            }
          }}
        >
          Back to Home
        </Button>
        
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            p: 2,
            borderRadius: 16,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <ChefHat size={40} style={{ color: '#ff8500' }} />
            <Typography 
              level="h1" 
              sx={{ 
                fontWeight: 800, 
                fontSize: { xs: 28, md: 36 }, 
                color: 'primary.solidBg',
                mb: 0
              }}
            >
              How It Works
            </Typography>
          </Box>
          <Typography 
            level="body-lg" 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: 18
            }}
          >
            Your personal meal planning assistant that learns your preferences and creates balanced, varied menus
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Steps */}
        <Box sx={{ mb: 6 }}>
          {steps.map((step, index) => (
            <Card 
              key={index}
              sx={{ 
                mb: 3, 
                p: 3,
                borderRadius: 16,
                boxShadow: 'sm',
                border: '1px solid',
                borderColor: 'neutral.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 'md',
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.300'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    bgcolor: 'primary.100',
                    color: 'primary.600',
                    flexShrink: 0
                  }}>
                    <step.icon size={24} />
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
        <Card sx={{ 
          p: 4, 
          borderRadius: 20,
          bgcolor: 'warning.50',
          border: '2px solid',
          borderColor: 'warning.200',
          mb: 4
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Zap size={28} style={{ color: '#ff8500' }} />
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
        <Card sx={{ 
          p: 4, 
          borderRadius: 20,
          bgcolor: 'success.50',
          border: '1px solid',
          borderColor: 'success.200',
          textAlign: 'center'
        }}>
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
      </Box>
    </Box>
  );
}