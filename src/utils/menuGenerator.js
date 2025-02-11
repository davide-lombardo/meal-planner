const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../data/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

/**
 * Generates a weekly menu with lunch (pranzo) and dinner (cena), ensuring variety and quota constraints.
 * @param {Array} recipes - List of available recipes.
 * @param {Array} history - List of past weekly menus to avoid repetition.
 * @returns {Object} The generated weekly menu.
 */
function generateMenu(recipes, history = []) {
  const menu = { pranzo: [], cena: [] };

  // Configuration values
  const maxWeeks = config.menuOptions.maxRepetitionWeeks || 4;
  const useQuotas = config.menuOptions.useQuotas !== false;
  const quotas = useQuotas ? { ...config.menuOptions.mealTypeQuotas } : null;

  // Get recent history to prevent repetition of meals within maxWeeks
  const recentHistory = history.slice(-maxWeeks);
  const usedRecipes = new Set(
    recentHistory.flatMap((menu) =>
      [...menu.pranzo, ...menu.cena]
        .filter((r) => r && r.id)
        .map((r) => r.id)
    )
  );
 /**
   * Filters recipes by category while ensuring they haven't been recently used.
   * @param {string} category - The category of meals to filter.
   * @returns {Array} A list of available recipes in the category.
   */
  const filterRecipesByCategory = (category) =>
    recipes.filter(
      (recipe) => recipe.categoria === category && !usedRecipes.has(recipe.id)
    );

     /**
   * Selects a meal based on type (pranzo/cena), ensuring quotas and variety.
   * @param {string} type - The meal type ("pranzo" or "cena").
   * @returns {Object|null} The selected meal or null if no valid option is available.
   */
  const assignMeal = (type) => {
    for (const [category, quota] of Object.entries(quotas || {})) {
      if (!useQuotas || quota > 0) {
        const options = filterRecipesByCategory(category).filter(
          (recipe) => recipe.tipo === type
        );
        if (options.length > 0) {
          const selected = options[Math.floor(Math.random() * options.length)];
          if (useQuotas) quotas[category]--;
          usedRecipes.add(selected.id);
          return selected;
        }
      }
    }
    return null;
  };

  // Fill the menu
  for (let i = 0; i < 7; i++) {
    const pranzoRecipe =
      assignMeal("pranzo") ||
      recipes.find((r) => r.tipo === "pranzo")
    const cenaRecipe =
      i === 5
        ? { id: "pizza", nome: "Pizza", tipo: "cena" }
        : i === 6
        ? { id: "libero", nome: "Libero", tipo: "cena" }
        : assignMeal("cena")

    menu.pranzo.push(pranzoRecipe);
    menu.cena.push(cenaRecipe);
  }

  return menu;
}
/**
 * Formats the weekly menu into plain text for email or other purposes.
 * @param {Object} menu - Weekly menu with pranzo and cena.
 * @returns {string} Formatted menu as a plain text string.
 */
function formatMenu(menu) {
  const daysOfWeek = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];

  let formattedMenu = "Menù settimanale:\n\n";

  for (let i = 0; i < 7; i++) {
    formattedMenu += `${daysOfWeek[i]}:\n`;
    formattedMenu += `  Pranzo: ${menu.pranzo[i]?.nome || "Non disponibile"}\n`;
    formattedMenu += `  Cena: ${menu.cena[i]?.nome || "Non disponibile"}\n\n`;
  }

  return formattedMenu;
}

function formatMenuHtml(menu) {
  const daysOfWeek = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];

  let formattedMenu = "";

  for (let i = 0; i < 7; i++) {
    formattedMenu += `
      <div class="menu-day">
        <strong>${daysOfWeek[i]}</strong>
        <div class="meal">
          <span class="meal-type">Pranzo:</span> 
          ${menu.pranzo[i]?.nome || "Non disponibile"}
        </div>
        <div class="meal">
          <span class="meal-type">Cena:</span> 
          ${menu.cena[i]?.nome || "Non disponibile"}
        </div>
      </div>
    `;
  }

  return formattedMenu;
}

function generateHtmlEmail(menu, recipes) {
  const menuHtml = formatMenuHtml(menu); // Use the new HTML formatter
  const shoppingListHtml = generateShoppingListHtml(menu, recipes);

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menu Settimanale</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h1, h2 {
          color: #333;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 30px;
        }
        h2 {
          font-size: 22px;
          margin: 20px 0;
        }
        .menu {
          margin-bottom: 30px;
        }
        .menu-day {
          background-color: #f0f8ff;
          border-left: 4px solid #0073e6;
          margin: 15px 0;
          padding: 15px;
          border-radius: 8px;
        }
        .menu-day strong {
          color: #00509e;
          font-size: 18px;
          display: block;
          margin-bottom: 10px;
        }
        .meal {
          margin: 8px 0;
          font-size: 15px;
          color: #444;
        }
        .meal-type {
          font-weight: 600;
          color: #0073e6;
          display: inline-block;
          width: 65px;
        }
        .shopping-list-container {
          background-color: #e7f5ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #0073e6;
          margin-top: 30px;
        }
        .shopping-list {
          list-style-type: none;
          padding: 0;
          margin: 10px 0;
        }
        .shopping-list li {
          background: #ffffff;
          padding: 12px 15px;
          border: 1px solid #ddd;
          margin: 8px 0;
          border-radius: 4px;
          font-size: 15px;
          color: #333;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Menu Settimanale</h1>

        <div class="menu">
          ${menuHtml}
        </div>

        <div class="shopping-list-container">
          <h2>Lista della Spesa</h2>
          ${shoppingListHtml}
        </div>

        <div class="footer">
          <p>Buon appetito!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailHtml;
}

/**
 * Saves the weekly menu to the history file.
 * @param {Object} menu - Weekly menu to save.
 * @param {string} historyPath - Path to the history file.
 */
function saveMenuToHistory(menu, historyPath) {
  let history = [];
  try {
    if (fs.existsSync(historyPath)) {
      const historyContent = fs.readFileSync(historyPath, "utf8").trim();
      history = historyContent ? JSON.parse(historyContent) : [];
    }
  } catch (error) {
    console.error("Error reading history file:", error.message);
  }

  history.push(menu);

  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8");
    console.log("History updated successfully.");
  } catch (error) {
    console.error("Error writing to history file:", error.message);
  }
}

/**
 * Generates a shopping list based on the weekly menu.
 * @param {Object} menu - Weekly menu with pranzo and cena.
 * @param {Array} recipes - List of recipes to get ingredients from.
 * @returns {Array} A shopping list with unique ingredients.
 */
function generateShoppingList(menu, recipes) {
  const shoppingList = new Set();

  // Gather all ingredients from pranzo and cena recipes
  const allMeals = [...menu.pranzo, ...menu.cena];
  allMeals.forEach((meal) => {
    if (meal && meal.id) {
      const recipe = recipes.find((r) => r.id === meal.id);
      if (recipe && recipe.ingredienti) {
        recipe.ingredienti.forEach((ingredient) =>
          shoppingList.add(ingredient)
        );
      }
    }
  });

  // Convert the Set to an array and return it
  return Array.from(shoppingList);
}

function generateShoppingListHtml(menu, recipes) {
  const shoppingList = generateShoppingList(menu, recipes);
  let listHtml = "<ul>";
  shoppingList.forEach((item) => {
    listHtml += `<li>${item}</li>`;
  });
  listHtml += "</ul>";
  return listHtml;
}

module.exports = {
  generateMenu,
  formatMenu,
  saveMenuToHistory,
  generateShoppingList,
  generateHtmlEmail,
};
