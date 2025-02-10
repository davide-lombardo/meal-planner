const fs = require("fs");
const path = require("path");

// Load configuration
const configPath = path.join(__dirname, "../data/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

/**
 * Generates a weekly menu based on recipes and past history.
 * @param {Array} recipes - List of recipes.
 * @param {Array} history - History of past weekly menus.
 * @returns {Object} Weekly menu with pranzo and cena.
 */
function generateMenu(recipes, history = []) {
  const menu = { pranzo: [], cena: [] };

  const maxWeeks = config.menuOptions.maxRepetitionWeeks || 4;
  const recentHistory = history.slice(-maxWeeks);
  const usedRecipes = new Set(
    recentHistory.flatMap((menu) =>
      [...menu.pranzo, ...menu.cena]
        .filter((r) => r && r.id) // Ensure the recipe and its ID are valid
        .map((r) => r.id)
    )
  );

  // Weekly quotas for each category
  const quotas = {
    carne: 4,
    legumi: 4,
    pesce: 2,
    formaggio: 1,
    uova: 1
  };

  // Helper to filter recipes by category and exclusion
  const filterRecipesByCategory = (category) =>
    recipes.filter(
      recipe =>
        recipe.categoria === category &&
        !usedRecipes.has(recipe.id)
    );

  const assignMeal = (type) => {
    for (const [category, quota] of Object.entries(quotas)) {
      if (quota > 0) {
        const options = filterRecipesByCategory(category).filter(
          recipe => recipe.tipo === type
        );
        if (options.length > 0) {
          const selected = options.shift();
          quotas[category]--;
          usedRecipes.add(selected.id);
          return selected;
        }
      }
    }
    return null; // No recipes available
  };

  // Fill the menu
  for (let i = 0; i < 7; i++) {
    const pranzoRecipe = assignMeal("pranzo");
    const cenaRecipe = i === 5
      ? { id: "pizza", nome: "Pizza", tipo: "cena" } // Fixed Pizza for Saturday
      : i === 6
      ? { id: "libero", nome: "Libero", tipo: "cena" } // Fixed Libero for Sunday
      : assignMeal("cena");

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
  const daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

  let formattedMenu = "Menù settimanale:\n\n";

  for (let i = 0; i < 7; i++) {
    formattedMenu += `${daysOfWeek[i]}:\n`;
    formattedMenu += `  Pranzo: ${menu.pranzo[i]?.nome || "Non disponibile"}\n`;
    formattedMenu += `  Cena: ${menu.cena[i]?.nome || "Non disponibile"}\n\n`;
  }

  return formattedMenu;
}

function formatMenuHtml(menu) {
  const daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
  
  let formattedMenu = '';
  
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
  allMeals.forEach(meal => {
    if (meal && meal.id) {
      const recipe = recipes.find(r => r.id === meal.id);
      if (recipe && recipe.ingredienti) {
        recipe.ingredienti.forEach(ingredient => shoppingList.add(ingredient));
      }
    }
  });

  // Convert the Set to an array and return it
  return Array.from(shoppingList);
}

function generateShoppingListHtml(menu, recipes) {
  const shoppingList = generateShoppingList(menu, recipes);
  let listHtml = "<ul>";
  shoppingList.forEach(item => {
    listHtml += `<li>${item}</li>`;
  });
  listHtml += "</ul>";
  return listHtml;
}

module.exports = { generateMenu, formatMenu, saveMenuToHistory, generateShoppingList, generateHtmlEmail };
