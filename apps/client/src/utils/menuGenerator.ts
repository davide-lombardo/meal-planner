export type Recipe = {
  id: string;
  nome: string;
  tipo?: string;
  categoria?: string;
  ingredienti: string[];
};

export type Menu = {
  pranzo: (Recipe | null)[];
  cena: (Recipe | null)[];
};

export type Config = {
  menuOptions: {
    maxRepetitionWeeks: number;
    useQuotas: boolean;
    mealTypeQuotas: Record<string, number>;
    useWeightedSelection?: boolean;
    enableIngredientPlanning?: boolean;
    lockedMeals?: { [key: string]: string };
    // New: List of available ingredients at home
    availableIngredients?: string[];
    // New: user preferences
    preferredRecipes?: string[];
    avoidedRecipes?: string[];
  };
};

// Simple in-memory cache for menu generation
const menuCache = new Map<string, Menu>();

function getMenuCacheKey(recipes: Recipe[], history: Menu[], config: Config): string {
  // Only cache based on relevant constraints (recipe ids, config, recent history)
  const recipeIds = recipes.map(r => r.id).sort().join(',');
  const configKey = JSON.stringify(config.menuOptions);
  const historyKey = JSON.stringify(history.slice(-config.menuOptions.maxRepetitionWeeks || 2));
  return `${recipeIds}|${configKey}|${historyKey}`;
}

