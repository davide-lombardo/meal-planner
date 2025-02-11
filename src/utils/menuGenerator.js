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
  const maxWeeks = config.menuOptions.maxRepetitionWeeks || 2;
  const useQuotas = config.menuOptions.useQuotas !== false;

  const weeklyQuotas = useQuotas ? { ...config.menuOptions.mealTypeQuotas } : null;

  // Track used recipes for this week and from recent history
  const usedThisWeek = new Set();
  const recentlyUsed = new Set(
    history.slice(-maxWeeks).flatMap((menu) =>
      [...menu.pranzo, ...menu.cena]
        .filter((r) => r && r.id)
        .map((r) => r.id)
    )
  );

  /**
   * Checks if a recipe can be used based on current constraints
   * @param {Object} recipe - Recipe to check
   * @param {string} mealType - Meal type (pranzo/cena)
   * @returns {boolean} Whether the recipe can be used
   */
  const canUseRecipe = (recipe, mealType) => {
    if (!recipe || usedThisWeek.has(recipe.id) || recentlyUsed.has(recipe.id)) {
      return false;
    }
    
    if (recipe.tipo && recipe.tipo !== mealType) {
      return false;
    }

    if (useQuotas && weeklyQuotas[recipe.categoria] <= 0) {
      return false;
    }

    return true;
  };

  /**
   * Gets all valid recipes for a meal slot
   * @param {string} mealType - Meal type (pranzo/cena)
   * @param {boolean} ignoreQuotas - Whether to ignore quota constraints
   * @returns {Array} Available recipes
   */
  const getAvailableRecipes = (mealType, ignoreQuotas = false) => {
    return recipes.filter(recipe => {
      if (!ignoreQuotas) {
        return canUseRecipe(recipe, mealType);
      }
      // Ignore quotas but still respect meal type and usage history
      return recipe && 
             !usedThisWeek.has(recipe.id) && 
             !recentlyUsed.has(recipe.id) &&
             (!recipe.tipo || recipe.tipo === mealType);
    });
  };

  /**
   * Selects a meal for a specific slot
   * @param {string} mealType - Meal type (pranzo/cena)
   * @param {number} dayIndex - Current day index
   * @returns {Object} Selected recipe
   */
  const selectMeal = (mealType, dayIndex) => {
    // Handle special cases for dinner
    if (mealType === "cena") {
      if (dayIndex === 5) return { id: "pizza", nome: "Pizza", tipo: "cena" };
      if (dayIndex === 6) return { id: "libero", nome: "Libero", tipo: "cena" };
    }

    // Try with all constraints
    let available = getAvailableRecipes(mealType);
    
    // If no recipes available, try ignoring quotas
    if (available.length === 0) {
      available = getAvailableRecipes(mealType, true);
    }
    
    // If still no recipes, try reusing a recipe from this week
    if (available.length === 0) {
      available = recipes.filter(recipe => 
        (!recipe.tipo || recipe.tipo === mealType) &&
        !recentlyUsed.has(recipe.id)
      );
    }

    // If absolutely no recipes available, reuse any valid recipe
    if (available.length === 0) {
      available = recipes.filter(recipe => 
        !recipe.tipo || recipe.tipo === mealType
      );
      console.warn(`Reusing recipes for ${mealType} on day ${dayIndex + 1}`);
    }

    if (available.length === 0) {
      console.error(`No available recipes for ${mealType} on day ${dayIndex + 1}`);
      return null;
    }

    // Select random recipe from available options
    const selected = available[Math.floor(Math.random() * available.length)];
    
    // Update tracking
    usedThisWeek.add(selected.id);
    if (useQuotas && weeklyQuotas[selected.categoria]) {
      weeklyQuotas[selected.categoria]--;
    }

    return selected;
  };

  // Pre-calculate meals for better distribution
  const allMealSlots = [];
  for (let i = 0; i < 7; i++) {
    allMealSlots.push({ type: "pranzo", day: i });
    allMealSlots.push({ type: "cena", day: i });
  }
  
  // Shuffle meal slots for more even distribution
  for (let i = allMealSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allMealSlots[i], allMealSlots[j]] = [allMealSlots[j], allMealSlots[i]];
  }

  // Fill menu slots in random order
  allMealSlots.forEach(slot => {
    const meal = selectMeal(slot.type, slot.day);
    if (slot.type === "pranzo") {
      menu.pranzo[slot.day] = meal;
    } else {
      menu.cena[slot.day] = meal;
    }
  });

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
