import { z } from 'zod';

export const RecipeSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.string().optional(),
  categoria: z.string().optional(),
  ingredienti: z.array(z.string()),
});

export const MenuSchema = z.object({
  pranzo: z.array(z.union([RecipeSchema, z.null()])),
  cena: z.array(z.union([RecipeSchema, z.null()])),
});

export const ConfigSchema = z.object({
  menuOptions: z.object({
    maxRepetitionWeeks: z.number(),
    useQuotas: z.boolean(),
    mealTypeQuotas: z.record(z.string(), z.number()),
    useWeightedSelection: z.boolean().optional(),
    enableIngredientPlanning: z.boolean().optional(),
    lockedMeals: z.record(z.string(), z.string()).optional(),
    availableIngredients: z.array(z.string()).optional(),
    preferredRecipes: z.array(z.string()).optional(),
    avoidedRecipes: z.array(z.string()).optional(),
  }),
});
