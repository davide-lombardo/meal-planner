import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';
import recipesRouter from './routes/recipes';
import configRouter from './routes/config';
import menuRouter from './routes/menu';
import accountRouter from './routes/account';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandling';
import apiLimiter from './middleware/rateLimit';
import { kindeUserSync } from './middleware/kindeUserSync';
import { getDb } from 'services/dbHelpers';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(kindeUserSync);

app.use('/api/recipes', apiLimiter as any, recipesRouter);
app.use('/api/config', apiLimiter as any, configRouter);
app.use('/api/menu', apiLimiter as any, menuRouter);
app.use('/api/account', accountRouter);

// app.get('/api/debug/history-schema', async (req, res) => {
//   try {
//     const { db } = await getDb();
//     const result = db.exec('PRAGMA table_info(history);');
//     const columns = result[0]?.values?.map(row => ({ name: row[1], type: row[2] })) || [];
//     res.status(200).json({ columns });
//   } catch (error) {
//     res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
//   }
// });

// app.post('/api/debug/migrate-history-full', async (req, res) => {
//   const results = [];
//   try {
//     const { db, dbPath } = await getDb();
//     // Add user_id column
//     try {
//       db.exec('ALTER TABLE history ADD COLUMN user_id TEXT;');
//       results.push({ column: 'user_id', status: 'added' });
//     } catch (err) {
//       results.push({ column: 'user_id', status: 'error', error: err instanceof Error ? err.message : String(err) });
//     }
//     // Add menu column
//     try {
//       db.exec('ALTER TABLE history ADD COLUMN menu TEXT;');
//       results.push({ column: 'menu', status: 'added' });
//     } catch (err) {
//       results.push({ column: 'menu', status: 'error', error: err instanceof Error ? err.message : String(err) });
//     }
//     // Add created_at column
//     try {
//       db.exec('ALTER TABLE history ADD COLUMN created_at INTEGER;');
//       results.push({ column: 'created_at', status: 'added' });
//     } catch (err) {
//       results.push({ column: 'created_at', status: 'error', error: err instanceof Error ? err.message : String(err) });
//     }
//     // Persist changes to disk
//     const data = Buffer.from(db.export());
//     fs.writeFileSync(dbPath, data);
//     res.status(200).json({ results });
//   } catch (error) {
//     res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
//   }
// });

// app.get('/api/debug/users', async (req, res) => {
//   const { db } = await getDb();
//   const result = db.exec('SELECT * FROM users');
//   res.json(result[0]?.values || []);
// });

// app.get('/api/debug/recipes', async (req, res) => {
//   const { db } = await getDb();
//   const result = db.exec('SELECT * FROM recipes');
//   res.json(result[0]?.values || []);
// });

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
