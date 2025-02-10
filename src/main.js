const fs = require("fs");
const path = require("path");
require("dotenv").config();

const menuGenerator = require("./utils/menuGenerator");
const emailService = require("./utils/email");

// Define paths to necessary files
const configPath = path.join(__dirname, "data/config.json");
const recipesPath = path.join(__dirname, "data/recipes.json");
const historyPath = path.join(__dirname, "data/history.json");

/**
 * Safely reads a JSON file, returning empty array for empty history file
 * @param {string} filePath - Path to the JSON file
 * @param {boolean} isHistory - Whether this is the history file
 * @returns {any} Parsed JSON content
 */
function readJsonFile(filePath, isHistory = false) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf8").trim();

  // For history file, return empty array if file is empty
  if (isHistory && !content) {
    return [];
  }

  // For other files, require valid JSON
  return JSON.parse(content);
}

async function main() {
  try {
    // Check if the configuration file exists and load it
    const config = readJsonFile(configPath);

    // Load recipes
    const recipes = readJsonFile(recipesPath);

    // Load history, treating empty file as empty array
    const history = readJsonFile(historyPath, true);

    // Generate the weekly menu
    const menu = menuGenerator.generateMenu(recipes, history, config);
    menuGenerator.saveMenuToHistory(menu, historyPath);

    const menuText = menuGenerator.formatMenu(menu);
    const menuHtml = menuGenerator.generateHtmlEmail(menu, recipes);

    // Send the menu via email
    await emailService.sendEmail("Weekly Menu", menuText, menuHtml);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

main();