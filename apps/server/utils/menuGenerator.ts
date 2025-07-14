import { Recipe, Menu, MenuOptions, Config } from '@meal-planner/shared/schemas';

export type ParsedIngredient = {
  name: string;
  quantity: number;
  unit: string;
  originalText: string;
  category: string;
};

// Simplified keyword-based categorization
const INGREDIENT_KEYWORDS: Record<string, string> = {
  // Frutta e Verdura
  pomodoro: 'Frutta e Verdura',
  cipolla: 'Frutta e Verdura',
  aglio: 'Frutta e Verdura',
  basilico: 'Frutta e Verdura',
  prezzemolo: 'Frutta e Verdura',
  limone: 'Frutta e Verdura',
  patata: 'Frutta e Verdura',
  carota: 'Frutta e Verdura',
  zucchina: 'Frutta e Verdura',
  melanzana: 'Frutta e Verdura',
  peperone: 'Frutta e Verdura',
  insalata: 'Frutta e Verdura',
  spinaci: 'Frutta e Verdura',

  // Carne e Pesce
  pollo: 'Carne e Pesce',
  manzo: 'Carne e Pesce',
  maiale: 'Carne e Pesce',
  salmone: 'Carne e Pesce',
  tonno: 'Carne e Pesce',
  gamber: 'Carne e Pesce',
  prosciutto: 'Carne e Pesce',
  pancetta: 'Carne e Pesce',

  // Latticini
  latte: 'Latticini',
  burro: 'Latticini',
  parmigiano: 'Latticini',
  mozzarella: 'Latticini',
  ricotta: 'Latticini',
  yogurt: 'Latticini',
  uovo: 'Latticini',

  // Dispensa
  pasta: 'Dispensa',
  riso: 'Dispensa',
  farina: 'Dispensa',
  olio: 'Dispensa',
  aceto: 'Dispensa',
  sale: 'Dispensa',
  pepe: 'Dispensa',
  zucchero: 'Dispensa',
  passata: 'Dispensa',
  conserva: 'Dispensa',
  legumi: 'Dispensa',
  pane: 'Dispensa',
};

// Helper function to get current season
const getCurrentSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

/**
 * Try to assign a category using keyword-based fuzzy matching
 */
function getIngredientCategory(ingredient: string): string {
  const normalized = ingredient.toLowerCase();

  for (const [keyword, category] of Object.entries(INGREDIENT_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }

  return 'Altro';
}
// Common pantry items that most people have
const PANTRY_STAPLES = new Set([
  'sale',
  'pepe',
  'pepe nero',
  'olio extravergine',
  'olio',
  'aceto',
  'zucchero',
]);

/**
 * Parse ingredient text to extract quantity, unit, and name
 * Examples: "200g pasta" -> {quantity: 200, unit: "g", name: "pasta"}
 */
function parseIngredient(ingredient: string): ParsedIngredient {
  const normalized = ingredient.toLowerCase().trim();

  // Regex to match quantity and unit patterns
  const patterns = [
    /^(\d+(?:[.,]\d+)?)\s*(g|gr|grammi?|kg|chilogram[mi]?)\s+(.+)$/,
    /^(\d+(?:[.,]\d+)?)\s*(ml|l|litri?)\s+(.+)$/,
    /^(\d+)\s*(pezzi?|pz|n°|numero)\s+(.+)$/,
    /^(\d+)\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const quantity = parseFloat(match[1].replace(',', '.'));
      const unit = match[2] || 'pz';
      const name = match[3] || match[2];

      return {
        name: name.trim(),
        quantity,
        unit: normalizeUnit(unit),
        originalText: ingredient,
        category: getIngredientCategory(name.trim()),
      };
    }
  }

  // No quantity found, treat as single item
  return {
    name: normalized,
    quantity: 1,
    unit: 'pz',
    originalText: ingredient,
    category: getIngredientCategory(normalized),
  };
}

/**
 * Normalize units to standard forms
 */
function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    g: 'g',
    gr: 'g',
    grammi: 'g',
    grammo: 'g',
    kg: 'kg',
    chilogrammi: 'kg',
    chilogrammo: 'kg',
    ml: 'ml',
    l: 'l',
    litri: 'l',
    litro: 'l',
    pezzi: 'pz',
    pezzo: 'pz',
    'n°': 'pz',
    numero: 'pz',
  };

  return unitMap[unit.toLowerCase()] || unit;
}

