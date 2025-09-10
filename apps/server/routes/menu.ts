import { Router } from "express";
import { getUserIdFromRequest } from "../utils/auth";
import {
  getDb,
  parseRecipes,
  parseHistory,
  parseConfig,
} from "../services/dbHelpers";
import { sendEmail } from "../utils/email";
import { sendTelegramMessage } from "../utils/telegramBot";
import logger from "../utils/logger.js";
import {
  formatShoppingListForTelegram,
  generateShoppingList,
} from "services/shoppingListGenerator";
import {
  formatMenu,
  generateHtmlEmail,
  generateMenu,
} from "services/menuGenerator";

const router = Router();
    const fs = await import("fs");


router.get("/history", async (req, res) => {
  logger.info("GET /api/menu/history");
  try {
    const { db } = await getDb();
    const history = parseHistory(db.exec("SELECT * FROM history"));
    res.status(200).json({ history });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to get history:s", errMsg);
    res.status(500).json({ message: "Failed to get history", error: errMsg });
  }
});


router.post("/history/clear", async (req, res) => {
  logger.info("POST /api/menu/history/clear");
  try {
    const { db, dbPath } = await getDb();
    await db.exec("DELETE FROM history");
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    res.status(200).json({ message: "History cleared" });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to clear history: %s", errMsg);
    res.status(500).json({ message: "Failed to clear history", error: errMsg });
  }
});

router.post("/email", async (req, res) => {
  logger.info("POST /api/menu/email");
  try {
    const { db, dbPath } = await getDb();

    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const recipes = parseRecipes(db.exec("SELECT * FROM recipes"));
    const rawHistory = db.exec("SELECT * FROM history");
    const history = parseHistory(rawHistory);
    const config = parseConfig(
      db.exec("SELECT menuOptions FROM config WHERE user_id = ?", [userId])
    );
    const menu = generateMenu(recipes, history, config);
    const html = generateHtmlEmail(menu, recipes);

    const subject = "Il tuo Menu Settimanale";
    const text =
      "In allegato trovi il menu settimanale e la lista della spesa.";
    await sendEmail(subject, text, html);
    // Save menu to history
    await db.exec(
      "INSERT INTO history (user_id, menu, created_at) VALUES (?, ?, ?)",
      [userId, JSON.stringify(menu), Date.now()]
    );

    const fs = await import("fs");
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    logger.info("Meal plan email sent and saved to history");
    res.status(200).json({ message: "Meal plan email sent successfully" });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to send meal plan email: %s", errMsg);
    res
      .status(500)
      .json({ message: "Failed to send meal plan email", error: errMsg });
  }
});

router.post("/telegram", async (req, res) => {
  logger.info("POST /api/menu/telegram", { body: req.body });
  try {
    const { chatId, text } = req.body;
    const { db, dbPath } = await getDb();

    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const config = parseConfig(
      db.exec("SELECT menuOptions FROM config WHERE user_id = ?", [userId])
    );

    const chatIds = collectTelegramChatIds(chatId, config);

    if (chatIds.length === 0) {
      return res.status(400).json({
        error:
          "No valid Telegram chatId found in request, config, or environment.",
      });
    }

    if (text && typeof text === "string") {
      await sendCustomTelegramMessage(text, chatIds);
      return res
        .status(200)
        .json({ message: "Telegram message sent successfully" });
    }

    await sendGeneratedMenuToTelegram(db, dbPath, userId, config, chatIds);
    res.status(200).json({ message: "Telegram message sent successfully" });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to send Telegram message: %s", errMsg);
    res
      .status(500)
      .json({ message: "Failed to send Telegram message", error: errMsg });
  }
});

// Helper to collect all possible Telegram chat IDs
function collectTelegramChatIds(
  chatId: string | undefined,
  config: { menuOptions: any }
): string[] {
  let chatIds: string[] = [];
  if (chatId) chatIds.push(String(chatId));
  if (
    "telegramChatId" in config.menuOptions &&
    config.menuOptions.telegramChatId &&
    !chatIds.includes(String(config.menuOptions.telegramChatId))
  ) {
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
  return chatIds;
}

// Send a custom Telegram message to all chat IDs
async function sendCustomTelegramMessage(
  text: string,
  chatIds: string[]
): Promise<void> {
  for (const id of chatIds) {
    await sendTelegramMessage(text, id);
  }
  logger.info("Telegram message sent (custom)");
}

// Generate menu, send to Telegram, and save to history
async function sendGeneratedMenuToTelegram(
  db: any,
  dbPath: any,
  userId: string,
  config: { menuOptions: any },
  chatIds: string[]
): Promise<void> {
  const recipes = parseRecipes(db.exec("SELECT * FROM recipes"));
  const history = parseHistory(db.exec("SELECT * FROM history"));
  const menu = generateMenu(recipes, history, config);
  const menuText = formatMenu(menu);
  const categorizedList = generateShoppingList(menu, recipes);
  const groceryText = formatShoppingListForTelegram(categorizedList);
  const fullMessage = `Ciao! Il tuo menu settimanale è pronto su Meal Planner.\n\n${menuText}\n${groceryText}`;
    
  for (const id of chatIds) {
    await sendTelegramMessage(fullMessage, id);
  }
  await db.exec(
    "INSERT INTO history (user_id, menu, created_at) VALUES (?, ?, ?)",
    [userId, JSON.stringify(menu), Date.now()]
  );
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
  logger.info(
    "Telegram message sent (menu + grocery list) and saved to history"
  );
}

export default router;
