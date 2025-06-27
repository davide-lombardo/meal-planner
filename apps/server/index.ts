import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendEmail } from './email.js';
import dotenv from 'dotenv';
import { readJson, writeJson } from './fileHandler.js';
import { generateMenu, formatMenu, generateHtmlEmail } from './utils/menuGenerator.js'; // Updated import path
import logger from './logger.js';

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
    const recipes = await readJson('recipes.json');
    const newRecipe = req.body;
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
    const recipes = await readJson('recipes.json');
    const idx = recipes.findIndex((r: any) => r.id === req.params.id);
    if (idx === -1) {
      logger.warn('Recipe not found: %s', req.params.id);
      return res.status(404).json({ error: 'Recipe not found' });
    }
    recipes[idx] = req.body;
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
    let recipes = await readJson('recipes.json');
    recipes = recipes.filter((r: any) => r.id !== req.params.id);
    await writeJson('recipes.json', recipes);
    logger.info('Deleted recipe: %s', req.params.id);
    res.status(204).end();
  } catch (err) {
    logger.error('Failed to delete recipe: %o', err);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// History CRUD
app.get('/api/history', async (req, res) => {
  logger.info('GET /api/history');
  try {
    const history = await readJson('history.json');
    logger.info('Loaded history: %d', history.length);
    res.json(history);
  } catch (err) {
    logger.error('Failed to load history: %o', err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.post('/api/history', async (req, res) => {
  logger.info('POST /api/history', { body: req.body });
  try {
    const history = await readJson('history.json');
    const newEntry = req.body;
    history.push(newEntry);
    await writeJson('history.json', history);
    logger.info('Added history entry: %o', newEntry);
    res.status(201).json(newEntry);
  } catch (err) {
    logger.error('Failed to add history entry: %o', err);
    res.status(500).json({ error: 'Failed to add history entry' });
  }
});

// Menu generation
app.post('/api/generate-menu', async (req, res) => {
  logger.info('POST /api/generate-menu', { body: req.body });
  try {
    const recipes = await readJson('recipes.json');
    const history = await readJson('history.json');
    const config = await readJson('config.json');
    const menu = generateMenu(recipes, history, config);
    logger.info('Generated menu: %o', menu);
    res.json(menu);
  } catch (err) {
    logger.error('Failed to generate menu: %o', err);
    res.status(500).json({ error: 'Failed to generate menu' });
  }
});

// Email endpoint (existing)
app.post('/api/send-email', async (req, res) => {
  const { subject, text, html } = req.body;
  logger.info('POST /api/send-email', { subject });
  try {
    await sendEmail(subject, text, html);
    logger.info('Email sent: %s', subject);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : String(error);
    logger.error('Failed to send email: %s', errMsg);
    res.status(500).json({ message: 'Failed to send email', error: errMsg });
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

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