/**
 * Check if ingredients can be combined (same name and compatible units)
 */
function canCombineIngredients(a: ParsedIngredient, b: ParsedIngredient): boolean {
  return a.name === b.name && a.unit === b.unit;
}

/**
 * Combine two ingredients with same name and unit
 */
function combineIngredients(a: ParsedIngredient, b: ParsedIngredient): ParsedIngredient {
  return {
    ...a,
    quantity: a.quantity + b.quantity,
    originalText: `${a.originalText}, ${b.originalText}`,
  };
}

/**
 * Format ingredient for display
 */
function formatIngredient(
  ingredient: ParsedIngredient,
  includePantryNote: boolean = false,
): string {
  const isPantryStaple = PANTRY_STAPLES.has(ingredient.name);

  let formatted = '';
  if (ingredient.quantity === 1 && ingredient.unit === 'pz') {
    formatted = ingredient.name;
  } else {
    formatted = `${ingredient.quantity}${ingredient.unit} ${ingredient.name}`;
  }

  if (includePantryNote && isPantryStaple) {
    formatted += ' (probabilmente già in casa)';
  }

  return formatted;
}

/**
 * HOW MEAL SELECTION WORKS
 *
 * Think of this like a smart chef who remembers what you've eaten recently and tries to give you variety.
 *
 * The algorithm follows these rules in order:
 *
 * 1. AVOID REPETITION: Won't pick recipes you've had in the last X weeks (configurable)
 * 2. AVOID DUPLICATES: Won't use the same recipe twice in the same week
 * 3. RESPECT MEAL TYPES: If a recipe is marked for "pranzo" or "cena", it only goes in that slot
 * 4. FOLLOW QUOTAS: If quotas are enabled, limits how many times each category appears per week
 * 5. SPECIAL RULES: Friday dinner = Pizza, Saturday dinner = Free choice
 *
 * WHY THIS APPROACH:
 * - Prevents boring repetition (you won't get pasta 5 days in a row)
 * - Ensures balanced nutrition through category quotas
 * - Respects Italian meal traditions (lighter lunch, substantial dinner)
 * - Adds randomness so menus feel fresh each week
 *
 * FALLBACK STRATEGY:
 * If the algorithm can't find recipes that meet all criteria, it relaxes rules step by step:
 * 1. First ignores quotas
 * 2. Then ignores recent history
 * 3. Finally just picks any compatible recipe
 *
 * This ensures you always get a complete menu, even with limited recipes.
 */
