import { useState, useEffect, useCallback } from 'react';
import { Recipe } from 'shared/schemas';
import { DataCache } from '../utils/dataCache';
import { CONFIG } from '../utils/constants';

// Create a cache instance that lives across component renders
const recipeCache = new DataCache<Recipe[]>(15); // 15 minutes TTL
const RECIPES_CACHE_KEY = 'all-recipes';

/**
 * A custom hook for managing recipes with caching
 */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      // Try to get from cache first
      const cachedRecipes = recipeCache.get(RECIPES_CACHE_KEY);
      if (cachedRecipes) {
        setRecipes(cachedRecipes);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/recipes`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }
      
      const data = await response.json();
      setRecipes(data);
      
      // Update cache
      recipeCache.set(RECIPES_CACHE_KEY, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Fetch recipes error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);
  
  // Function to add a new recipe to the state and cache
  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => {
      const updated = [recipe, ...prev];
      recipeCache.set(RECIPES_CACHE_KEY, updated);
      return updated;
    });
  }, []);
  
  // Function to update a recipe in the state and cache
  const updateRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => {
      const updated = prev.map(r => r.id === recipe.id ? recipe : r);
      recipeCache.set(RECIPES_CACHE_KEY, updated);
      return updated;
    });
  }, []);
  
  // Function to delete a recipe from the state and cache
  const deleteRecipe = useCallback((recipeId: string) => {
    setRecipes(prev => {
      const updated = prev.filter(r => r.id !== recipeId);
      recipeCache.set(RECIPES_CACHE_KEY, updated);
      return updated;
    });
  }, []);
  
  // Function to invalidate cache
  const invalidateCache = useCallback(() => {
    recipeCache.remove(RECIPES_CACHE_KEY);
  }, []);

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    invalidateCache
  };
}
