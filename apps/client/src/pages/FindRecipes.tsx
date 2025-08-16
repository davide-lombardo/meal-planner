import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Textarea,
  FormLabel,
  useTheme,
} from "@mui/joy";
import { Search, Loader2 } from "lucide-react";
import RecipeCard from "../components/RecipeCard";
import { RecipeSchema } from "shared/schemas";
import { CONFIG } from "../utils/constants";
import Layout from "../components/common/Layout";
import { Recipe } from "shared/schemas";
import ErrorAlert from "../components/ErrorAlert";

const API_URL = `${CONFIG.API_BASE_URL}/recipes/by-ingredients`;

export default function FindRecipes() {
  const [ingredientsInput, setIngredientsInput] = React.useState("");
  const [parsedIngredients, setParsedIngredients] = React.useState<string[]>(
    []
  );
  const [matchingRecipes, setMatchingRecipes] = React.useState<Recipe[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [searchInitiated, setSearchInitiated] = React.useState(false);
  const theme = useTheme();

  const handleSearchRecipes = async () => {
    setError("");
    setMatchingRecipes([]);
    setLoading(true);
    setSearchInitiated(true);

    const ingredientsArray = ingredientsInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setParsedIngredients(ingredientsArray);

    if (ingredientsArray.length === 0) {
      setError("Please enter at least one ingredient.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: ingredientsArray }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recipes based on ingredients.");
      }

      const data = await response.json();

      const validRecipes = data.filter((recipe: any) => {
        const result = RecipeSchema.safeParse(recipe);
        if (!result.success) {
          console.error(
            "Invalid recipe data from by-ingredients endpoint:",
            recipe,
            result.error.format()
          );
          return false;
        }
        return true;
      });

      setMatchingRecipes(validRecipes);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="What's in Your Fridge?"
      subtitle="Enter the ingredients you have on hand, and we'll find recipes for you!"
    >
      {/* Search Form */}
      <Stack spacing={3} sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
        <Box>
          <FormLabel>Enter ingredients (comma-separated)</FormLabel>
          <Textarea
            minRows={3}
            placeholder="e.g., chicken, pasta, tomatoes, cheese"
            value={ingredientsInput}
            onChange={(e) => setIngredientsInput(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            startDecorator={
              loading ? <Loader2 className="spin" size={18} /> : <Search />
            }
            size="lg"
            color="primary"
            variant="solid"
            onClick={handleSearchRecipes}
            disabled={loading}
            sx={{
              fontWeight: 700,
              borderRadius: 8,
              "&:hover": {
                bgcolor: theme.palette.primary[700],
                color: theme.palette.primary[200],
              },
            }}
          >
            {loading ? "Searching..." : "Find Recipes"}
          </Button>
        </Box>

        {parsedIngredients.length > 0 && searchInitiated && (
          <Box>
            <Typography level="body-md" sx={{ mb: 1, fontWeight: "bold" }}>
              Searching for recipes with:
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {parsedIngredients.map((ingredient, index) => (
                <Chip key={index} variant="outlined" color="neutral">
                  {ingredient}
                </Chip>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Results Section */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : searchInitiated && matchingRecipes.length === 0 ? (
        <Box sx={{ textAlign: "center", color: "text.secondary", py: 8 }}>
          <img
            src="/illustrations/empty.svg"
            alt="No Recipes Found"
            style={{ height: 120, marginBottom: 16 }}
          />
          <Typography level="body-lg">
            No recipes found with these ingredients.
          </Typography>
          <Typography level="body-sm">
            Try broadening your search or adding more ingredients.
          </Typography>
        </Box>
      ) : (
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={3}
          useFlexGap
          sx={{ justifyContent: "flex-start" }}
        >
          {matchingRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </Stack>
      )}
    </Layout>
  );
}
