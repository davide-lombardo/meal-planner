import * as React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Input,
  Button,
  Snackbar,
  Alert,
  Switch,
  Chip,
  List,
  ListItem,
  ListItemDecorator,
  IconButton,
  Stack,
  Grid,
  Select,
  Option,
} from '@mui/joy';
import { Plus, Trash2, Save, Snowflake, Sun, Leaf, CloudRain } from 'lucide-react';
import { ConfigSchema } from '../utils/schemas';
import { EditableArray } from '../components/common/EditableArray';
import { FormField } from '../components/common/FormField';
import { CONFIG } from '../utils/constants';
import Layout from '../components/common/Layout';

interface MenuOptions {
  maxRepetitionWeeks?: number;
  useWeightedSelection?: boolean;
  enableIngredientPlanning?: boolean;
  availableIngredients?: string[];
  useQuotas?: boolean;
  mealTypeQuotas?: Record<string, number>;
  preferredRecipes?: string[];
  avoidedRecipes?: string[];
  enableSeasonalFiltering?: boolean;
  currentSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
}

interface Config {
  menuOptions: MenuOptions;
  [key: string]: any;
}

// Helper function to get current season based on date
const getCurrentSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

const seasonIcons = {
  spring: <Leaf size={16} />,
  summer: <Sun size={16} />,
  autumn: <CloudRain size={16} />,
  winter: <Snowflake size={16} />,
};

const seasonLabels = {
  spring: 'Primavera',
  summer: 'Estate',
  autumn: 'Autunno',
  winter: 'Inverno',
};

