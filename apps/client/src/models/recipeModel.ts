
interface BaseRecipe {
  id: string;
  nome: string;
  categoria?: Category;
  tipo?: RecipeType;
  ingredienti?: string[];
  stagioni?: Season[];
  link?: string;
  timestamp?: number;
}

export interface Recipe extends BaseRecipe {
  ingredienti: string[];
};

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Category = 'pesce' | 'carne' | 'formaggio' | 'uova';
export type RecipeType = 'pranzo' | 'cena';
