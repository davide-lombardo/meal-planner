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
  };
};

export function generateMenu(recipes: Recipe[], history: Menu[] = [], config: Config): Menu {
  const menu: Menu = { pranzo: [], cena: [] };
  const maxWeeks = config.menuOptions.maxRepetitionWeeks || 2;
  const useQuotas = config.menuOptions.useQuotas !== false;
  const weeklyQuotas = useQuotas ? { ...config.menuOptions.mealTypeQuotas } : undefined;
  const usedThisWeek = new Set<string>();
  const recentlyUsed = new Set(
    history.slice(-maxWeeks).flatMap((menu) => [...menu.pranzo, ...menu.cena].filter(r => r && r.id).map(r => r!.id))
  );

  const canUseRecipe = (recipe: Recipe, mealType: string) => {
    if (!recipe || usedThisWeek.has(recipe.id) || recentlyUsed.has(recipe.id)) return false;
    if (recipe.tipo && recipe.tipo !== mealType) return false;
    if (useQuotas && weeklyQuotas && weeklyQuotas[recipe.categoria || ''] <= 0) return false;
    return true;
  };

  const getAvailableRecipes = (mealType: string, ignoreQuotas = false) => {
    return recipes.filter(recipe => {
      if (!ignoreQuotas) return canUseRecipe(recipe, mealType);
      return recipe && !usedThisWeek.has(recipe.id) && !recentlyUsed.has(recipe.id) && (!recipe.tipo || recipe.tipo === mealType);
    });
  };

  const selectMeal = (mealType: string, dayIndex: number): Recipe | null => {
    if (mealType === 'cena') {
      if (dayIndex === 5) return { id: 'pizza', nome: 'Pizza', tipo: 'cena', ingredienti: [] };
      if (dayIndex === 6) return { id: 'libero', nome: 'Libero', tipo: 'cena', ingredienti: [] };
    }
    let available = getAvailableRecipes(mealType);
    if (available.length === 0) available = getAvailableRecipes(mealType, true);
    if (available.length === 0) available = recipes.filter(r => (!r.tipo || r.tipo === mealType) && !recentlyUsed.has(r.id));
    if (available.length === 0) available = recipes.filter(r => !r.tipo || r.tipo === mealType);
    if (available.length === 0) return null;
    const selected = available[Math.floor(Math.random() * available.length)];
    usedThisWeek.add(selected.id);
    if (useQuotas && weeklyQuotas && selected.categoria && weeklyQuotas[selected.categoria]) weeklyQuotas[selected.categoria]--;
    return selected;
  };

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
    const meal = selectMeal(slot.type, slot.day);
    if (slot.type === 'pranzo') menu.pranzo[slot.day] = meal;
    else menu.cena[slot.day] = meal;
  });
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
