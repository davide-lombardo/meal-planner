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
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const fetchRecipes = useCallback(async (forceRefresh = false, customPage?: number, customPageSize?: number, customSearch?: string, customType?: string, customCategory?: string) => {
    const currentPage = customPage ?? page;
    const currentPageSize = customPageSize ?? pageSize;
    const currentSearch = customSearch ?? search;
    const currentType = customType ?? type;
    const currentCategory = customCategory ?? category;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(currentPageSize),
      });
      if (currentSearch) params.append('search', currentSearch);
      if (currentType) params.append('type', currentType);
      if (currentCategory) params.append('category', currentCategory);
      const response = await fetch(`${CONFIG.API_BASE_URL}/recipes?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }
      const data = await response.json();
      setRecipes(data.recipes);
      setTotal(data.total);
      // Optionally cache only the first page
      if (currentPage === 1 && !forceRefresh && !currentSearch && !currentType && !currentCategory) {
        recipeCache.set(RECIPES_CACHE_KEY, data.recipes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Fetch recipes error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, type, category]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes, page, pageSize, search, type, category]);
  // Filter setters
  const setFilters = useCallback((newSearch: string, newType: string, newCategory: string) => {
    setSearch(newSearch);
    setType(newType);
    setCategory(newCategory);
    setPage(1); // Reset to first page on filter change
  }, []);

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

  // Pagination controls
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  return {
    recipes,
    total,
    page,
    pageSize,
    loading,
    error,
    fetchRecipes,
  setFilters,
  search,
  type,
  category,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    invalidateCache,
    goToPage,
    changePageSize
  };
}
