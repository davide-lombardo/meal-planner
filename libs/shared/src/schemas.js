import { z } from 'zod';
export const SeasonSchema = z.enum(['spring', 'summer', 'autumn', 'winter']);
export const CategorySchema = z.enum(['pesce', 'carne', 'formaggio', 'uova', 'legumi']);
export const RecipeTypeSchema = z.enum(['pranzo', 'cena']);
export const RecipeSchema = z.object({
    id: z.string().min(1, "Recipe ID is required"),
    nome: z.string().min(1, "Recipe name is required"),
    tipo: RecipeTypeSchema.optional(),
    categoria: CategorySchema.optional(),
    ingredienti: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient is required"),
    link: z.string().url("Invalid URL format").optional().or(z.literal('')),
    stagioni: z.array(SeasonSchema).optional(),
    timestamp: z.number().optional(),
});
export const MenuOptionsSchema = z.object({
    maxRepetitionWeeks: z.number().int().min(0).optional(),
    mealTypeQuotas: z.record(z.string(), z.number().int().min(0)).optional(),
    useQuotas: z.boolean().optional(),
    useWeightedSelection: z.boolean().optional(),
    enableIngredientPlanning: z.boolean().optional(),
    lockedMeals: z.record(z.string(), z.string()).optional(),
    availableIngredients: z.array(z.string()).optional(),
    preferredRecipes: z.array(z.string()).optional(),
    avoidedRecipes: z.array(z.string()).optional(),
    enableSeasonalFiltering: z.boolean().optional(),
    currentSeason: SeasonSchema.optional(),
});
export const ConfigSchema = z.object({
    useHistory: z.boolean().optional(),
    menuOptions: MenuOptionsSchema,
});
