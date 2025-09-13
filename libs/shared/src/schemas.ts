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
  link: z.union([z.string().url("Invalid URL format"), z.string(), z.literal("")]).optional(),
  stagioni: z.array(SeasonSchema).optional(),
  timestamp: z.union([z.number(), z.null()]).optional(),
  user_id: z.string().optional(),
});

export const MenuOptionsSchema = z.object({
  maxRepetitionWeeks: z.number().int().min(0).optional(),
  mealTypeQuotas: z.record(z.string(), z.number().int().min(0)).optional(),
  useQuotas: z.boolean().optional(),
  useWeightedSelection: z.boolean().optional(),
  enableIngredientPlanning: z.boolean().optional(),
  lockedMeals: z.record(z.string(), z.string()).optional(),
  availableIngredients: z.array(z.string()).optional(),
  enableSeasonalFiltering: z.boolean().optional(),
  currentSeason: SeasonSchema.optional(),
  telegramChatId: z.string().optional(),
  telegramChatIds: z.array(z.string()).optional(),
});

export const ConfigSchema = z.object({
  useHistory: z.boolean().optional(),
  menuOptions: MenuOptionsSchema,
});

export type Season = z.infer<typeof SeasonSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type RecipeType = z.infer<typeof RecipeTypeSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type MenuOptions = z.infer<typeof MenuOptionsSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export type Menu = {
  pranzo: (Recipe | null)[];
  cena: (Recipe | null)[];
};