export function generateMenu(recipes: Recipe[], history: Menu[] = [], config: Config): Menu {
  const menu: Menu = { pranzo: [], cena: [] };
  const maxWeeks = config.menuOptions.maxRepetitionWeeks || 2;
  const useQuotas = config.menuOptions.useQuotas !== false;
  const enableSeasonalFiltering = config.menuOptions.enableSeasonalFiltering || false;
  const currentSeason = config.menuOptions.currentSeason || getCurrentSeason();
  const weeklyQuotas = useQuotas ? { ...config.menuOptions.mealTypeQuotas } : undefined;
  const usedThisWeek = new Set<string>();
  const recentlyUsed = new Set(
    history
      .slice(-maxWeeks)
      .flatMap((menu) => [...menu.pranzo, ...menu.cena].filter((r) => r && r.id).map((r) => r!.id)),
  );

  const getSeasonalRecipes = (allRecipes: Recipe[]): Recipe[] => {
    if (!enableSeasonalFiltering) return allRecipes;

    return allRecipes.filter((recipe) => {
      // If recipe has no seasons defined, include it (backwards compatibility)
      if (!recipe.stagioni || recipe.stagioni.length === 0) return true;

      // Check if current season is in the recipe's allowed seasons
      return recipe.stagioni.includes(currentSeason);
    });
  };

  const canUseRecipe = (recipe: Recipe, mealType: string) => {
    if (!recipe || usedThisWeek.has(recipe.id) || recentlyUsed.has(recipe.id)) return false;
    if (recipe.tipo && recipe.tipo !== mealType) return false;
    if (useQuotas && weeklyQuotas && weeklyQuotas[recipe.categoria || ''] <= 0) return false;
    return true;
  };

  const getAvailableRecipes = (mealType: string, ignoreQuotas = false) => {
    // First apply seasonal filtering
    let filteredRecipes = getSeasonalRecipes(recipes);

    return filteredRecipes.filter((recipe) => {
      if (!ignoreQuotas) return canUseRecipe(recipe, mealType);
      return (
        recipe &&
        !usedThisWeek.has(recipe.id) &&
        !recentlyUsed.has(recipe.id) &&
        (!recipe.tipo || recipe.tipo === mealType)
      );
    });
  };

  const getFallbackRecipes = (mealType: string) => {
    // Fallback options when seasonal filtering is too restrictive
    let fallbackRecipes = recipes.filter(
      (r) => (!r.tipo || r.tipo === mealType) && !recentlyUsed.has(r.id),
    );

    // If we still have no options, ignore recent usage too
    if (fallbackRecipes.length === 0) {
      fallbackRecipes = recipes.filter((r) => !r.tipo || r.tipo === mealType);
    }

    return fallbackRecipes;
  };

  const selectMeal = (mealType: string, dayIndex: number): Recipe | null => {
    // Special cases for weekend dinners
    if (mealType === 'cena') {
      if (dayIndex === 5) return { id: 'pizza', nome: 'Pizza', tipo: 'cena', ingredienti: [] };
      if (dayIndex === 6) return { id: 'libero', nome: 'Libero', tipo: 'cena', ingredienti: [] };
    }

    // Try to find recipes following all rules (including seasonal)
    let available = getAvailableRecipes(mealType);

    // Fallback 1: Ignore quotas but keep seasonal filtering
    if (available.length === 0) {
      available = getAvailableRecipes(mealType, true);
    }

    // Fallback 2: If seasonal filtering is too restrictive, expand to all recipes
    if (available.length === 0 && enableSeasonalFiltering) {
      console.warn(`No seasonal recipes available for ${mealType}, falling back to all recipes`);
      available = getFallbackRecipes(mealType);
    }

    // Fallback 3: Final fallback
    if (available.length === 0) {
      available = recipes.filter((r) => !r.tipo || r.tipo === mealType);
    }

    if (available.length === 0) return null;

    const selected = available[Math.floor(Math.random() * available.length)];
    usedThisWeek.add(selected.id);

    if (useQuotas && weeklyQuotas && selected.categoria && weeklyQuotas[selected.categoria]) {
      weeklyQuotas[selected.categoria]--;
    }

    return selected;
  };

  // Randomize meal slot selection to add variety in assignment order
  const allMealSlots = [] as { type: 'pranzo' | 'cena'; day: number }[];
  for (let i = 0; i < 7; i++) {
    allMealSlots.push({ type: 'pranzo', day: i });
    allMealSlots.push({ type: 'cena', day: i });
  }

  // Fisher-Yates shuffle for random assignment order
  for (let i = allMealSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allMealSlots[i], allMealSlots[j]] = [allMealSlots[j], allMealSlots[i]];
  }

  allMealSlots.forEach((slot) => {
    const meal = selectMeal(slot.type, slot.day);
    if (slot.type === 'pranzo') menu.pranzo[slot.day] = meal;
    else menu.cena[slot.day] = meal;
  });

  return menu;
}

export function formatMenu(menu: Menu): string {
  const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  let formattedMenu = 'Menù settimanale:\n\n';
  for (let i = 0; i < 7; i++) {
    formattedMenu += `${daysOfWeek[i]}:\n`;
    formattedMenu += `  Pranzo: ${menu.pranzo[i]?.nome || 'Non disponibile'}\n`;
    formattedMenu += `  Cena: ${menu.cena[i]?.nome || 'Non disponibile'}\n\n`;
  }
  return formattedMenu;
}

/**
 * Generate smart shopping list with improved logic:
 * - Combines duplicate ingredients with quantities
 * - Groups by store sections
 * - Marks pantry staples
 */
