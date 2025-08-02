import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendEmail } from './email';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJson, writeJson } from './fileHandler';
import { generateMenu, formatMenu, generateHtmlEmail, generateShoppingList } from './utils/menuGenerator';
import logger from './logger.js';
import { sendTelegramMessage } from './telegramBot';
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
    // If telegramChatId is not set in config, use env default
    if (!config.menuOptions) config.menuOptions = {};
    if (!config.menuOptions.telegramChatId && process.env.TELEGRAM_CHAT_ID) {
      config.menuOptions.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    }
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

// Send a message to Telegram
app.post('/api/send-telegram-message', async (req, res) => {
  logger.info('POST /api/send-telegram-message', { body: req.body });
  try {
    // If a custom message is provided, use it. Otherwise, send menu and grocery list.
    const { message, chatId } = req.body;
    let chatIds: string[] = [];
    // Load config for chat IDs
    const config: Config = await readJson('config.json');
    const menuOptions = config.menuOptions || {};
    // Collect all chat IDs: default, additional, and request
    if (chatId) chatIds.push(chatId);
    if (menuOptions.telegramChatId && !chatIds.includes(menuOptions.telegramChatId)) chatIds.push(menuOptions.telegramChatId);
    if (Array.isArray(menuOptions.telegramChatIds)) {
      for (const id of menuOptions.telegramChatIds) {
        if (id && !chatIds.includes(id)) chatIds.push(id);
      }
    }
    // Fallback to env if nothing else
    if (chatIds.length === 0 && process.env.TELEGRAM_CHAT_ID) chatIds.push(process.env.TELEGRAM_CHAT_ID);

    if (message) {
      for (const id of chatIds) {
        await sendTelegramMessage(message, id);
      }
      logger.info('Telegram message sent (custom)');
      return res.status(200).json({ message: 'Telegram message sent successfully' });
    }

    // Otherwise, generate menu and grocery list
    const recipes = await readJson('recipes.json');
    const history = await readJson('history.json');
    const menu = generateMenu(recipes, history, config);
    const menuText = formatMenu(menu);

    // Generate grocery list as plain text
    const categorizedList = generateShoppingList(menu, recipes);
    const categoryOrder = ['Frutta e Verdura', 'Carne e Pesce', 'Latticini', 'Dispensa', 'Altro'];
    let groceryText = 'Lista della spesa:\n';
    for (const category of categoryOrder) {
      if (categorizedList.has(category)) {
        groceryText += `\n${category}:\n`;
        for (const ing of categorizedList.get(category)!) {
          groceryText += `- ${ing.name}`;
          if (ing.quantity) groceryText += ` (${ing.quantity}${ing.unit})`;
          groceryText += '\n';
        }
      }
    }

    const fullMessage = `Ciao! Il tuo menu settimanale è pronto su Meal Planner.\n\n${menuText}\n${groceryText}`;
    for (const id of chatIds) {
      await sendTelegramMessage(fullMessage, id);
    }
    logger.info('Telegram message sent (menu + grocery list)');
    res.status(200).json({ message: 'Telegram message sent successfully' });
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : String(error);
    logger.error('Failed to send Telegram message: %s', errMsg);
    res.status(500).json({ message: 'Failed to send Telegram message', error: errMsg });
  }
});

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
