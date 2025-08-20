import { Router } from 'express';
import { getDb, parseRecipes, parseHistory, parseConfig } from '../services/dbHelpers';
import { sendEmail } from '../utils/email';
import { sendTelegramMessage } from '../utils/telegramBot';
import logger from '../utils/logger.js';
import { formatShoppingListForTelegram, generateShoppingList } from 'services/shoppingListGenerator';
import { formatMenu, generateHtmlEmail, generateMenu } from 'services/menuGenerator';

const router = Router();

// POST /api/menu/email - send meal plan as HTML email
router.post('/email', async (req, res) => {
  logger.info('POST /api/menu/email');
  try {
    const { db } = await getDb();
    const recipes = parseRecipes(db.exec('SELECT * FROM recipes'));
    const history = parseHistory(db.exec('SELECT * FROM history'));
    const config = parseConfig(db.exec('SELECT menuOptions FROM config WHERE id = 1'));
    
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

// POST /api/menu/telegram - send meal plan or custom message to Telegram
router.post('/telegram', async (req, res) => {
  logger.info('POST /api/menu/telegram', { body: req.body });
  try {
    const { chatId, text } = req.body;
    const { db } = await getDb();
    const config = parseConfig(db.exec('SELECT menuOptions FROM config WHERE id = 1'));
    
    // Collect chat IDs
    let chatIds: string[] = [];
    if (chatId) chatIds.push(String(chatId));
    if ('telegramChatId' in config.menuOptions && config.menuOptions.telegramChatId && !chatIds.includes(String(config.menuOptions.telegramChatId))) {
      chatIds.push(String(config.menuOptions.telegramChatId));
    }
    if (Array.isArray(config.menuOptions.telegramChatIds)) {
      for (const id of config.menuOptions.telegramChatIds) {
        if (id && !chatIds.includes(String(id))) chatIds.push(String(id));
      }
    }
    if (chatIds.length === 0 && process.env.TELEGRAM_CHAT_ID) {
      chatIds.push(String(process.env.TELEGRAM_CHAT_ID));
    }
    
    if (chatIds.length === 0) {
      return res.status(400).json({ error: 'No valid Telegram chatId found in request, config, or environment.' });
    }

    // Send custom text if provided
    if (text && typeof text === 'string') {
      for (const id of chatIds) {
        await sendTelegramMessage(text, id);
      }
      logger.info('Telegram message sent (custom)');
      return res.status(200).json({ message: 'Telegram message sent successfully' });
    }

    // Generate and send menu + shopping list
    const recipes = parseRecipes(db.exec('SELECT * FROM recipes'));
    const history = parseHistory(db.exec('SELECT * FROM history'));
    const menu = generateMenu(recipes, history, config);
    const menuText = formatMenu(menu);
    
    const categorizedList = generateShoppingList(menu, recipes);
    const groceryText = formatShoppingListForTelegram(categorizedList);
    
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

export default router;