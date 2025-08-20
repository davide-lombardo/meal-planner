import { Menu, Recipe } from 'shared/schemas';
import { generateShoppingList } from './shoppingListGenerator';
import { formatIngredient, PANTRY_STAPLES } from './ingredientParser';

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
  const categoryOrder = ['Frutta e Verdura', 'Carne e Pesce', 'Latticini', 'Dispensa', 'Varie'];

  const categoryIcons: Record<string, string> = {
    'Frutta e Verdura': '🥬',
    'Carne e Pesce': '🍖',
    Latticini: '🥛',
    Dispensa: '🏪',
    Varie: '📦',
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