
import { Router } from 'express';
import { RecipeSchema, type Recipe } from 'shared/schemas';
import fs from 'fs';
import { getDb, parseRecipes } from '../services/dbHelpers';
import logger from '../utils/logger';

const router = Router();

// POST /api/recipes/by-ingredients
router.post('/by-ingredients', async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required.' });
    }
    const { db } = await getDb();
    const result = db.exec('SELECT * FROM recipes');
    const recipes = parseRecipes(result);
    // Filter recipes that include ALL the provided ingredients
    const matchingRecipes = recipes.filter((recipe: Recipe) =>
      Array.isArray(recipe.ingredienti) &&
      ingredients.every((ing: string) =>
        recipe.ingredienti.some((rIng: string) => rIng.trim().toLowerCase() === ing.trim().toLowerCase())
      )
    );
    res.json(matchingRecipes);
  } catch (err) {
    logger.error('Failed to find recipes by ingredients:', err);
    res.status(500).json({ error: 'Failed to find recipes by ingredients' });
  }
});

  // GET /api/recipes/:id
  router.get('/:id', async (req, res) => {
    try {
      const { db } = await getDb();
      const result = db.exec('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
      if (!result.length || !result[0].values.length) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      const recipes = parseRecipes(result);
      res.json(recipes[0]);
    } catch (err) {
      logger.error('Failed to load recipe:', err);
      res.status(500).json({ error: 'Failed to load recipe' });
    }
  });
router.get('/', async (req, res) => {
  try {
    const { db } = await getDb();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;
    // Get total count
    const countResult = db.exec('SELECT COUNT(*) as count FROM recipes');
    const total = countResult[0]?.values[0]?.[0] || 0;
    // Get paginated recipes
    const result = db.exec(`SELECT * FROM recipes ORDER BY timestamp DESC LIMIT ${pageSize} OFFSET ${offset}`);
    const recipes = parseRecipes(result);
    res.json({ recipes, total });
  } catch (err) {
    logger.error('Failed to load recipes:', err);
    res.status(500).json({ error: 'Failed to load recipes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const parseResult = RecipeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid recipe input', details: parseResult.error.errors });
    }
    const { db, dbPath } = await getDb();
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
    res.status(201).json(r);
  } catch (err) {
    logger.error('Failed to add recipe:', err);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const parseResult = RecipeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid recipe input', details: parseResult.error.errors });
    }
    const { db, dbPath } = await getDb();
    const result = db.exec('SELECT id FROM recipes WHERE id = ?', [req.params.id]);
    if (!result.length || !result[0].values.length) {
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
    res.json(r);
  } catch (err) {
    logger.error('Failed to update recipe:', err);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { db, dbPath } = await getDb();
    db.run('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
