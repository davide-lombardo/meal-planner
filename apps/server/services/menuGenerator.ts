import { Recipe, Menu, Config } from 'shared/schemas';
import { getSeasonalRecipes, getCurrentSeason } from './seasonalManager';


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

  const canUseRecipe = (recipe: Recipe, mealType: string) => {
    if (!recipe || usedThisWeek.has(recipe.id) || recentlyUsed.has(recipe.id)) return false;
    if (recipe.tipo && recipe.tipo !== mealType) return false;
    if (useQuotas && weeklyQuotas && weeklyQuotas[recipe.categoria || ''] <= 0) return false;
    return true;
  };

  const getAvailableRecipes = (mealType: string, ignoreQuotas = false) => {
    // First apply seasonal filtering
    let filteredRecipes = getSeasonalRecipes(recipes, currentSeason, enableSeasonalFiltering);

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

// Export everything we need from other modules
export { generateShoppingList } from './shoppingListGenerator';
export { generateHtmlEmail } from './emailFormatter';