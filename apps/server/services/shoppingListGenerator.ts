import { Menu, Recipe } from 'shared/schemas';
import { ParsedIngredient, parseIngredient, combineIngredients, normalizeIngredientName, formatIngredient, PANTRY_STAPLES } from './ingredientParser';

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
  // Use a map with normalized name+unit as key for grouping
  const ingredientMap = new Map<string, ParsedIngredient>();
  const allMeals = [...menu.pranzo, ...menu.cena];

  allMeals.forEach((meal) => {
    if (meal && meal.id) {
      const recipe = recipes.find((r) => r.id === meal.id);
      if (recipe && recipe.ingredienti) {
        recipe.ingredienti.forEach((ingredientText: string) => {
          const parsed = parseIngredient(ingredientText);
          // Use normalized name for grouping similar items
          const normName = normalizeIngredientName(parsed.name);
          const key = `${normName}-${parsed.unit}`;
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            ingredientMap.set(key, combineIngredients(existing, parsed));
          } else {
            // Also normalize the name for display
            ingredientMap.set(key, { ...parsed, name: normName });
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

export function formatShoppingListForTelegram(categorizedList: Map<string, ParsedIngredient[]>): string {
  const categoryOrder = ['Frutta e Verdura', 'Carne e Pesce', 'Latticini', 'Dispensa', 'Altro'];
  let groceryText = 'Lista della spesa:\n';
  
  for (const category of categoryOrder) {
    if (categorizedList.has(category)) {
      groceryText += `\n${category}:\n`;
      for (const ing of categorizedList.get(category)!) {
        groceryText += `- ${ing.name}`;
        if (ing.quantity) groceryText += ` (${ing.quantity}${ing.unit})`;
        groceryText += '\n';
      }
    }
  }
  
  return groceryText;
}