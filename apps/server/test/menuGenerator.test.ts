import { describe, it, expect } from 'vitest';
import { generateMenu, formatMenu, generateHtmlEmail, generateShoppingList, Recipe, Menu, Config } from '@meal-planner/shared';

describe('menuGenerator', () => {
  const recipes: Recipe[] = [
    { id: 'r1', nome: 'Pasta', tipo: 'pranzo', categoria: 'carne', ingredienti: ['pasta', 'pomodoro'] },
    { id: 'r2', nome: 'Insalata', tipo: 'cena', categoria: 'legumi', ingredienti: ['lattuga', 'ceci'] },
    { id: 'r3', nome: 'Frittata', tipo: 'pranzo', categoria: 'uova', ingredienti: ['uova', 'formaggio'] },
  ];
  const config: Config = {
    menuOptions: {
      maxRepetitionWeeks: 1,
      useQuotas: true,
      mealTypeQuotas: { carne: 1, legumi: 1, uova: 1 },
    },
  };

  it('should generate a menu with no repeated recipes in the same week', () => {
    const menu = generateMenu(recipes, [], config);
    const allIds = [...menu.pranzo, ...menu.cena].filter(Boolean).map(r => r!.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('should format the menu as a string', () => {
    const menu: Menu = { pranzo: [recipes[0], null, null, null, null, null, null], cena: [null, recipes[1], null, null, null, null, null] };
    const formatted = formatMenu(menu);
    expect(formatted).toContain('Pasta');
    expect(formatted).toContain('Insalata');
  });

  it('should generate a shopping list from the menu', () => {
    const menu: Menu = { pranzo: [recipes[0], recipes[2], null, null, null, null, null], cena: [recipes[1], null, null, null, null, null, null] };
    const list = generateShoppingList(menu, recipes);
    expect(list).toContain('pasta');
    expect(list).toContain('ceci');
    expect(list).toContain('uova');
  });

  it('should generate HTML email with menu and shopping list', () => {
    const menu: Menu = { pranzo: [recipes[0], null, null, null, null, null, null], cena: [null, recipes[1], null, null, null, null, null] };
    const html = generateHtmlEmail(menu, recipes);
    expect(html).toContain('<html');
    expect(html).toContain('Pasta');
    expect(html).toContain('Insalata');
    expect(html).toContain('Lista della Spesa');
  });
});
