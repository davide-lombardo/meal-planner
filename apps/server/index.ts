import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendEmail } from './email.js';
import dotenv from 'dotenv';
import { readJson, writeJson } from './fileHandler.js';
import { generateMenu, formatMenu, generateHtmlEmail } from './utils/menuGenerator.js'; // Updated import path
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Recipes CRUD
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await readJson('recipes.json');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load recipes' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const recipes = await readJson('recipes.json');
    const newRecipe = req.body;
    recipes.push(newRecipe);
    await writeJson('recipes.json', recipes);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipes = await readJson('recipes.json');
    const idx = recipes.findIndex((r: any) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Recipe not found' });
    recipes[idx] = req.body;
    await writeJson('recipes.json', recipes);
    res.json(recipes[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    let recipes = await readJson('recipes.json');
    recipes = recipes.filter((r: any) => r.id !== req.params.id);
    await writeJson('recipes.json', recipes);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// History CRUD
app.get('/api/history', async (req, res) => {
  try {
    const history = await readJson('history.json');
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const history = await readJson('history.json');
    const newEntry = req.body;
    history.push(newEntry);
    await writeJson('history.json', history);
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add history entry' });
  }
});

// Menu generation
app.post('/api/generate-menu', async (req, res) => {
  try {
    const recipes = await readJson('recipes.json');
    const history = await readJson('history.json');
    const config = await readJson('config.json');
    const menu = generateMenu(recipes, history, config);
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate menu' });
  }
});

// Email endpoint (existing)
app.post('/api/send-meal-plan', async (req, res) => {
  const { subject, text, html } = req.body;
  try {
    await sendEmail(subject, text, html);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// Send meal plan as HTML email (auto-generates menu and groceries)
app.post('/api/send-meal-plan-html', async (req, res) => {
  try {
    const recipes = await readJson('recipes.json');
    const history = await readJson('history.json');
    const config = await readJson('config.json');
    const menu = generateMenu(recipes, history, config);
    const html = generateHtmlEmail(menu, recipes);
    const subject = 'Il tuo Menu Settimanale';
    const text = 'In allegato trovi il menu settimanale e la lista della spesa.';
    await sendEmail(subject, text, html);
    res.status(200).json({ message: 'Meal plan email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send meal plan email', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
