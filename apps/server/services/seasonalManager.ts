import { Recipe } from 'shared/schemas';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

// Helper function to get current season
export const getCurrentSeason = (): Season => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

export const getSeasonalRecipes = (
  allRecipes: Recipe[], 
  currentSeason: Season, 
  enableSeasonalFiltering: boolean
): Recipe[] => {
  if (!enableSeasonalFiltering) return allRecipes;

  return allRecipes.filter((recipe) => {
    // If recipe has no seasons defined, include it (backwards compatibility)
    if (!recipe.stagioni || recipe.stagioni.length === 0) return true;

    // Check if current season is in the recipe's allowed seasons
    return recipe.stagioni.includes(currentSeason);
  });
};