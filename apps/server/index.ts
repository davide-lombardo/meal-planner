
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import recipesRouter from './routes/recipes';
import configRouter from './routes/config';
import menuRouter from './routes/menu';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandling';
import { kindeUserSync } from './middleware/kindeUserSync';
import { getDb } from 'services/dbHelpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(bodyParser.json());
app.use(kindeUserSync);

app.use('/api/recipes', recipesRouter);
app.use('/api/config', configRouter);
app.use('/api/menu', menuRouter);

app.get('/api/debug/users', async (req, res) => {
  const { db } = await getDb();
  const result = db.exec('SELECT * FROM users');
  res.json(result[0]?.values || []);
});


app.post('/api/debug/assign-recipes', async (req, res) => {
  const { user_id } = req.body;
  const { db, dbPath } = await getDb();
  db.run('UPDATE recipes SET user_id = ?', [user_id]);
  // Save DB to disk
  const fs = await import('fs');
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  res.json({ success: true });
});


app.get('/api/debug/recipes', async (req, res) => {
  const { db } = await getDb();
  const result = db.exec('SELECT * FROM recipes');
  res.json(result[0]?.values || []);
});

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
