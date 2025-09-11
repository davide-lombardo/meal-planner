import { Recipe, Menu, Config, Season } from 'shared/schemas';
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

interface MenuGeneratorState {
  usedThisWeek: Set<string>;
  recentlyUsed: Set<string>;
  weeklyQuotas?: Record<string, number>;
  usageCount: Record<string, number>;
}

interface MenuOptions {
  maxWeeks: number;
  useQuotas: boolean;
  enableSeasonalFiltering: boolean;
  useWeightedSelection: boolean;
  currentSeason: Season;
}

function extractMenuOptions(config: Config): MenuOptions {
  return {
    maxWeeks: config.menuOptions.maxRepetitionWeeks || 4,
    useQuotas: config.menuOptions.useQuotas !== false,
    enableSeasonalFiltering: config.menuOptions.enableSeasonalFiltering || false,
    useWeightedSelection: config.menuOptions.useWeightedSelection || false,
    currentSeason: config.menuOptions.currentSeason || getCurrentSeason(),
  };
}

function initializeState(recipes: Recipe[], history: Menu[], options: MenuOptions, config: Config): MenuGeneratorState {
  const recentMenus = history.slice(-options.maxWeeks);
  const recentlyUsed = new Set(
    recentMenus
      .flatMap((menu) => [...menu.pranzo, ...menu.cena].filter((r) => r && r.id).map((r) => r!.id)),
  );

  const usageCount: Record<string, number> = {};
  if (options.useWeightedSelection) {
    for (const menu of recentMenus) {
      for (const r of [...menu.pranzo, ...menu.cena]) {
        if (r && r.id) usageCount[r.id] = (usageCount[r.id] || 0) + 1;
      }
    }
  }

  return {
    usedThisWeek: new Set<string>(),
    recentlyUsed,
    weeklyQuotas: options.useQuotas ? { ...config.menuOptions.mealTypeQuotas } : undefined,
    usageCount,
  };
}

function canUseRecipe(
  recipe: Recipe, 
  mealType: string, 
  state: MenuGeneratorState, 
  options: MenuOptions,
  ignoreQuotas = false,
  ignoreHistory = false
): boolean {
  if (!recipe || state.usedThisWeek.has(recipe.id)) return false;
  if (!ignoreHistory && state.recentlyUsed.has(recipe.id)) return false;
  if (recipe.tipo && recipe.tipo !== mealType) return false;
  if (!ignoreQuotas && options.useQuotas && state.weeklyQuotas && state.weeklyQuotas[recipe.categoria || ''] <= 0) return false;
  return true;
}


function getFilteredRecipes(
  recipes: Recipe[],
  mealType: string,
  state: MenuGeneratorState,
  options: MenuOptions,
  ignoreQuotas = false,
  ignoreHistory = false,
  ignoreSeasonality = false
): Recipe[] {
  // Apply seasonal filtering unless ignored
  let filteredRecipes = ignoreSeasonality 
    ? recipes 
    : getSeasonalRecipes(recipes, options.currentSeason, options.enableSeasonalFiltering);

  return filteredRecipes.filter((recipe) => 
    canUseRecipe(recipe, mealType, state, options, ignoreQuotas, ignoreHistory)
  );
}

function selectWeightedRecipe(recipes: Recipe[], usageCount: Record<string, number>): Recipe {
  if (recipes.length === 1) return recipes[0];

  const weights = recipes.map(r => 1 / ((usageCount[r.id] || 0) + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rnd = Math.random() * totalWeight;
  
  for (let i = 0; i < recipes.length; i++) {
    rnd -= weights[i];
    if (rnd <= 0) {
      return recipes[i];
    }
  }
  
  return recipes[recipes.length - 1];
}

function selectRandomRecipe(recipes: Recipe[]): Recipe {
  return recipes[Math.floor(Math.random() * recipes.length)];
}

function selectMealWithFallbacks(
  allRecipes: Recipe[],
  mealType: string,
  dayIndex: number,
  state: MenuGeneratorState,
  options: MenuOptions
): Recipe | null {
  // Special cases for weekend dinners
  if (mealType === 'cena') {
    if (dayIndex === 5) return { id: 'pizza', nome: 'Pizza', tipo: 'cena', ingredienti: [] };
    if (dayIndex === 6) return { id: 'libero', nome: 'Libero', tipo: 'cena', ingredienti: [] };
  }

  // Try different fallback strategies in order
  const fallbackStrategies = [
    () => getFilteredRecipes(allRecipes, mealType, state, options), // All rules
    () => getFilteredRecipes(allRecipes, mealType, state, options, true), // Ignore quotas
    () => getFilteredRecipes(allRecipes, mealType, state, options, true, false, true), // Ignore quotas + seasonality
    () => getFilteredRecipes(allRecipes, mealType, state, options, true, true, true), // Ignore everything except duplicates
  ];

  for (const getAvailable of fallbackStrategies) {
    const available = getAvailable();
    if (available.length === 0) continue;

    const selected = options.useWeightedSelection 
      ? selectWeightedRecipe(available, state.usageCount)
      : selectRandomRecipe(available);

    // Update state
    state.usedThisWeek.add(selected.id);
    if (options.useQuotas && state.weeklyQuotas && selected.categoria && state.weeklyQuotas[selected.categoria]) {
      state.weeklyQuotas[selected.categoria]--;
    }

    return selected;
  }

  return null;
}

function createMealSlots(): { type: 'pranzo' | 'cena'; day: number }[] {
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

  return allMealSlots;
}

export function generateMenu(recipes: Recipe[], history: Menu[] = [], config: Config): Menu {
  const menu: Menu = { pranzo: [], cena: [] };
  const options = extractMenuOptions(config);
  const state = initializeState(recipes, history, options, config);
  const mealSlots = createMealSlots();

  mealSlots.forEach((slot) => {
    const meal = selectMealWithFallbacks(recipes, slot.type, slot.day, state, options);
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


export { generateShoppingList } from './shoppingListGenerator';
export { generateHtmlEmail } from './emailFormatter';