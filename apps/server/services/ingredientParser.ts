export type ParsedIngredient = {
  name: string;
  quantity: number;
  unit: string;
  originalText: string;
  category: string;
};

// Enhanced keyword-based categorization with synonyms and plural/singular normalization
const INGREDIENT_KEYWORDS: Record<string, string> = {
  // Frutta e Verdura
  pomodoro: 'Frutta e Verdura', pomodori: 'Frutta e Verdura',
  cipolla: 'Frutta e Verdura', cipolle: 'Frutta e Verdura', cipollotto: 'Frutta e Verdura',
  aglio: 'Frutta e Verdura',
  basilico: 'Frutta e Verdura',
  prezzemolo: 'Frutta e Verdura',
  limone: 'Frutta e Verdura', limoni: 'Frutta e Verdura',
  patata: 'Frutta e Verdura', patate: 'Frutta e Verdura',
  carota: 'Frutta e Verdura', carote: 'Frutta e Verdura',
  zucchina: 'Frutta e Verdura', zucchine: 'Frutta e Verdura',
  melanzana: 'Frutta e Verdura', melanzane: 'Frutta e Verdura',
  peperone: 'Frutta e Verdura', peperoni: 'Frutta e Verdura',
  insalata: 'Frutta e Verdura',
  spinaci: 'Frutta e Verdura',
  verza: 'Frutta e Verdura',
  scalogno: 'Frutta e Verdura',
  sedano: 'Frutta e Verdura',
  finocchio: 'Frutta e Verdura',
  timo: 'Frutta e Verdura',
  alloro: 'Frutta e Verdura',
  rosmarino: 'Frutta e Verdura',
  salvia: 'Frutta e Verdura',
  lime: 'Frutta e Verdura',
  mela: 'Frutta e Verdura', mele: 'Frutta e Verdura',

  // Carne e Pesce
  pollo: 'Carne e Pesce', "petto di pollo": 'Carne e Pesce',
  manzo: 'Carne e Pesce',
  maiale: 'Carne e Pesce', "lonza di maiale": 'Carne e Pesce', "macinato di suino": 'Carne e Pesce', "pulled pork": 'Carne e Pesce',
  salmone: 'Carne e Pesce',
  tonno: 'Carne e Pesce',
  gamber: 'Carne e Pesce', "mazzancolle": 'Carne e Pesce',
  prosciutto: 'Carne e Pesce',
  pancetta: 'Carne e Pesce',

  // Latticini
  latte: 'Latticini', "latte di cocco": 'Latticini',
  burro: 'Latticini',
  parmigiano: 'Latticini', "grana padano": 'Latticini', "formaggio grattugiato": 'Latticini', "gorgonzola": 'Latticini', "burrata": 'Latticini', "mozzarella": 'Latticini', "mozzarella di bufala": 'Latticini',
  ricotta: 'Latticini',
  yogurt: 'Latticini', "yogurt bianco": 'Latticini',
  uovo: 'Latticini', uova: 'Latticini',

  // Dispensa
  pasta: 'Dispensa', "orecchiette": 'Dispensa', "strozzapreti": 'Dispensa', "chicche di patate": 'Dispensa',
  riso: 'Dispensa', "riso basmati": 'Dispensa',
  farina: 'Dispensa', maizena: 'Dispensa', panko: 'Dispensa', pangrattato: 'Dispensa',
  olio: 'Dispensa', "olio extravergine": 'Dispensa',
  aceto: 'Dispensa',
  sale: 'Dispensa',
  pepe: 'Dispensa', "pepe nero": 'Dispensa',
  zucchero: 'Dispensa',
  passata: 'Dispensa', "pomodori secchi": 'Dispensa', "conserva": 'Dispensa', "brodo granulare": 'Dispensa', "legumi": 'Dispensa', "lenticchie": 'Dispensa', "ceci": 'Dispensa',
  pane: 'Dispensa', "torillias": 'Dispensa', "couscous perlato": 'Dispensa', "pinoli": 'Dispensa', "mandorle": 'Dispensa', "noci": 'Dispensa', "senape": 'Dispensa', "pasta di miso": 'Dispensa', "curry": 'Dispensa', "origano": 'Dispensa', "zenzero": 'Dispensa',
};

