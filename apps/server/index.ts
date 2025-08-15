import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendEmail } from './email';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// ...existing code...
import initSqlJs from 'sql.js';
import fs from 'fs';
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
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    const result = db.exec('SELECT * FROM recipes');
    logger.debug('Raw DB result:', JSON.stringify(result, null, 2));
    let recipes: Recipe[] = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      recipes = result[0].values.map(row => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          if (col === 'ingredienti' || col === 'stagioni') {
            obj[col] = row[idx] ? JSON.parse(row[idx] as string) : [];
          } else if (col === 'link') {
              obj[col] = typeof row[idx] === 'string' ? row[idx] : (row[idx] == null ? '' : String(row[idx]));
          } else {
            obj[col] = row[idx];
          }
        });
        return obj as Recipe;
      });
      logger.debug('Parsed recipes:', JSON.stringify(recipes, null, 2));
    }
    logger.info('Loaded recipes: %d', recipes.length);
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
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    const r = parseResult.data;
    const timestamp = typeof r.timestamp === 'number' && !isNaN(r.timestamp) ? r.timestamp : Date.now();
    db.run(
      'INSERT OR REPLACE INTO recipes (id, nome, tipo, categoria, ingredienti, link, stagioni, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        r.id,
        r.nome,
        r.tipo || null,
        r.categoria || null,
        JSON.stringify(r.ingredienti || []),
        r.link || null,
        JSON.stringify(r.stagioni || []),
        timestamp
      ]
    );
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    logger.info('Added recipe: %o', r);
    res.status(201).json(r);
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
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    // Check if recipe exists
    const result = db.exec('SELECT id FROM recipes WHERE id = ?', [req.params.id]);
    if (!result.length || !result[0].values.length) {
      logger.warn('Recipe not found: %s', req.params.id);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    const r = parseResult.data;
    const timestamp = typeof r.timestamp === 'number' && !isNaN(r.timestamp) ? r.timestamp : Date.now();
    db.run(
      'UPDATE recipes SET nome = ?, tipo = ?, categoria = ?, ingredienti = ?, link = ?, stagioni = ?, timestamp = ? WHERE id = ?',
      [
        r.nome,
        r.tipo || null,
        r.categoria || null,
        JSON.stringify(r.ingredienti || []),
        r.link || null,
        JSON.stringify(r.stagioni || []),
        timestamp,
        req.params.id
      ]
    );
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    logger.info('Updated recipe: %o', req.body);
    res.json(r);
  } catch (err) {
    logger.error('Failed to update recipe: %o', err);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  logger.info('DELETE /api/recipes/%s', req.params.id);
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    db.run('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
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
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    const result = db.exec('SELECT * FROM recipes');
    let recipes: Recipe[] = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      recipes = result[0].values.map(row => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          if (col === 'ingredienti' || col === 'stagioni') {
            obj[col] = row[idx] ? JSON.parse(row[idx] as string) : [];
          } else {
            obj[col] = row[idx];
          }
        });
        return obj as Recipe;
      });
    }
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
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    // Recipes
    let recipes: Recipe[] = [];
    const recipesResult = db.exec('SELECT * FROM recipes');
    if (recipesResult.length > 0) {
      const columns = recipesResult[0].columns;
      recipes = recipesResult[0].values.map(row => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          if (col === 'ingredienti' || col === 'stagioni') {
            obj[col] = row[idx] ? JSON.parse(row[idx] as string) : [];
          } else {
            obj[col] = row[idx];
          }
        });
        return obj as Recipe;
      });
    }
    // History
    let history: Menu[] = [];
    const historyResult = db.exec('SELECT * FROM history');
    if (historyResult.length > 0) {
      const columns = historyResult[0].columns;
      history = historyResult[0].values.map(row => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj as Menu;
      });
    }
    // Config
    let config: Config = { menuOptions: {} };
    const configResult = db.exec('SELECT menuOptions FROM config WHERE id = 1');
      if (configResult.length > 0 && configResult[0].values.length > 0) {
        const menuOptionsValue = configResult[0].values[0][0];
        config.menuOptions = typeof menuOptionsValue === 'string' ? JSON.parse(menuOptionsValue) : {};
      }
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

// Get meal planner config from SQLite
app.get('/api/config', async (req, res) => {
  logger.info('GET /api/config');
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    const result = db.exec('SELECT menuOptions FROM config WHERE id = 1');
    let config: Config = { menuOptions: {} };
    if (result.length > 0 && result[0].values.length > 0) {
      const menuOptionsValue = result[0].values[0][0];
      config.menuOptions = typeof menuOptionsValue === 'string' ? JSON.parse(menuOptionsValue) : {};
    }
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

// Update meal planner config in SQLite
app.put('/api/config', async (req, res) => {
  logger.info('PUT /api/config', { body: req.body });
  try {
    const parseResult = ConfigSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid config input: %o', parseResult.error);
      return res.status(400).json({ error: 'Invalid config input', details: parseResult.error.errors });
    }
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data.db');
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    db.run('DELETE FROM config WHERE id = 1');
    db.run('INSERT INTO config (id, menuOptions) VALUES (?, ?)', [1, JSON.stringify(parseResult.data.menuOptions || {})]);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    res.status(200).json({ message: 'Config updated' });
  } catch (err) {
    logger.error('Failed to update config: %o', err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Send a message to Telegram
app.post('/api/telegram/send-message', async (req, res) => {
  logger.info('POST /api/telegram/send-message', { body: req.body });
  try {
    const { chatId, text } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ error: 'chatId and text are required' });
    }
    // If chatId is not a number, return 400
    if (typeof chatId !== 'number') {
      return res.status(400).json({ error: 'chatId must be a number' });
    }
    // If text is not a string, return 400
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text must be a string' });
    }
    // Send message via Telegram bot
    await sendTelegramMessage(chatId.toString(), text);
    logger.info('Telegram message sent to %d', chatId);
    res.status(200).json({ message: 'Message sent' });
  } catch (err) {
    logger.error('Failed to send Telegram message: %o', err);
    res.status(500).json({ error: 'Failed to send Telegram message' });
  }
});

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
