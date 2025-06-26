import { describe, it, expect } from 'vitest';
import { generateMenu, formatMenu, generateShoppingList, generateHtmlEmail, Recipe, Menu, Config } from '../src/utils/menuGenerator';

const sampleRecipes: Recipe[] = [
  { id: '1', nome: 'Pasta', categoria: 'carne', tipo: 'pranzo', ingredienti: ['pasta', 'pomodoro'] },
  { id: '2', nome: 'Insalata', categoria: 'verdura', tipo: 'cena', ingredienti: ['insalata', 'olio'] },
  { id: '3', nome: 'Frittata', categoria: 'uova', tipo: 'cena', ingredienti: ['uova', 'cipolla'] },
];
const sampleConfig: Config = {
  menuOptions: {
    maxRepetitionWeeks: 1,
    useQuotas: false,
    mealTypeQuotas: { carne: 2, verdura: 2, uova: 2 },
  },
};

describe('menuGenerator', () => {
  it('generates a menu with correct structure', () => {
    const menu = generateMenu(sampleRecipes, [], sampleConfig);
    expect(menu).toHaveProperty('pranzo');
    expect(menu).toHaveProperty('cena');
    expect(menu.pranzo.length).toBe(7);
    expect(menu.cena.length).toBe(7);
  });

  it('formats menu as string', () => {
    const menu = generateMenu(sampleRecipes, [], sampleConfig);
    const formatted = formatMenu(menu);
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/Menù settimanale/);
  });

  it('generates a shopping list', () => {
    const menu = generateMenu(sampleRecipes, [], sampleConfig);
    const list = generateShoppingList(menu, sampleRecipes);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('generates HTML email', () => {
    const menu = generateMenu(sampleRecipes, [], sampleConfig);
    const html = generateHtmlEmail(menu, sampleRecipes);
    expect(typeof html).toBe('string');
    expect(html).toMatch(/<html/);
    expect(html).toMatch(/Menu Settimanale/);
  });
});