// Common pantry items that most people have
export const PANTRY_STAPLES = new Set([
  'sale',
  'pepe',
  'pepe nero',
  'olio extravergine',
  'olio',
  'aceto',
  'zucchero',
]);

// Normalize ingredient names for grouping (singular/plural, accents, etc.)
export function normalizeIngredientName(name: string): string {
  let n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  n = n.replace(/\bdi\b|\bdorate?\b|\bgialle?\b|\btropicali\b|\bperlato\b|\bgrattugiato\b|\bbianchi?\b|\bbianco\b|\brosso\b|\brosse?\b|\bsecchi?\b|\bgranulare\b|\bcrema\b|\bcon\b|\ball\b|\balle?\b|\bai\b|\bin\b|\be\b|\bed\b|\bde\b|\bdella?\b|\bdelle?\b|\bdel\b|\bda\b|\bper\b|\bsu\b|\btra\b|\bfra\b|\bdi\b|\bcon\b|\bsenza\b|\buna?\b|\bun\b|\bun'\b|\bdue\b|\btre\b|\bquattro\b|\bcinque\b|\bmezzo\b|\bmezzi\b|\bmezze\b|\bmezzo\b|\bmezzi\b|\bmezze\b|\bmezzo\b|\bmezzi\b|\bmezze\b/gi, '');
  n = n.replace(/\s{2,}/g, ' ').trim();
  // Singularize simple plurals
  if (n.endsWith('i') && n.length > 3) n = n.slice(0, -1) + 'o';
  if (n.endsWith('e') && n.length > 3) n = n.slice(0, -1) + 'a';
  return n;
}

function getIngredientCategory(ingredient: string): string {
  const normalized = normalizeIngredientName(ingredient);
  for (const [keyword, category] of Object.entries(INGREDIENT_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }
  return 'Varie';
}

/**
 * Parse ingredient text to extract quantity, unit, and name
 * Examples: "200g pasta" -> {quantity: 200, unit: "g", name: "pasta"}
 */
export function parseIngredient(ingredient: string): ParsedIngredient {
  const normalized = ingredient.toLowerCase().trim();

  // Regex to match quantity and unit patterns
  const patterns = [
    /^(\d+(?:[.,]\d+)?)\s*(g|gr|grammi?|kg|chilogram[mi]?)\s+(.+)$/,
    /^(\d+(?:[.,]\d+)?)\s*(ml|l|litri?)\s+(.+)$/,
    /^(\d+)\s*(pezzi?|pz|n°|numero)\s+(.+)$/,
    /^(\d+)\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const quantity = parseFloat(match[1].replace(',', '.'));
      const unit = match[2] || 'pz';
      const name = match[3] || match[2];

      return {
        name: name.trim(),
        quantity,
        unit: normalizeUnit(unit),
        originalText: ingredient,
        category: getIngredientCategory(name.trim()),
      };
    }
  }

  // No quantity found, treat as single item
  return {
    name: normalized,
    quantity: 1,
    unit: 'pz',
    originalText: ingredient,
    category: getIngredientCategory(normalized),
  };
}

/**
 * Normalize units to standard forms
 */
function normalizeUnit(unit: string): string {
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
 * Check if ingredients can be combined (same name and compatible units)
 */
export function canCombineIngredients(a: ParsedIngredient, b: ParsedIngredient): boolean {
  return a.name === b.name && a.unit === b.unit;
}

/**
 * Combine two ingredients with same name and unit
 */
export function combineIngredients(a: ParsedIngredient, b: ParsedIngredient): ParsedIngredient {
  return {
    ...a,
    quantity: a.quantity + b.quantity,
    originalText: `${a.originalText}, ${b.originalText}`,
  };
}

/**
 * Format ingredient for display
 */
export function formatIngredient(
  ingredient: ParsedIngredient,
  includePantryNote: boolean = false,
): string {
  const isPantryStaple = PANTRY_STAPLES.has(ingredient.name);

  let formatted = '';
  if (ingredient.quantity === 1 && ingredient.unit === 'pz') {
    formatted = ingredient.name;
  } else {
    formatted = `${ingredient.quantity}${ingredient.unit} ${ingredient.name}`;
  }

  if (includePantryNote && isPantryStaple) {
    formatted += ' (probabilmente già in casa)';
  }

  return formatted;
}