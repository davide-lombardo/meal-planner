import { Router } from 'express';
import { getUserIdFromRequest } from '../utils/auth';
import { ConfigSchema, type Config, type MenuOptions } from 'shared/schemas';
import { getDb, parseConfig } from '../services/dbHelpers';
import logger from '../utils/logger';
import fs from 'fs';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { db } = await getDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const result = db.exec('SELECT menuOptions FROM config WHERE user_id = ?', [userId]);
    const config = parseConfig(result);
    if (!config.menuOptions) config.menuOptions = {};
    if (!('telegramChatId' in config.menuOptions) && process.env.TELEGRAM_CHAT_ID) {
      (config.menuOptions as any).telegramChatId = process.env.TELEGRAM_CHAT_ID;
    }
    res.json(config);
  } catch (err) {
    logger.error('Failed to load config:', err);
    res.status(500).json({ error: 'Failed to load config' });
  }
});

router.put('/', async (req, res) => {
  try {
    const parseResult = ConfigSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid config input', details: parseResult.error.errors });
    }
    const { db, dbPath } = await getDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    db.run('DELETE FROM config WHERE user_id = ?', [userId]);
    db.run('INSERT INTO config (user_id, menuOptions) VALUES (?, ?)', [userId, JSON.stringify(parseResult.data.menuOptions || {})]);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    res.status(200).json({ message: 'Config updated' });
  } catch (err) {
    logger.error('Failed to update config:', err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

export default router;