export function generateShoppingList(
  menu: Menu,
  recipes: Recipe[],
): Map<string, ParsedIngredient[]> {
  const ingredientMap = new Map<string, ParsedIngredient>();
  const allMeals = [...menu.pranzo, ...menu.cena];

  // Parse and collect all ingredients
  allMeals.forEach((meal) => {
    if (meal && meal.id) {
      const recipe = recipes.find((r) => r.id === meal.id);
      if (recipe && recipe.ingredienti) {
        recipe.ingredienti.forEach((ingredientText: string) => {
          const parsed = parseIngredient(ingredientText);
          const key = `${parsed.name}-${parsed.unit}`;

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            ingredientMap.set(key, combineIngredients(existing, parsed));
          } else {
            ingredientMap.set(key, parsed);
          }
        });
      }
    }
  });

  // Group by categories
  const categorizedList = new Map<string, ParsedIngredient[]>();

  for (const ingredient of ingredientMap.values()) {
    const category = ingredient.category;
    if (!categorizedList.has(category)) {
      categorizedList.set(category, []);
    }
    categorizedList.get(category)!.push(ingredient);
  }

  // Sort ingredients within each category
  for (const [category, ingredients] of categorizedList.entries()) {
    ingredients.sort((a, b) => a.name.localeCompare(b.name));
  }

  return categorizedList;
}

/**
 * Generate improved HTML email with organized shopping list
 */
export function generateHtmlEmail(menu: Menu, recipes: Recipe[]): string {
  const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  const menuHtml = daysOfWeek
    .map(
      (day, i) => `
    <div class="menu-day">
      <strong>${day}</strong>
      <div class="meal"><span class="meal-type">Pranzo:</span> ${
        menu.pranzo[i]?.nome || 'Non disponibile'
      }</div>
      <div class="meal"><span class="meal-type">Cena:</span> ${
        menu.cena[i]?.nome || 'Non disponibile'
      }</div>
    </div>
  `,
    )
    .join('');

  const categorizedShoppingList = generateShoppingList(menu, recipes);

  // Category order for better shopping flow
  const categoryOrder = ['Frutta e Verdura', 'Carne e Pesce', 'Latticini', 'Dispensa', 'Altro'];

  const categoryIcons: Record<string, string> = {
    'Frutta e Verdura': '🥬',
    'Carne e Pesce': '🍖',
    Latticini: '🥛',
    Dispensa: '🏪',
    Altro: '📦',
  };

  const shoppingListHtml = categoryOrder
    .filter((category) => categorizedShoppingList.has(category))
    .map((category) => {
      const ingredients = categorizedShoppingList.get(category)!;
      const itemsHtml = ingredients
        .map((ingredient) => {
          const isPantryStaple = PANTRY_STAPLES.has(ingredient.name);
          const itemClass = isPantryStaple ? 'shopping-item pantry-staple' : 'shopping-item';
          return `<li class="${itemClass}">${formatIngredient(ingredient, true)}</li>`;
        })
        .join('');

      return `
        <div class="category-section">
          <h3 class="category-title">${categoryIcons[category]} ${category}</h3>
          <ul class="category-items">${itemsHtml}</ul>
        </div>
      `;
    })
    .join('');

  return `
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
          line-height: 1.5;
        }
        .container { 
          width: 100%; 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #fff; 
          padding: 20px; 
          border-radius: 12px; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
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
        .category-section {
          margin-bottom: 25px;
        }
        .category-title {
          font-size: 18px;
          font-weight: bold;
          color: #00509e;
          margin-bottom: 12px;
          padding-bottom: 5px;
          border-bottom: 2px solid #0073e6;
        }
        .category-items { 
          list-style-type: none; 
          padding: 0; 
          margin: 0;
        }
        .shopping-item { 
          background: #fff; 
          padding: 12px 15px; 
          border: 1px solid #ddd; 
          margin: 8px 0; 
          border-radius: 4px; 
          font-size: 15px; 
          color: #333;
          display: flex;
          align-items: center;
        }
        .shopping-item.pantry-staple {
          background-color: #fff8dc;
          border-color: #daa520;
          font-style: italic;
          color: #8b7355;
        }
        .footer { 
          text-align: center; 
          font-size: 14px; 
          color: #666; 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
        }
        .tip {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          font-size: 14px;
          color: #856404;
        }
        .tip strong {
          color: #533f03;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Menu Settimanale</h1>
        <div class="menu">${menuHtml}</div>
        <div class="shopping-list-container">
          <h2>Lista della Spesa</h2>
          ${shoppingListHtml}
          <div class="tip">
            <strong>💡 Suggerimento:</strong> Gli ingredienti sono organizzati per sezioni del supermercato per facilitare la spesa. Gli elementi evidenziati sono probabilmente già presenti in dispensa.
          </div>
        </div>
        <div class="footer"><p>Buon appetito!</p></div>
      </div>
    </body>
    </html>
  `;
}
