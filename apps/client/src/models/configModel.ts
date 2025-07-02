export interface MenuOptions {
  maxRepetitionWeeks?: number;
  useWeightedSelection?: boolean;
  enableIngredientPlanning?: boolean;
  availableIngredients?: string[];
  useQuotas?: boolean;
  mealTypeQuotas?: Record<string, number>;
  preferredRecipes?: string[];
  avoidedRecipes?: string[];
  enableSeasonalFiltering?: boolean;
  currentSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface Config {
  menuOptions: MenuOptions;
  [key: string]: any;
}