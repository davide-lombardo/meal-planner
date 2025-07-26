import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendEmail } from './email';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJson, writeJson } from './fileHandler';
import { generateMenu, formatMenu, generateHtmlEmail } from './utils/menuGenerator';
import logger from './logger.js';
import {
  SeasonSchema,
  CategorySchema,
  RecipeTypeSchema,
  RecipeSchema,
  MenuOptionsSchema,
  ConfigSchema,
  type Season,
  type Category,
  type RecipeType,
  type Recipe,
  type MenuOptions,
  type Config,
  type Menu
} from 'shared/schemas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Recipes CRUD
app.get('/api/recipes', async (req, res) => {
  logger.info('GET /api/recipes');
  try {
    const recipes: Recipe[] = await readJson('recipes.json');
    logger.info('Loaded recipes: %d', recipes.length);
    // Sort by timestamp descending (latest first)
    res.json(recipes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
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
    const recipes: Recipe[] = await readJson('recipes.json');
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
    const recipes: Recipe[] = await readJson('recipes.json');
    const idx = recipes.findIndex((r) => r.id === req.params.id);
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
    let recipes: Recipe[] = await readJson('recipes.json');
    recipes = recipes.filter((r) => r.id !== req.params.id);
    await writeJson('recipes.json', recipes);
    logger.info('Deleted recipe: %s', req.params.id);
    res.status(204).end();
  } catch (err) {
    logger.error('Failed to delete recipe: %o', err);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Find recipes by ingredients
app.post('/api/recipes/by-ingredients', async (req, res) => {
  logger.info('POST /api/recipes/by-ingredients', { body: req.body });
  try {
    const { ingredients } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required.' });
    }
    const recipes: Recipe[] = await readJson('recipes.json');
    // Filter recipes that include ALL the provided ingredients
    const matchingRecipes = recipes.filter((recipe) =>
      Array.isArray(recipe.ingredienti) &&
      ingredients.every((ing: string) =>
        recipe.ingredienti.some((rIng: string) => rIng.trim().toLowerCase() === ing.trim().toLowerCase())
      )
    );
    res.json(matchingRecipes);
  } catch (err) {
    logger.error('Failed to find recipes by ingredients: %o', err);
    res.status(500).json({ error: 'Failed to find recipes by ingredients' });
  }
});

// Send meal plan as HTML email (auto-generates menu and groceries)
app.post('/api/send-meal-plan-html', async (req, res) => {
  logger.info('POST /api/send-meal-plan-html');
  try {
    const recipes: Recipe[] = await readJson('recipes.json');
    const history: Menu[] = await readJson('history.json');
    const config: Config = await readJson('config.json');
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
    const config: Config = await readJson('config.json');
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