export default function ConfigPage() {
  const [config, setConfig] = React.useState<Config | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  React.useEffect(() => {
    fetch(`${CONFIG.API_BASE_URL}/config`)
      .then((res) => res.json())
      .then((data: Config) => {
        try {
          // Ensure menuOptions exists
          if (!data.menuOptions) {
            data.menuOptions = {};
          }
          
          // Set current season if not already set
          if (!data.menuOptions.currentSeason) {
            data.menuOptions.currentSeason = getCurrentSeason();
          }
          
          // Validate the complete config
          ConfigSchema.parse(data);
          setConfig(data);
        } catch (e) {
          console.error('Config validation error:', e);
          setError(
            'Config validation failed: ' + (e instanceof Error ? e.message : 'Unknown error'),
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load config:', err);
        setError('Failed to load configuration');
        setLoading(false);
      });
  }, []);

  const setMenuOption = React.useCallback((key: keyof MenuOptions, value: unknown) => {
    setConfig((prev: Config | null) => {
      if (!prev) return prev;
      
      const updatedConfig = {
        ...prev,
        menuOptions: {
          ...prev.menuOptions,
          [key]: value
        }
      };
      
      // Validate the change immediately
      try {
        ConfigSchema.parse(updatedConfig);
        setHasUnsavedChanges(true);
        setError(''); // Clear any validation errors
        return updatedConfig;
      } catch (e) {
        console.warn('Invalid config change:', e);
        setError('Invalid configuration: ' + (e instanceof Error ? e.message : 'Unknown error'));
        return prev; // Don't apply invalid changes
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!config) throw new Error('No configuration data available');

      // Final validation before save
      ConfigSchema.parse(config);

      const response = await fetch(`${CONFIG.API_BASE_URL}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Save failed: ${errorData}`);
      }

      setSuccess('Configuration saved successfully!');
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error('Save error:', e);
      setError(e instanceof Error ? e.message : 'Save operation failed');
    } finally {
      setSaving(false);
    }
  };

  // Handle season change specifically to ensure it's properly tracked
  const handleSeasonChange = React.useCallback((newSeason: 'spring' | 'summer' | 'autumn' | 'winter') => {
    setMenuOption('currentSeason', newSeason);
  }, [setMenuOption]);

  const handleSeasonalFilteringToggle = React.useCallback((enabled: boolean) => {
    setMenuOption('enableSeasonalFiltering', enabled);
  }, [setMenuOption]);

  if (loading) {
    return (
      <Layout title="Loading..." subtitle="Please wait while we load your configuration">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}
        >
          <Typography level="h4" sx={{ color: 'text.secondary' }}>
            Loading configuration...
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (!config) {
    return (
      <Layout title="Configuration Error" showBackButton={false}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}
        >
          <Card variant="soft" color="danger">
            <CardContent>
              <Typography level="h4">Configuration Error</Typography>
              <Typography>Unable to load configuration data.</Typography>
            </CardContent>
          </Card>
        </Box>
      </Layout>
    );
  }

  const mo = config.menuOptions || {};

  return (
    <Layout title="Planner Settings" subtitle="Customize how your weekly menus are generated">
      {/* Save Button Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        {hasUnsavedChanges && (
          <Chip variant="soft" color="warning" size="sm">
            Unsaved changes
          </Chip>
        )}
        <Button
          variant="solid"
          color="primary"
          startDecorator={<Save size={18} />}
          onClick={handleSave}
          loading={saving}
          disabled={!hasUnsavedChanges}
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            px: 4,
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* General Settings */}
        <Grid xs={12} lg={6}>
          <Card
            variant="outlined"
            sx={{
              height: 'fit-content',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                General Settings
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 3 }}>
                Basic configuration for menu generation
              </Typography>

              <Stack spacing={3}>
                <FormField
                  label="Maximum repetition weeks"
                  tooltip="Avoid repeating recipes for this many weeks"
                >
                  <Input
                    type="number"
                    value={mo.maxRepetitionWeeks ?? ''}
                    onChange={(e) => setMenuOption('maxRepetitionWeeks', Number(e.target.value))}
                    placeholder="e.g. 4"
                    sx={{ maxWidth: 140 }}
                  />
                </FormField>

                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.level1',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Weighted Selection
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        Prioritize less-used recipes
                      </Typography>
                    </Box>
                    <Switch
                      checked={!!mo.useWeightedSelection}
                      onChange={(e) => setMenuOption('useWeightedSelection', e.target.checked)}
                      color={mo.useWeightedSelection ? 'success' : 'primary'}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Seasonal Settings */}
        <Grid xs={12} lg={6}>
          <Card
            variant="outlined"
            sx={{
              height: 'fit-content',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {seasonIcons[mo.currentSeason || 'spring']}
                Seasonal Settings
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 3 }}>
                Filter recipes based on the current season
              </Typography>

              <Stack spacing={3}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.level1',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Enable seasonal filtering
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                      Only show recipes for the current season
                    </Typography>
                  </Box>
                  <Switch
                    checked={!!mo.enableSeasonalFiltering}
                    onChange={(e) => handleSeasonalFilteringToggle(e.target.checked)}
                    color={mo.enableSeasonalFiltering ? 'success' : 'primary'}
                  />
                </Box>

                <FormField
                  label="Current season"
                  tooltip="Select the current season for recipe filtering"
                >
                  <Select
                    value={mo.currentSeason || getCurrentSeason()}
                    onChange={(_, value) => {
                      if (value) {
                        handleSeasonChange(value as 'spring' | 'summer' | 'autumn' | 'winter');
                      }
                    }}
                    sx={{ maxWidth: 180 }}
                  >
                    {Object.entries(seasonLabels).map(([key, label]) => (
                      <Option key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {seasonIcons[key as keyof typeof seasonIcons]}
                          {label}
                        </Box>
                      </Option>
                    ))}
                  </Select>
                </FormField>

                {mo.enableSeasonalFiltering && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.level2',
                      border: '1px solid',
                      borderColor: 'primary.200',
                    }}
                  >
                    <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                      Currently filtering for:{' '}
                      <strong>{seasonLabels[mo.currentSeason || 'spring']}</strong>
                      <br />
                      Only recipes marked for this season will be included in menu generation.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Ingredient Planning */}
        <Grid xs={12} lg={6}>
          <Card
            variant="outlined"
            sx={{
              height: 'fit-content',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Ingredient Planning
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 3 }}>
                Optimize menus based on available ingredients
              </Typography>

              <Stack spacing={3}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.level1',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Enable ingredient planning
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                      Prefer recipes using your ingredients
                    </Typography>
                  </Box>
                  <Switch
                    checked={!!mo.enableIngredientPlanning}
                    onChange={(e) => setMenuOption('enableIngredientPlanning', e.target.checked)}
                    color={mo.enableIngredientPlanning ? 'success' : 'primary'}
                  />
                </Box>

                <Box sx={{ opacity: mo.enableIngredientPlanning ? 1 : 0.5 }}>
                  <EditableArray
                    label="Available ingredients"
                    value={mo.availableIngredients || []}
                    onChange={(arr) => setMenuOption('availableIngredients', arr)}
                    placeholder="Add ingredient"
                    tooltip="Ingredients you have at home"
                    disabled={!mo.enableIngredientPlanning}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quotas & Preferences */}
        <Grid xs={12}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Quotas & Preferences
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 4 }}>
                Control meal frequency and set recipe preferences
              </Typography>

              <Grid container spacing={4}>
                {/* Quotas Section */}
                <Grid xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.level1',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Use meal type quotas
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                          Limit meal types per week
                        </Typography>
                      </Box>
                      <Switch
                        checked={!!mo.useQuotas}
                        onChange={(e) => setMenuOption('useQuotas', e.target.checked)}
                        color={mo.useQuotas ? 'success' : 'primary'}
                      />
                    </Box>

                    {mo.useQuotas && (
                      <Box>
                        <Typography level="body-sm" sx={{ fontWeight: 600, mb: 2 }}>
                          Weekly quotas by meal type
                        </Typography>
                        <Card variant="soft" sx={{ p: 2 }}>
                          <List sx={{ '--List-gap': '8px' }}>
                            {Object.entries(mo.mealTypeQuotas || {}).map(
                              ([category, quota]: [string, number]) => (
                                <ListItem
                                  key={category}
                                  sx={{
                                    bgcolor: 'background.body',
                                    borderRadius: 1,
                                    px: 2,
                                    py: 1,
                                  }}
                                >
                                  <ListItemDecorator sx={{ minWidth: 100 }}>
                                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                                      {category}
                                    </Typography>
                                  </ListItemDecorator>
                                  <Input
                                    type="number"
                                    value={quota}
                                    onChange={(e) =>
                                      setMenuOption('mealTypeQuotas', {
                                        ...mo.mealTypeQuotas,
                                        [category]: Number(e.target.value),
                                      })
                                    }
                                    sx={{ maxWidth: 80, ml: 'auto', mr: 1 }}
                                    size="sm"
                                  />
                                  <IconButton
                                    size="sm"
                                    color="danger"
                                    variant="soft"
                                    onClick={() => {
                                      const updated = { ...mo.mealTypeQuotas };
                                      delete updated[category];
                                      setMenuOption('mealTypeQuotas', updated);
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </IconButton>
                                </ListItem>
                              ),
                            )}

                            <ListItem
                              sx={{ bgcolor: 'background.level1', borderRadius: 1, px: 2, py: 1 }}
                            >
                              <Input
                                size="sm"
                                placeholder="Category name"
                                sx={{ flex: 1, mr: 1 }}
                                id="new-category"
                              />
                              <Input
                                size="sm"
                                type="number"
                                placeholder="Max per week"
                                sx={{ maxWidth: 120, mr: 1 }}
                                id="new-quota"
                              />
                              <IconButton
                                size="sm"
                                color="primary"
                                onClick={() => {
                                  const categoryInput = document.getElementById(
                                    'new-category',
                                  ) as HTMLInputElement;
                                  const quotaInput = document.getElementById(
                                    'new-quota',
                                  ) as HTMLInputElement;

                                  const category = categoryInput?.value.trim();
                                  const quota = Number(quotaInput?.value);

                                  if (category && quota > 0) {
                                    setMenuOption('mealTypeQuotas', {
                                      ...mo.mealTypeQuotas,
                                      [category]: quota,
                                    });
                                    categoryInput.value = '';
                                    quotaInput.value = '';
                                  }
                                }}
                              >
                                <Plus size={14} />
                              </IconButton>
                            </ListItem>
                          </List>
                        </Card>
                      </Box>
                    )}
                  </Stack>
                </Grid>

                {/* Preferences section */}
                <Grid xs={12} md={6}>
                  <Stack spacing={3}>
                    <EditableArray
                      label="Preferred recipes"
                      value={mo.preferredRecipes || []}
                      onChange={(arr) => setMenuOption('preferredRecipes', arr)}
                      placeholder="Recipe ID"
                      tooltip="Recipe IDs to prioritize"
                    />

                    <EditableArray
                      label="Avoided recipes"
                      value={mo.avoidedRecipes || []}
                      onChange={(arr) => setMenuOption('avoidedRecipes', arr)}
                      placeholder="Recipe ID"
                      tooltip="Recipe IDs to avoid"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert variant="solid" color="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert variant="solid" color="danger">
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  );
}