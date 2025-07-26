import { useState, useCallback } from 'react';
import { Recipe } from 'shared/schemas';

/**
 * A custom hook for managing recipe creation, updating and deletion
 * 
 * @param apiBaseUrl The base URL for the API
 * @returns Object containing recipe management functions and states
 */
export function useRecipeManagement(apiBaseUrl: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const createRecipe = useCallback(async (recipe: Recipe) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create recipe');
      }

      const newRecipe = await response.json();
      return newRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Create recipe error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const updateRecipe = useCallback(async (recipe: Recipe) => {
    if (!recipe.id) {
      setError('Recipe ID is required for update');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update recipe');
      }

      const updatedRecipe = await response.json();
      return updatedRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Update recipe error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete recipe' }));
        throw new Error(errorData.error || 'Failed to delete recipe');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Delete recipe error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  return {
    loading,
    error,
    resetError,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
