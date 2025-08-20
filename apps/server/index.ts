
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/config', configRouter);
app.use('/api/menu', menuRouter);

// Error handler middleware (must be after all routes)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
