import * as React from "react";
import AppMetaInfo from "../components/common/AppMetaInfo";
import {
  Box,
  Typography,
  Button,
  Stack,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Select,
  Option,
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import { PlusCircle, Mail, Loader2, Send } from "lucide-react";
import RecipeCard from "../components/RecipeCard";
import RecipeDialog from "../components/dialog/RecipeDialog";
import ConfirmDialog from "../components/dialog/ConfirmDialog";
import { useLocation } from "react-router-dom";
import Skeleton from "@mui/joy/Skeleton";
import FilterSection from "../components/FiltersSection";
import { CONFIG } from "../utils/constants";
import { Recipe, Category, RecipeType } from "shared/schemas";
import ErrorAlert from "../components/ErrorAlert";
import Footer from "../components/Footer";
import JoyPagination from "../components/JoyPagination";
import { useRecipes } from "../hooks/useRecipes";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useRecipeManagement } from "../hooks/useRecipeManagement";

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const { isAuthenticated } = useKindeAuth();
  const theme = useTheme();
  const location = useLocation();
  const {
    recipes,
    total,
    page,
    pageSize,
    loading,
    error,
    addRecipe,
    goToPage,
    changePageSize,
    setFilters,
  } = useRecipes(isAuthenticated);

  const { updateRecipe, deleteRecipe, createRecipe } = useRecipeManagement(
    CONFIG.API_BASE_URL
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editRecipe, setEditRecipe] = React.useState<Recipe | null>(null);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState("");
  const [sendSuccess, setSendSuccess] = React.useState("");
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    recipe: Recipe | null;
  }>({
    open: false,
    recipe: null,
  });
  const [actionSuccess, setActionSuccess] = React.useState("");
  const [actionError, setActionError] = React.useState("");

  const [localSearch, setLocalSearch] = React.useState("");
  const [localType, setLocalType] = React.useState<RecipeType | "">("");
  const [localCategory, setLocalCategory] = React.useState<Category | "">("");
  const debouncedSearch = useDebouncedValue(localSearch, 250);

  React.useEffect(() => {
    if (location.state && location.state.editRecipe) {
      setEditRecipe(location.state.editRecipe);
      setDialogOpen(true);

      // Clean up state so dialog doesn't reopen on next visit
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSendMealPlan = async () => {
    setSending(true);
    setSendError("");
    setSendSuccess("");
    try {
      const token = sessionStorage.getItem("kinde_access_token");
      const response = await fetch(`${CONFIG.API_BASE_URL}/menu/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error("Failed to send meal plan");
      setSendSuccess("Meal plan sent!");
    } catch (e) {
      setSendError("Failed to send meal plan.");
    } finally {
      setSending(false);
    }
  };

  const [telegramSending, setTelegramSending] = React.useState(false);
  const [telegramSuccess, setTelegramSuccess] = React.useState("");
  const [telegramError, setTelegramError] = React.useState("");
  const [config, setConfig] = React.useState<any>(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const token = sessionStorage.getItem("kinde_access_token");
    fetch(`${CONFIG.API_BASE_URL}/config`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, [isAuthenticated]);

  const handleSendTelegram = async () => {
    setTelegramSending(true);
    setTelegramError("");
    setTelegramSuccess("");
    try {
      let chatId = undefined;
      if (config && config.menuOptions && config.menuOptions.telegramChatId) {
        chatId = String(config.menuOptions.telegramChatId);
      }
      if (!chatId || chatId.trim() === "") {
        setTelegramError("Telegram chatId non configurato o non valido.");
        setTelegramSending(false);
        return;
      }

      // Send empty text so BE generates the meal plan and grocery list
      const body = { chatId };
      const token = sessionStorage.getItem("kinde_access_token");
      const response = await fetch(`${CONFIG.API_BASE_URL}/menu/telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to send Telegram message");
      setTelegramSuccess("Messaggio Telegram inviato!");
    } catch (e) {
      setTelegramError("Errore invio messaggio Telegram.");
    } finally {
      setTelegramSending(false);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      if (!recipe.id) {
        // Generate a unique id and timestamp
        const now = Date.now();
        const newRecipe = { ...recipe, id: `r${now}`, timestamp: now };
        const created = await createRecipe(newRecipe);
        if (created) {
          addRecipe(created); // update local state
          setActionSuccess("Recipe added!");
        } else {
          setActionError("Failed to add recipe.");
        }
      } else {
        const updated = await updateRecipe(recipe);
        if (updated) {
          addRecipe(updated); // update local state with backend response
          setActionSuccess("Recipe updated!");
        } else {
          setActionError("Failed to update recipe.");
        }
      }
      setDialogOpen(false);
    } catch {
      setActionError("Failed to save recipe.");
    }
  };

  // Delete recipe via backend
  const confirmDeleteRecipe = async () => {
    if (!deleteDialog.recipe) return;
    try {
      await deleteRecipe(deleteDialog.recipe.id);
      // Remove from local state
      deleteRecipe(deleteDialog.recipe.id);
      setDeleteDialog({ open: false, recipe: null });
      setActionSuccess("Recipe deleted!");
    } catch {
      setActionError("Failed to delete recipe.");
    }
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    setDeleteDialog({ open: true, recipe });
  };

  // Extract unique types and categories for filters
  const types = Array.from(
    new Set(
      recipes.map((r) => r.tipo).filter((t): t is RecipeType => t !== undefined)
    )
  );
  const categories = Array.from(
    new Set(
      recipes
        .map((r) => r.categoria)
        .filter((c): c is Category => c !== undefined)
    )
  );

  // Sync filters to backend when changed
  React.useEffect(() => {
    setFilters(debouncedSearch, localType, localCategory);
  }, [debouncedSearch, localType, localCategory, setFilters]);

  return (
    <Box
      sx={{
        bgcolor: "background.body",
        minHeight: "100vh",
        py: 0,
        pb: 8,
        color: "text.primary",
      }}
    >
      <AppMetaInfo />
      {/* Hero Section */}
      <Box
        sx={{
          width: "100%",
          minHeight: 260,
          bgcolor: theme.palette.primary[200],
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 8 },
          py: { xs: 4, md: 6 },
          borderRadius: 0,
          boxShadow: "md",
          mb: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ zIndex: 2 }}>
          <Typography
            level="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: 32, md: 48 },
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            Plan Your Week, Eat Better
          </Typography>
          <Typography
            level="body-lg"
            sx={{
              fontSize: { xs: 16, md: 22 },
              mb: 3,
              color: theme.palette.text.primary,
              maxWidth: 500,
            }}
          >
            Add your favorite recipes. Generate a weekly menu and shopping list
            in one click!
          </Typography>
          <Button
            data-testid="add-recipe-btn"
            startDecorator={<PlusCircle />}
            size="lg"
            color="primary"
            variant="solid"
            sx={{
              fontWeight: 700,
              borderRadius: 8,
              mr: 2,
              mb: 2,
              "&:hover": {
                bgcolor: theme.palette.primary[700],
                color: theme.palette.primary[200],
              },
            }}
            onClick={() => {
              setEditRecipe(null);
              setDialogOpen(true);
            }}
          >
            Add Recipe
          </Button>
          <Button
            data-testid="send-meal-plan-btn"
            startDecorator={<Mail />}
            size="lg"
            color="primary"
            variant="soft"
            sx={{
              fontWeight: 700,
              borderRadius: 8,
              mr: 2,
              mb: { xs: 1.5, md: 0 },
            }}
            onClick={handleSendMealPlan}
            disabled={sending}
          >
            {sending ? (
              <Loader2 className="spin" size={18} />
            ) : (
              "Send plan via Email"
            )}
          </Button>
          <Button
            data-testid="send-telegram-btn"
            startDecorator={<Send />}
            size="lg"
            color="primary"
            variant="soft"
            sx={{ fontWeight: 700, borderRadius: 8 }}
            onClick={handleSendTelegram}
            disabled={telegramSending}
          >
            {telegramSending ? (
              <Loader2 className="spin" size={18} />
            ) : (
              "Send plan via Telegram"
            )}
          </Button>
          {/* Telegram Snackbar */}
          <Snackbar
            open={!!telegramSuccess}
            autoHideDuration={3000}
            onClose={() => setTelegramSuccess("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert color="success" variant="solid">
              {telegramSuccess}
            </Alert>
          </Snackbar>
          <Snackbar
            open={!!telegramError}
            autoHideDuration={3000}
            onClose={() => setTelegramError("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert color="danger" variant="solid">
              {telegramError}
            </Alert>
          </Snackbar>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" }, zIndex: 1 }}>
          <img
            src="/illustrations/chef.svg"
            alt="Chef Illustration"
            style={{ height: 180 }}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            right: 0,
            bottom: 0,
            opacity: 0.08,
            zIndex: 0,
          }}
        >
          <img
            src="/illustrations/chef.svg"
            alt="Background Chef"
            style={{ height: 320 }}
          />
        </Box>
      </Box>

      {/* Recipes Section */}
      <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 2 }}>
        <FilterSection
          search={localSearch}
          onSearchChange={setLocalSearch}
          filterType={localType}
          onTypeChange={setLocalType}
          filterCategory={localCategory}
          onCategoryChange={setLocalCategory}
          types={types}
          categories={categories}
          filteredCount={recipes.length}
          totalCount={total}
        />
        {error && <ErrorAlert message={error} />}
        {loading ? (
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: 3, minHeight: 200 }}
          >
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                variant="soft"
                sx={{
                  bgcolor: "neutral.solidBg",
                  width: { xs: '100%', sm: 340 },
                  height: 220,
                  mb: 3,
                  borderRadius: 12,
                  boxShadow: "md",
                  p: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <CardContent sx={{ p: 3, pt: 2.5, pb: 1.5 }}>
                  <Skeleton
                    variant="text"
                    width={180}
                    height={32}
                    sx={{ mb: 2, borderRadius: 2 }}
                  />
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={20}
                      sx={{ borderRadius: 10 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={40}
                      height={20}
                      sx={{ borderRadius: 10 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : recipes.length === 0 ? (
          <Box sx={{ textAlign: "center", color: "text.secondary", py: 8 }}>
            <img
              src="/illustrations/empty.svg"
              alt="No Recipes"
              style={{ height: 120, marginBottom: 16 }}
            />
            <Typography level="body-lg">No recipes found.</Typography>
          </Box>
        ) : (
          <>
            <Stack
              direction="row"
              flexWrap="wrap"
              spacing={3}
              useFlexGap
              sx={{ justifyContent: "flex-start" }}
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={(r) => {
                    setEditRecipe(r);
                    setDialogOpen(true);
                  }}
                  onDelete={handleDeleteRecipe}
                  data-testid={`recipe-card-${recipe.id}`}
                />
              ))}
            </Stack>
            {/* Pagination Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 4,
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <JoyPagination
                page={page}
                total={total}
                pageSize={pageSize}
                onPageChange={goToPage}
              />
              <Typography level="body-md" sx={{ ml: 2 }}>
                Recipes per page:
              </Typography>
              <Box>
                <Select
                  value={pageSize}
                  onChange={(event, value) =>
                    value && changePageSize(Number(value))
                  }
                  size="md"
                  color="neutral"
                  variant="outlined"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <Option key={size} value={size}>
                      {size}
                    </Option>
                  ))}
                </Select>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Dialogs */}
      <RecipeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveRecipe}
        initialRecipe={editRecipe}
        data-testid="recipe-dialog"
      />
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, recipe: null })}
        onConfirm={confirmDeleteRecipe}
        message={
          deleteDialog.recipe
            ? `Are you sure you want to delete the recipe "${deleteDialog.recipe.nome}"? This action cannot be undone.`
            : "Are you sure you want to delete this recipe? This action cannot be undone."
        }
        data-testid="confirm-dialog"
      />
      <Snackbar
        open={!!sendSuccess}
        autoHideDuration={3000}
        color="success"
        onClose={() => setSendSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {sendSuccess}
      </Snackbar>
      <Snackbar
        open={!!sendError}
        autoHideDuration={3000}
        color="danger"
        onClose={() => setSendError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {sendError}
      </Snackbar>
      <Snackbar
        open={!!actionSuccess}
        autoHideDuration={2500}
        color="success"
        onClose={() => setActionSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {actionSuccess}
      </Snackbar>
      <Snackbar
        open={!!actionError}
        autoHideDuration={2500}
        color="danger"
        onClose={() => setActionError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {actionError}
      </Snackbar>
      {/* Footer */}
      <Footer />
    </Box>
  );
}
