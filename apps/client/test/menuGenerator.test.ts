import { describe, it, expect } from 'vitest';
import { generateMenu, formatMenu, generateShoppingList, generateHtmlEmail, Recipe, Menu, Config, getRecipeUsageStats, getCategoryStats } from '../src/utils/menuGenerator';

const sampleRecipes: Recipe[] = [
  { id: '1', nome: 'Pasta', categoria: 'carne', tipo: 'pranzo', ingredienti: ['pasta', 'pomodoro'] },
  { id: '2', nome: 'Insalata', categoria: 'verdura', tipo: 'cena', ingredienti: ['insalata', 'olio'] },
  { id: '3', nome: 'Frittata', categoria: 'uova', tipo: 'cena', ingredienti: ['uova', 'cipolla'] },
];
const baseConfig: Config = {
  menuOptions: {
    maxRepetitionWeeks: 1,
    useQuotas: false,
    mealTypeQuotas: { carne: 2, verdura: 2, uova: 2 },
  },
};

describe('menuGenerator', () => {
  it('generates a menu with correct structure', () => {
    const menu = generateMenu(sampleRecipes, [], baseConfig);
    expect(menu).toHaveProperty('pranzo');
    expect(menu).toHaveProperty('cena');
    expect(menu.pranzo.length).toBe(7);
    expect(menu.cena.length).toBe(7);
  });

  it('formats menu as string', () => {
    const menu = generateMenu(sampleRecipes, [], baseConfig);
    const formatted = formatMenu(menu);
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/Menù settimanale/);
  });

  it('generates a shopping list', () => {
    const menu = generateMenu(sampleRecipes, [], baseConfig);
    const list = generateShoppingList(menu, sampleRecipes);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('generates HTML email', () => {
    const menu = generateMenu(sampleRecipes, [], baseConfig);
    const html = generateHtmlEmail(menu, sampleRecipes);
    expect(typeof html).toBe('string');
    expect(html).toMatch(/<html/);
    expect(html).toMatch(/Menu Settimanale/);
  });

  it('respects lockedMeals', () => {
    const config: Config = {
      ...baseConfig,
      menuOptions: {
        ...baseConfig.menuOptions,
        lockedMeals: { 'pranzo-0': '1' },
      },
    };
    const menu = generateMenu(sampleRecipes, [], config);
    expect(menu.pranzo[0]?.id).toBe('1');
  });

  it('prioritizes preferredRecipes and avoids avoidedRecipes', () => {
    const config: Config = {
      ...baseConfig,
      menuOptions: {
        ...baseConfig.menuOptions,
        preferredRecipes: ['2'],
        avoidedRecipes: ['1'],
      },
    };
    const menu = generateMenu(sampleRecipes, [], config);
    expect(menu.pranzo.concat(menu.cena).some(r => r?.id === '2')).toBe(true);
    expect(menu.pranzo.concat(menu.cena).every(r => r?.id !== '1')).toBe(true);
  });

  it('uses ingredient-based planning', () => {
    const config: Config = {
      ...baseConfig,
      menuOptions: {
        ...baseConfig.menuOptions,
        enableIngredientPlanning: true,
        availableIngredients: ['pasta', 'pomodoro'],
      },
    };
    const menu = generateMenu(sampleRecipes, [], config);
    expect(menu.pranzo.concat(menu.cena).some(r => r?.ingredienti.includes('pasta'))).toBe(true);
  });

  it('uses weighted selection', () => {
    const config: Config = {
      ...baseConfig,
      menuOptions: {
        ...baseConfig.menuOptions,
        useWeightedSelection: true,
      },
    };
    // Simulate history where '1' was used a lot
    const history: Menu[] = Array(3).fill({ pranzo: [{...sampleRecipes[0]}, null, null, null, null, null, null], cena: [null, null, null, null, null, null, null] });
    const menu = generateMenu(sampleRecipes, history, config);
    // Should prefer recipes not overused in history
    expect(menu.pranzo.concat(menu.cena).some(r => r?.id !== '1')).toBe(true);
  });

  it('caches menu results for same constraints', () => {
    const menu1 = generateMenu(sampleRecipes, [], baseConfig);
    const menu2 = generateMenu(sampleRecipes, [], baseConfig);
    expect(menu1).toBe(menu2); // Should be the same object from cache
  });

  it('provides recipe and category usage stats', () => {
    const history: Menu[] = [
      { pranzo: [sampleRecipes[0], sampleRecipes[1], null, null, null, null, null], cena: [sampleRecipes[2], null, null, null, null, null, null] },
    ];
    const recipeStats = getRecipeUsageStats(history);
    const catStats = getCategoryStats(history, sampleRecipes);
    expect(recipeStats['1']).toBe(1);
    expect(catStats['carne']).toBe(1);
    expect(catStats['uova']).toBe(1);
  });
});
