import * as React from "react";
import { useTheme } from "@mui/joy/styles";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Sheet,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/joy";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Soup,
  ExternalLink,
  Drumstick,
  Milk,
  Egg,
  Fish,
  Leaf,
  Sun,
  Cloud,
  Snowflake,
  CloudRain,
  SunMoon,
  Moon,
} from "lucide-react";
import ConfirmDialog from "../components/dialog/ConfirmDialog";
import { CONFIG } from "../utils/constants";
import { Recipe } from "shared/schemas";

export default function RecipeDetails() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState("");
  const [showError, setShowError] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const token = sessionStorage.getItem('kinde_access_token');
    fetch(`${CONFIG.API_BASE_URL}/recipes/${id}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Recipe not found");
          }
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data: Recipe) => {
        setRecipe(data || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch recipe:", err);
        setError(err.message || "Failed to load recipe. Please try again.");
        setLoading(false);
      });
  }, [id]);

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      const token = sessionStorage.getItem('kinde_access_token');
      const res = await fetch(`${CONFIG.API_BASE_URL}/recipes/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      setShowSuccess("Recipe deleted successfully!");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error("Failed to delete recipe:", err);
      setShowError("Failed to delete recipe. Please try again.");
    }
  };

  const handleEdit = () => {
    navigate("/", { state: { editRecipe: recipe } });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.body",
        }}
      >
        <CircularProgress size="lg" variant="soft" />
        <Typography level="body-lg" sx={{ ml: 2, color: "text.secondary" }}>
          Loading recipe...
        </Typography>
      </Box>
    );
  }

  if (error || !recipe) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 4,
          bgcolor: "background.body",
        }}
      >
        <Typography level="h3" color="danger" sx={{ mb: 2 }}>
          {error || "Recipe not found."}
        </Typography>
        <Button
          startDecorator={<ArrowLeft />}
          onClick={() => navigate("/")}
          variant="soft"
          color="neutral"
        >
          Back to Recipes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.body", pb: 6 }}>
      {/* Hero Section */}
      <Sheet
        sx={{
          width: "100%",
          minHeight: 200,
          bgcolor: theme.palette.primary[200],
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 8 },
          py: { xs: 4, md: 6 },
          borderRadius: 0,
          boxShadow: "md",
          mb: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: 16, left: 16 }}>
          <IconButton
            onClick={() => navigate("/")}
            variant="soft"
            color="primary"
            sx={{
              bgcolor: theme.palette.background.level1,
              "&:hover": { bgcolor: theme.palette.background.level2 },
              color: theme.palette.text.primary,
            }}
            aria-label="Back to recipes"
          >
            <ArrowLeft />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 2, md: 4 },
            textAlign: { xs: "center", md: "left" },
            mb: 2,
          }}
        >
          <Soup size={56} style={{ opacity: 0.9, flexShrink: 0 }} />
          <Box>
            <Typography
              level="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: 32, md: 48 },
                mb: 1,
                color: theme.palette.text.primary,
                letterSpacing: 1,
              }}
            >
              {recipe.nome}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
                mt: 1,
              }}
            >
              {/* Category Chip */}
              {recipe.categoria && (
                <Chip
                  startDecorator={
                    recipe.categoria === "pesce" ? (
                      <Fish size={16} />
                    ) : recipe.categoria === "carne" ? (
                      <Drumstick size={16} />
                    ) : recipe.categoria === "formaggio" ? (
                      <Milk size={16} />
                    ) : recipe.categoria === "uova" ? (
                      <Egg size={16} />
                    ) : recipe.categoria === "legumi" ? (
                      <Leaf size={16} />
                    ) : null
                  }
                  sx={{
                    bgcolor: recipe.categoria
                      ? theme.palette.category[recipe.categoria]
                      : theme.palette.background.level2,
                    color: theme.palette.text.primary,
                    fontSize: 14,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 8,
                  }}
                  size="md"
                >
                  {recipe.categoria}
                </Chip>
              )}
              {/* Type Chip */}
              {recipe.tipo && (
                <Chip
                  variant="soft"
                  sx={{
                    bgcolor: "background.level2",
                    color: "text.primary",
                    fontSize: 14,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  size="md"
                >
                  {recipe.tipo === "pranzo" && (
                    <SunMoon
                      size={16}
                      style={{ verticalAlign: "middle", marginRight: 4 }}
                    />
                  )}
                  {recipe.tipo === "cena" && (
                    <Moon
                      size={16}
                      style={{ verticalAlign: "middle", marginRight: 4 }}
                    />
                  )}
                  {recipe.tipo}
                </Chip>
              )}
              {/* Seasons Chips */}
              {recipe.stagioni &&
                recipe.stagioni.length > 0 &&
                recipe.stagioni.map((season, idx) => (
                  <Chip
                    key={season + idx}
                    startDecorator={
                      season === "spring" ? (
                        <CloudRain size={15} />
                      ) : season === "summer" ? (
                        <Sun size={15} />
                      ) : season === "autumn" ? (
                        <Cloud size={15} />
                      ) : season === "winter" ? (
                        <Snowflake size={15} />
                      ) : null
                    }
                    sx={{
                      bgcolor: "background.level2",
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: 13,
                      px: 1.1,
                      py: 0.3,
                      borderRadius: 8,
                      textTransform: "capitalize",
                    }}
                    size="md"
                  >
                    {season}
                  </Chip>
                ))}
            </Box>
          </Box>
        </Box>

        {/* Action Buttons in Hero Section */}
        <Box sx={{ display: "flex", gap: 2, mt: { xs: 3, md: 4 } }}>
          <Button
            startDecorator={<Pencil />}
            variant="plain"
            color="neutral"
            onClick={handleEdit}
            sx={{ fontWeight: 700, borderRadius: 8, px: 3, py: 1.2 }}
            aria-label="Edit Recipe"
          >
            Edit
          </Button>
          <Button
            startDecorator={<Trash2 />}
            variant="plain"
            color="neutral"
            onClick={handleDelete}
            sx={{ fontWeight: 700, borderRadius: 8, px: 3, py: 1.2 }}
            aria-label="Delete Recipe"
          >
            Delete
          </Button>
        </Box>
      </Sheet>

      <Box
        sx={{
          maxWidth: 700,
          mx: "auto",
          mt: -6,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 700,
            mx: "auto",
            p: { xs: 2, md: 4 },
            borderRadius: 16,
            boxShadow: "xl",
            bgcolor: "background.level1",
            border: "1px solid",
            borderColor: "divider",
            mt: 4,
          }}
        >
          <CardContent>
            <Typography
              level="h3"
              sx={{
                fontWeight: 900,
                mb: 2,
                color: "primary.plainColor",
                letterSpacing: 1,
                fontSize: { xs: 24, md: 32 },
              }}
            >
              Ingredients
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                px: 1,
                py: 1,
                bgcolor: 'background.level2',
                borderRadius: 8,
                boxShadow: 'sm',
                minHeight: 56,
              }}
            >
              {recipe.ingredienti.map((ing: string, idx: number) => (
                <Chip
                  key={idx}
                  sx={{
                    fontSize: 16,
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    bgcolor: 'background.body',
                    color: 'text.primary',
                    borderRadius: 6,
                    boxShadow: 'xs',
                  }}
                  variant="soft"
                  size="lg"
                >
                  {ing}
                </Chip>
              ))}
            </Box>
          </CardContent>
          {recipe.link && (
            <Box sx={{ mt: 3, mb: 1, px: { xs: 2, md: 4 } }}>
              <a
                href={recipe.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.palette.primary.plainColor,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 600,
                }}
              >
                View full recipe <ExternalLink size={18} />
              </a>
            </Box>
          )}
        </Card>
        {/* Snackbars for feedback */}
        <Snackbar
          open={!!showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          variant="solid"
          color="success"
        >
          <Alert color="success" variant="solid">
            {showSuccess}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!showError}
          autoHideDuration={3000}
          onClose={() => setShowError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          variant="solid"
          color="danger"
        >
          <Alert color="danger" variant="solid">
            {showError}
          </Alert>
        </Snackbar>
      </Box>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${recipe.nome}"? This action cannot be undone.`}
      />
    </Box>
  );
}
