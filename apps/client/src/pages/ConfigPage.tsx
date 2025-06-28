import * as React from 'react';
import {
  Box, Typography, Card, CardContent, Divider, Input, Button, Snackbar, Alert, Switch, Chip, List, ListItem, ListItemDecorator, IconButton, Tooltip
} from '@mui/joy';
import { Plus, Trash2, Info as InfoIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfigSchema } from '../utils/schemas';
import { Section } from '../components/common/Section';
import { EditableArray } from '../components/common/EditableArray';
import { FormField } from '../components/common/FormField';

interface MenuOptions {
  maxRepetitionWeeks?: number;
  useWeightedSelection?: boolean;
  enableIngredientPlanning?: boolean;
  availableIngredients?: string[];
  useQuotas?: boolean;
  mealTypeQuotas?: Record<string, number>;
  preferredRecipes?: string[];
  avoidedRecipes?: string[];
}
interface Config {
  menuOptions: MenuOptions;
  [key: string]: any;
}

export default function ConfigPage() {
  const [config, setConfig] = React.useState<Config | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch('http://localhost:4000/api/config')
      .then(res => res.json())
      .then((data: Config) => {
        try {
          ConfigSchema.parse(data);
          setConfig(data);
        } catch (e) {
          setError('Loaded config is invalid: ' + (e instanceof Error ? e.message : 'Unknown error'));
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load config'); setLoading(false); });
  }, []);

  const setMenuOption = (key: keyof MenuOptions, value: unknown) => {
    setConfig((prev: Config | null) => prev ? { ...prev, menuOptions: { ...prev.menuOptions, [key]: value } } : prev);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!config) throw new Error('No config to save');
      ConfigSchema.parse(config); // Validate before saving
      const res = await fetch('http://localhost:4000/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save config');
      setSuccess('Configuration saved!');
    } catch (e) {
      setError('Failed to save configuration: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;
  if (!config) return <Box sx={{ p: 4, color: 'danger.solidBg' }}>Failed to load configuration.</Box>;

  const mo = config.menuOptions || {};

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', py: 6, px: 2 }}>
      <Button startDecorator={<ArrowLeft />} variant="soft" color="primary" onClick={() => navigate('/')} sx={{ mb: 4, ml: { xs: 0, md: 2 }, fontWeight: 700, borderRadius: 8, boxShadow: 'sm' }}>
        Back to Home
      </Button>
      <Card sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 12, boxShadow: 'lg', bgcolor: 'background.level1', border: '1.5px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography level="h1" sx={{ fontWeight: 900, fontSize: { xs: 26, md: 34 }, letterSpacing: 1, mb: 2, color: 'primary.solidBg', textAlign: 'center' }}>
            Meal Planner Configuration
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Section title="General" description="Basic settings for how your weekly menu is generated.">
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
              <FormField label="Max repetition weeks" tooltip="How many previous weeks to avoid repeating the same recipe.">
                <Input type="number" value={mo.maxRepetitionWeeks ?? ''} onChange={e => setMenuOption('maxRepetitionWeeks', Number(e.target.value))} sx={{ maxWidth: 120, bgcolor: 'background.level2', color: 'text.primary' }} />
              </FormField>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: 2, bgcolor: 'background.level2', minWidth: 220 }}>
                <Typography level="body-sm" sx={{ fontWeight: 600, flex: 1, color: 'text.primary' }}>Use weighted selection</Typography>
                <Tooltip title="Prioritize recipes that have been used less often recently." arrow variant="soft" color="primary">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="body-xs" sx={{ color: mo.useWeightedSelection ? 'primary.solidBg' : 'neutral.plainColor', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
                      {mo.useWeightedSelection ? 'ON' : 'OFF'}
                    </Typography>
                    <Switch
                      checked={!!mo.useWeightedSelection}
                      onChange={e => setMenuOption('useWeightedSelection', e.target.checked)}
                      color={mo.useWeightedSelection ? 'primary' : 'neutral'}
                      sx={{
                        '--Switch-trackBackground': mo.useWeightedSelection ? '#1976d2' : '#bdbdbd',
                        '--Switch-thumbBackground': mo.useWeightedSelection ? '#fff' : '#eee',
                        mr: 0.5
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Section>

          <Section title="Ingredient-based Planning" description="Optimize menu based on ingredients you already have at home.">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'background.level2', maxWidth: 400 }}>
              <Switch
                checked={!!mo.enableIngredientPlanning}
                onChange={e => setMenuOption('enableIngredientPlanning', e.target.checked)}
                color={mo.enableIngredientPlanning ? 'primary' : 'neutral'}
                sx={{
                  '--Switch-trackBackground': mo.enableIngredientPlanning ? '#1976d2' : '#bdbdbd',
                  '--Switch-thumbBackground': mo.enableIngredientPlanning ? '#fff' : '#eee',
                  mr: 1
                }}
              />
              <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
                Enable ingredient-based planning
              </Typography>
              <Tooltip title="If enabled, the planner will prefer recipes using your available ingredients." arrow variant="soft" color="primary">
                <Typography level="body-xs" sx={{ color: mo.enableIngredientPlanning ? 'primary.solidBg' : 'neutral.plainColor', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
                  {mo.enableIngredientPlanning ? 'ON' : 'OFF'}
                </Typography>
              </Tooltip>
            </Box>
            <EditableArray
              label="Available ingredients at home"
              value={mo.availableIngredients || []}
              onChange={arr => setMenuOption('availableIngredients', arr)}
              placeholder="Add ingredient"
              tooltip="List ingredients you want to prioritize in menu planning."
              disabled={!mo.enableIngredientPlanning}
            />
          </Section>

          <Section title="Quotas & Preferences" description="Control how often meal types appear and set your recipe preferences.">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'background.level2', maxWidth: 400 }}>
              <Switch
                checked={!!mo.useQuotas}
                onChange={e => setMenuOption('useQuotas', e.target.checked)}
                color={mo.useQuotas ? 'primary' : 'neutral'}
                sx={{
                  '--Switch-trackBackground': mo.useQuotas ? '#1976d2' : '#bdbdbd',
                  '--Switch-thumbBackground': mo.useQuotas ? '#fff' : '#eee',
                  mr: 1
                }}
              />
              <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
                Use quotas for meal types
              </Typography>
              <Tooltip title="Limit how many times each meal type (e.g. meat, fish) can appear per week." arrow variant="soft" color="primary">
                <Typography level="body-xs" sx={{ color: mo.useQuotas ? 'primary.solidBg' : 'neutral.plainColor', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
                  {mo.useQuotas ? 'ON' : 'OFF'}
                </Typography>
              </Tooltip>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>Meal type quotas (per week)</Typography>
              <Tooltip title="Set the maximum number of times each meal type can appear in a week." arrow variant="soft" color="primary">
                <List sx={{ maxWidth: 400, bgcolor: 'background.level2', borderRadius: 2, p: 1 }}>
                  {Object.entries(mo.mealTypeQuotas || {}).map(([cat, val]: [string, number]) => (
                    <ListItem key={cat} sx={{ gap: 1 }}>
                      <ListItemDecorator>{cat}</ListItemDecorator>
                      <Input type="number" value={val} onChange={e => setMenuOption('mealTypeQuotas', { ...mo.mealTypeQuotas, [cat]: Number(e.target.value) })} sx={{ maxWidth: 80, bgcolor: 'background.body', color: 'text.primary' }} />
                      <IconButton size="sm" color="danger" onClick={() => {
                        const copy = { ...mo.mealTypeQuotas };
                        delete copy[cat];
                        setMenuOption('mealTypeQuotas', copy);
                      }}><Trash2 size={16} /></IconButton>
                    </ListItem>
                  ))}
                  <ListItem sx={{ gap: 1 }}>
                    <Input size="sm" placeholder="Category" sx={{ maxWidth: 100, bgcolor: 'background.body', color: 'text.primary' }} id="new-cat" />
                    <Input size="sm" placeholder="Quota" type="number" sx={{ maxWidth: 80, bgcolor: 'background.body', color: 'text.primary' }} id="new-quota" />
                    <IconButton size="sm" color="primary" onClick={() => {
                      const cat = (document.getElementById('new-cat') as HTMLInputElement)?.value.trim();
                      const quota = Number((document.getElementById('new-quota') as HTMLInputElement)?.value);
                      if (cat && quota > 0) {
                        setMenuOption('mealTypeQuotas', { ...mo.mealTypeQuotas, [cat]: quota });
                        (document.getElementById('new-cat') as HTMLInputElement).value = '';
                        (document.getElementById('new-quota') as HTMLInputElement).value = '';
                      }
                    }}><Plus size={16} /></IconButton>
                  </ListItem>
                </List>
              </Tooltip>
            </Box>
            <EditableArray
              label="Preferred recipes (IDs)"
              value={mo.preferredRecipes || []}
              onChange={arr => setMenuOption('preferredRecipes', arr)}
              placeholder="Add recipe ID"
              tooltip="Recipe IDs you want to prioritize in your menu."
            />
            <EditableArray
              label="Avoided recipes (IDs)"
              value={mo.avoidedRecipes || []}
              onChange={arr => setMenuOption('avoidedRecipes', arr)}
              placeholder="Add recipe ID"
              tooltip="Recipe IDs you want to avoid in your menu."
            />
          </Section>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button onClick={handleSave} sx={{ fontWeight: 700, fontSize: 18, letterSpacing: 1, minWidth: 120, borderRadius: 8 }} color="primary" variant="solid" disabled={loading}>Save</Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert color="success" variant="solid">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={2500} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert color="danger" variant="solid">{error}</Alert>
      </Snackbar>
    </Box>
  );
}