export function generateMenu(recipes: Recipe[], history: Menu[] = [], config: Config): Menu {
  const cacheKey = getMenuCacheKey(recipes, history, config);
  if (menuCache.has(cacheKey)) {
    return menuCache.get(cacheKey)!;
  }
  const menu: Menu = { pranzo: [], cena: [] };
  const maxWeeks = config.menuOptions.maxRepetitionWeeks || 2;
  const useQuotas = config.menuOptions.useQuotas !== false;
  const weeklyQuotas = useQuotas ? { ...config.menuOptions.mealTypeQuotas } : undefined;
  const usedThisWeek = new Set<string>();
  const recentlyUsed = new Set(
    history.slice(-maxWeeks).flatMap((menu) => [...menu.pranzo, ...menu.cena].filter(r => r && r.id).map(r => r!.id))
  );

  // New: Weighted selection logic (optional, controlled by config)
  function weightedRandom(recipes: Recipe[]): Recipe | null {
    // Example: weight by inverse usage in history
    const usageCount: Record<string, number> = {};
    history.forEach(menu => {
      [...menu.pranzo, ...menu.cena].forEach(r => {
        if (r && r.id) usageCount[r.id] = (usageCount[r.id] || 0) + 1;
      });
    });
    const weights = recipes.map(r => 1 / ((usageCount[r.id] || 0) + 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let rnd = Math.random() * total;
    for (let i = 0; i < recipes.length; i++) {
      if (rnd < weights[i]) return recipes[i];
      rnd -= weights[i];
    }
    return recipes[0] || null;
  }

  // Ingredient-based selection (optional)
  function ingredientOptimized(recipes: Recipe[]): Recipe | null {
    if (!config.menuOptions.availableIngredients || config.menuOptions.availableIngredients.length === 0) {
      return null;
    }
    // Score recipes by how many ingredients are already available
    let best: Recipe | null = null;
    let bestScore = -1;
    for (const r of recipes) {
      const score = r.ingredienti.filter(i => config.menuOptions.availableIngredients!.includes(i)).length;
      if (score > bestScore) {
        best = r;
        bestScore = score;
      }
    }
    return best || recipes[0] || null;
  }

  // User preference filter (optional)
  function applyPreferences(recipes: Recipe[]): Recipe[] {
    let filtered = recipes;
    if (config.menuOptions.avoidedRecipes && config.menuOptions.avoidedRecipes.length > 0) {
      filtered = filtered.filter(r => !config.menuOptions.avoidedRecipes!.includes(r.id));
    }
    if (config.menuOptions.preferredRecipes && config.menuOptions.preferredRecipes.length > 0) {
      // Prioritize preferred recipes by moving them to the front
      const preferred = filtered.filter(r => config.menuOptions.preferredRecipes!.includes(r.id));
      const others = filtered.filter(r => !config.menuOptions.preferredRecipes!.includes(r.id));
      filtered = [...preferred, ...others];
    }
    return filtered;
  }

  const canUseRecipe = (recipe: Recipe, mealType: string) => {
    if (!recipe || usedThisWeek.has(recipe.id) || recentlyUsed.has(recipe.id)) return false;
    if (recipe.tipo && recipe.tipo !== mealType) return false;
    if (useQuotas && weeklyQuotas && weeklyQuotas[recipe.categoria || ''] <= 0) return false;
    return true;
  };

  // Optimize getAvailableRecipes to avoid repeated filtering
  const getAvailableRecipes = (() => {
    const filterCache = new WeakMap<Recipe[], Map<string, Recipe[]>>();
    return (recipes: Recipe[], mealType: string, ignoreQuotas: boolean, usedThisWeek: Set<string>, recentlyUsed: Set<string>, weeklyQuotas: Record<string, number> | undefined, useQuotas: boolean) => {
      const key = `${mealType}|${ignoreQuotas}|${Array.from(usedThisWeek).join(',')}|${Array.from(recentlyUsed).join(',')}`;
      let map = filterCache.get(recipes);
      if (!map) {
        map = new Map();
        filterCache.set(recipes, map);
      }
      if (map.has(key)) return map.get(key)!;
      const filtered = recipes.filter(recipe => {
        if (!ignoreQuotas) {
          if (!recipe || usedThisWeek.has(recipe.id) || recentlyUsed.has(recipe.id)) return false;
          if (recipe.tipo && recipe.tipo !== mealType) return false;
          if (useQuotas && weeklyQuotas && weeklyQuotas[recipe.categoria || ''] <= 0) return false;
          return true;
        }
        return recipe && !usedThisWeek.has(recipe.id) && !recentlyUsed.has(recipe.id) && (!recipe.tipo || recipe.tipo === mealType);
      });
      map.set(key, filtered);
      return filtered;
    };
  })();

  const selectMeal = (mealType: string, dayIndex: number): Recipe | null => {
    if (mealType === 'cena') {
      if (dayIndex === 5) return { id: 'pizza', nome: 'Pizza', tipo: 'cena', ingredienti: [] };
      if (dayIndex === 6) return { id: 'libero', nome: 'Libero', tipo: 'cena', ingredienti: [] };
    }
    let available = getAvailableRecipes(recipes, mealType, false, usedThisWeek, recentlyUsed, weeklyQuotas, useQuotas);
    available = applyPreferences(available);
    if (available.length === 0) available = getAvailableRecipes(recipes, mealType, true, usedThisWeek, recentlyUsed, weeklyQuotas, useQuotas);
    available = applyPreferences(available);
    if (available.length === 0) available = recipes.filter(r => (!r.tipo || r.tipo === mealType) && !recentlyUsed.has(r.id));
    available = applyPreferences(available);
    if (available.length === 0) available = recipes.filter(r => !r.tipo || r.tipo === mealType);
    available = applyPreferences(available);
    if (available.length === 0) return null;
    // Ingredient-based planning if enabled
    if (config.menuOptions.enableIngredientPlanning) {
      const optimized = ingredientOptimized(available);
      if (optimized) {
        usedThisWeek.add(optimized.id);
        if (useQuotas && weeklyQuotas && optimized.categoria && weeklyQuotas[optimized.categoria]) weeklyQuotas[optimized.categoria]--;
        return optimized;
      }
    }
    // Use weighted selection if enabled
    let selected: Recipe;
    if (config.menuOptions.useWeightedSelection) {
      selected = weightedRandom(available)!;
    } else {
      selected = available[Math.floor(Math.random() * available.length)];
    }
    usedThisWeek.add(selected.id);
    if (useQuotas && weeklyQuotas && selected.categoria && weeklyQuotas[selected.categoria]) weeklyQuotas[selected.categoria]--;
    return selected;
  };

  // Helper to check if a meal is locked
  function getLockedMeal(type: 'pranzo' | 'cena', day: number): Recipe | null {
    const lockId = config.menuOptions.lockedMeals?.[`${type}-${day}`];
    if (!lockId) return null;
    return recipes.find(r => r.id === lockId) || null;
  }

  const allMealSlots = [] as { type: 'pranzo' | 'cena'; day: number }[];
  for (let i = 0; i < 7; i++) {
    allMealSlots.push({ type: 'pranzo', day: i });
    allMealSlots.push({ type: 'cena', day: i });
  }
  for (let i = allMealSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allMealSlots[i], allMealSlots[j]] = [allMealSlots[j], allMealSlots[i]];
  }
  allMealSlots.forEach(slot => {
    // Check for locked meal
    const locked = getLockedMeal(slot.type, slot.day);
    if (locked) {
      menu[slot.type][slot.day] = locked;
      usedThisWeek.add(locked.id);
      if (useQuotas && weeklyQuotas && locked.categoria && weeklyQuotas[locked.categoria]) weeklyQuotas[locked.categoria]--;
      return;
    }
    const meal = selectMeal(slot.type, slot.day);
    if (slot.type === 'pranzo') menu.pranzo[slot.day] = meal;
    else menu.cena[slot.day] = meal;
  });
  menuCache.set(cacheKey, menu);
  return menu;
}

export function formatMenu(menu: Menu): string {
  const daysOfWeek = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
  let formattedMenu = 'Menù settimanale:\n\n';
  for (let i = 0; i < 7; i++) {
    formattedMenu += `${daysOfWeek[i]}:\n`;
    formattedMenu += `  Pranzo: ${menu.pranzo[i]?.nome || 'Non disponibile'}\n`;
    formattedMenu += `  Cena: ${menu.cena[i]?.nome || 'Non disponibile'}\n\n`;
  }
  return formattedMenu;
}

export function generateShoppingList(menu: Menu, recipes: Recipe[]): string[] {
  const shoppingList = new Set<string>();
  const allMeals = [...menu.pranzo, ...menu.cena];
  allMeals.forEach((meal) => {
    if (meal && meal.id) {
      const recipe = recipes.find((r) => r.id === meal.id);
      if (recipe && recipe.ingredienti) {
        recipe.ingredienti.forEach((ingredient) => shoppingList.add(ingredient));
      }
    }
  });
  return Array.from(shoppingList);
}

export function generateHtmlEmail(menu: Menu, recipes: Recipe[]): string {
  const daysOfWeek = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
  const menuHtml = daysOfWeek.map((day, i) => `
    <div class="menu-day">
      <strong>${day}</strong>
      <div class="meal"><span class="meal-type">Pranzo:</span> ${menu.pranzo[i]?.nome || 'Non disponibile'}</div>
      <div class="meal"><span class="meal-type">Cena:</span> ${menu.cena[i]?.nome || 'Non disponibile'}</div>
    </div>
  `).join('');
  const shoppingList = generateShoppingList(menu, recipes);
  const shoppingListHtml = `<ul>${shoppingList.map(item => `<li>${item}</li>`).join('')}</ul>`;
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menu Settimanale</title>
      <style>
        body { font-family: 'Arial', sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        h1, h2 { color: #333; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        h1 { font-size: 28px; margin-bottom: 30px; }
        h2 { font-size: 22px; margin: 20px 0; }
        .menu { margin-bottom: 30px; }
        .menu-day { background-color: #f0f8ff; border-left: 4px solid #0073e6; margin: 15px 0; padding: 15px; border-radius: 8px; }
        .menu-day strong { color: #00509e; font-size: 18px; display: block; margin-bottom: 10px; }
        .meal { margin: 8px 0; font-size: 15px; color: #444; }
        .meal-type { font-weight: 600; color: #0073e6; display: inline-block; width: 65px; }
        .shopping-list-container { background-color: #e7f5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0073e6; margin-top: 30px; }
        .shopping-list { list-style-type: none; padding: 0; margin: 10px 0; }
        .shopping-list li { background: #fff; padding: 12px 15px; border: 1px solid #ddd; margin: 8px 0; border-radius: 4px; font-size: 15px; color: #333; }
        .footer { text-align: center; font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Menu Settimanale</h1>
        <div class="menu">${menuHtml}</div>
        <div class="shopping-list-container">
          <h2>Lista della Spesa</h2>
          ${shoppingListHtml}
        </div>
        <div class="footer"><p>Buon appetito!</p></div>
      </div>
    </body>
    </html>
  `;
}

// Analytics/statistics utilities
export function getRecipeUsageStats(history: Menu[]): Record<string, number> {
  const usage: Record<string, number> = {};
  history.forEach(menu => {
    [...menu.pranzo, ...menu.cena].forEach(r => {
      if (r && r.id) usage[r.id] = (usage[r.id] || 0) + 1;
    });
  });
  return usage;
}

export function getCategoryStats(history: Menu[], recipes: Recipe[]): Record<string, number> {
  const usage: Record<string, number> = {};
  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]));
  history.forEach(menu => {
    [...menu.pranzo, ...menu.cena].forEach(r => {
      if (r && r.id) {
        const cat = recipeMap[r.id]?.categoria || 'unknown';
        usage[cat] = (usage[cat] || 0) + 1;
      }
    });
  });
  return usage;
}
