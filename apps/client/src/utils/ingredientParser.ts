/**
 * Utility for parsing and formatting ingredient strings
 */

/**
 * Parse ingredient text to extract quantity, unit, and name
 * @param ingredient Raw ingredient text
 * @returns Parsed ingredient object or null if not parseable
 */
export function parseIngredient(ingredient: string) {
  const trimmed = ingredient.trim();
  if (!trimmed) return null;
  
  // Regex to match common quantity and unit patterns
  const patterns = [
    // Format: "200g pasta"
    /^(\d+(?:[.,]\d+)?)\s*(g|gr|grammi?|kg|chilogram[mi]?)\s+(.+)$/,
    // Format: "200ml milk"
    /^(\d+(?:[.,]\d+)?)\s*(ml|l|litri?)\s+(.+)$/,
    // Format: "2 pezzi pomodori"
    /^(\d+)\s*(pezzi?|pz|n°|numero)\s+(.+)$/,
    // Format: "2 pomodori"
    /^(\d+)\s+(.+)$/,
    // Format: "sale e pepe q.b." (just the name)
    /^(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      // Last pattern is just the name
      if (pattern === patterns[patterns.length - 1]) {
        return {
          quantity: null,
          unit: null,
          name: match[1].trim(),
          original: trimmed
        };
      }
      
      // Other patterns
      const quantity = match[1] ? parseFloat(match[1].replace(',', '.')) : null;
      const unit = match[2] || null;
      const name = match[3] || match[2];

      return {
        quantity,
        unit: normalizeUnit(unit),
        name: name.trim(),
        original: trimmed
      };
    }
  }

  // Default: just return the name
  return {
    quantity: null,
    unit: null,
    name: trimmed,
    original: trimmed
  };
}

/**
 * Normalize measurement units
 * @param unit Raw unit string
 * @returns Normalized unit string
 */
function normalizeUnit(unit: string | null): string | null {
  if (!unit) return null;
  
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
 * Format a parsed ingredient back to a readable string
 */
export function formatIngredient(ingredient: {
  quantity: number | null;
  unit: string | null;
  name: string;
}) {
  if (ingredient.quantity === null || ingredient.unit === null) {
    return ingredient.name;
  }
  
  return `${ingredient.quantity}${ingredient.unit} ${ingredient.name}`;
}

/**
 * Parse a multi-line ingredient text into an array of ingredients
 */
export function parseIngredientsText(text: string): string[] {
  if (!text) return [];
  
  // Split by newline and/or comma
  return text
    .split(/[\n,]/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}
