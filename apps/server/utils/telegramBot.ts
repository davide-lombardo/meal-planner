import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export async function sendTelegramMessage(message: string, chatId?: string) {
  if (!chatId && !TELEGRAM_CHAT_ID) {
    throw new Error('No chatId provided and TELEGRAM_CHAT_ID is not set');
  }
  try {
    return await bot.sendMessage(chatId || TELEGRAM_CHAT_ID!, message, { parse_mode: 'HTML' });
  } catch (err: any) {
    console.error('Telegram API error:', err?.response?.body || err);
    throw err;
  }
}
