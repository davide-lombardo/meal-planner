import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendEmail } from './email.js';
import dotenv from 'dotenv';
import { readJson, writeJson } from './fileHandler.js';
import { generateMenu, formatMenu, generateHtmlEmail } from './utils/menuGenerator.js';
import logger from './logger.js';
import { z } from 'zod';

// Zod schemas
export const SeasonSchema = z.enum(['spring', 'summer', 'autumn', 'winter']);

export const CategorySchema = z.enum(['pesce', 'carne', 'formaggio', 'uova']);
export const RecipeTypeSchema = z.enum(['pranzo', 'cena']);

export const RecipeSchema = z.object({
  id: z.string().min(1, "Recipe ID is required"),
  nome: z.string().min(1, "Recipe name is required"),
  tipo: RecipeTypeSchema.optional(),
  categoria: CategorySchema.optional(),
  ingredienti: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient is required"),
  link: z.string().url("Invalid URL format").optional().or(z.literal('')),
  stagioni: z.array(SeasonSchema).optional(),
});

export const HistoryEntrySchema = z.record(z.string(), z.any());

export const MenuOptionsSchema = z.object({
  maxRepetitionWeeks: z.number().int().min(0).optional(),
  mealTypeQuotas: z.record(z.string(), z.number().int().min(0)).optional(),
  useQuotas: z.boolean().optional(),
  useWeightedSelection: z.boolean().optional(),
  enableIngredientPlanning: z.boolean().optional(),
  lockedMeals: z.record(z.string(), z.string()).optional(),
  availableIngredients: z.array(z.string()).optional(),
  preferredRecipes: z.array(z.string()).optional(),
  avoidedRecipes: z.array(z.string()).optional(),
  enableSeasonalFiltering: z.boolean().optional(),
  currentSeason: SeasonSchema.optional(),
});

// Main config schema
export const ConfigSchema = z.object({
  useHistory: z.boolean().optional(),
  menuOptions: MenuOptionsSchema,
});

export type Season = z.infer<typeof SeasonSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type RecipeType = z.infer<typeof RecipeTypeSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;
export type MenuOptions = z.infer<typeof MenuOptionsSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export const validateRecipe = (data: unknown): Recipe => {
  return RecipeSchema.parse(data);
};

export const validateConfig = (data: unknown): Config => {
  return ConfigSchema.parse(data);
};

export const validateMenuOptions = (data: unknown): MenuOptions => {
  return MenuOptionsSchema.parse(data);
};

export const PartialRecipeSchema = RecipeSchema.partial().extend({
  id: z.string().optional(),
});

export const PartialConfigSchema = ConfigSchema.partial();

export type PartialRecipe = z.infer<typeof PartialRecipeSchema>;
export type PartialConfig = z.infer<typeof PartialConfigSchema>;

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Recipes CRUD
app.get('/api/recipes', async (req, res) => {
  logger.info('GET /api/recipes');
  try {
    const recipes = await readJson('recipes.json');
    logger.info('Loaded recipes: %d', recipes.length);
    res.json(recipes);
  } catch (err) {
    logger.error('Failed to load recipes: %o', err);
    res.status(500).json({ error: 'Failed to load recipes' });
  }
});

app.post('/api/recipes', async (req, res) => {
  logger.info('POST /api/recipes', { body: req.body });
  try {
    const parseResult = RecipeSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid recipe input: %o', parseResult.error);
      return res.status(400).json({ error: 'Invalid recipe input', details: parseResult.error.errors });
    }
    const recipes = await readJson('recipes.json');
    const newRecipe = parseResult.data;
    recipes.push(newRecipe);
    await writeJson('recipes.json', recipes);
    logger.info('Added recipe: %o', newRecipe);
    res.status(201).json(newRecipe);
  } catch (err) {
    logger.error('Failed to add recipe: %o', err);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  logger.info('PUT /api/recipes/%s', req.params.id, { body: req.body });
  try {
    const parseResult = RecipeSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid recipe input: %o', parseResult.error);
      return res.status(400).json({ error: 'Invalid recipe input', details: parseResult.error.errors });
    }
    const recipes: Array<z.infer<typeof RecipeSchema>> = await readJson('recipes.json');
    const idx = recipes.findIndex((r: any) => r.id === req.params.id);
    if (idx === -1) {
      logger.warn('Recipe not found: %s', req.params.id);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    recipes[idx] = parseResult.data;
    await writeJson('recipes.json', recipes);
    logger.info('Updated recipe: %o', req.body);
    res.json(recipes[idx]);
  } catch (err) {
    logger.error('Failed to update recipe: %o', err);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  logger.info('DELETE /api/recipes/%s', req.params.id);
  try {
    let recipes: Array<{ id: string }> = await readJson('recipes.json');
    recipes = recipes.filter((r) => r.id !== req.params.id);
    await writeJson('recipes.json', recipes);
    logger.info('Deleted recipe: %s', req.params.id);
    res.status(204).end();
  } catch (err) {
    logger.error('Failed to delete recipe: %o', err);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Send meal plan as HTML email (auto-generates menu and groceries)
app.post('/api/send-meal-plan-html', async (req, res) => {
  logger.info('POST /api/send-meal-plan-html');
  try {
    const recipes = await readJson('recipes.json');
    const history = await readJson('history.json');
    const config = await readJson('config.json');
    const menu = generateMenu(recipes, history, config);
    const html = generateHtmlEmail(menu, recipes);
    const subject = 'Il tuo Menu Settimanale';
    const text = 'In allegato trovi il menu settimanale e la lista della spesa.';
    await sendEmail(subject, text, html);
    logger.info('Meal plan email sent');
    res.status(200).json({ message: 'Meal plan email sent successfully' });
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : String(error);
    logger.error('Failed to send meal plan email: %s', errMsg);
    res.status(500).json({ message: 'Failed to send meal plan email', error: errMsg });
  }
});

// Get meal planner config
app.get('/api/config', async (req, res) => {
  logger.info('GET /api/config');
  try {
    const config = await readJson('config.json');
    res.json(config);
  } catch (err) {
    logger.error('Failed to load config: %o', err);
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// Update meal planner config
app.put('/api/config', async (req, res) => {
  logger.info('PUT /api/config', { body: req.body });
  try {
    const parseResult = ConfigSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid config input: %o', parseResult.error);
      return res.status(400).json({ error: 'Invalid config input', details: parseResult.error.errors });
    }
    await writeJson('config.json', parseResult.data);
    res.status(200).json({ message: 'Config updated' });
  } catch (err) {
    logger.error('Failed to update config: %o', err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
