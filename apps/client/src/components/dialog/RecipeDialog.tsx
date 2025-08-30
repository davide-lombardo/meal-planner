import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Typography,
  Select,
  Option,
  Chip,
  Box,
  useTheme,
} from "@mui/joy";
import { CloudRain, Leaf, Snowflake, Sun } from "lucide-react";
import {
  Category,
  Recipe,
  RecipeType,
  Season,
  CategorySchema,
} from "shared/schemas";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

interface RecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
}

const seasonIcons = {
  spring: <Leaf size={16} />,
  summer: <Sun size={16} />,
  autumn: <CloudRain size={16} />,
  winter: <Snowflake size={16} />,
};

const seasonLabels = {
  spring: "Primavera",
  summer: "Estate",
  autumn: "Autunno",
  winter: "Inverno",
};

export default function RecipeDialog({
  open,
  onClose,
  onSave,
  initialRecipe,
}: RecipeDialogProps) {
  const { user } = useKindeAuth();
  const [nome, setNome] = React.useState(initialRecipe?.nome || "");
  const [ingredienti, setIngredienti] = React.useState(
    initialRecipe?.ingredienti?.join("\n") || ""
  );
  const [categoria, setCategoria] = React.useState<Category | "">(
    initialRecipe?.categoria || ""
  );
  const [tipo, setTipo] = React.useState<RecipeType | "">(
    initialRecipe?.tipo || ""
  );
  const [link, setLink] = React.useState(initialRecipe?.link || "");
  const [stagioni, setStagioni] = React.useState<Season[]>(
    initialRecipe?.stagioni || []
  );
  const [error, setError] = React.useState("");
  const theme = useTheme();

  React.useEffect(() => {
    setNome(initialRecipe?.nome || "");
    setIngredienti(initialRecipe?.ingredienti?.join("\n") || "");
    setCategoria(initialRecipe?.categoria || "");
    setTipo(initialRecipe?.tipo || "");
    setLink(initialRecipe?.link || "");
    setStagioni(initialRecipe?.stagioni || []);
    setError("");
  }, [initialRecipe, open]);

  const validCategories: Category[] = CategorySchema.options;
  const validTypes: RecipeType[] = ["pranzo", "cena"];
  const allSeasons: Season[] = ["spring", "summer", "autumn", "winter"];

  const toggleSeason = (season: Season) => {
    setStagioni((prev) => {
      if (prev.includes(season)) {
        return prev.filter((s) => s !== season);
      } else {
        return [...prev, season];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!nome.trim()) {
      setError("Nome ricetta è obbligatorio.");
      return;
    }
    if (!ingredienti.trim()) {
      setError("Ingredienti sono obbligatori.");
      return;
    }
    if (!categoria) {
      setError("Categoria è obbligatoria.");
      return;
    }
    if (!tipo) {
      setError("Tipo è obbligatorio.");
      return;
    }
    if (!validCategories.includes(categoria as Category)) {
      setError("Categoria non valida.");
      return;
    }
    if (!validTypes.includes(tipo as RecipeType)) {
      setError("Tipo non valido.");
      return;
    }

    const ingredientiArray = ingredienti
      .split(/\n|\r|\r\n/)
      .map((i) => i.trim())
      .filter(Boolean);

    if (ingredientiArray.length === 0) {
      setError("Devi inserire almeno un ingrediente.");
      return;
    }

    const recipeToSave: Recipe = {
      id: initialRecipe?.id || "",
      nome: nome.trim(),
      categoria: categoria as Category,
      tipo: tipo as RecipeType,
      ingredienti: ingredientiArray,
      link: link.trim() || undefined,
      stagioni: stagioni.length > 0 ? stagioni : undefined,
      user_id: user?.id,
    };

    onSave(recipeToSave);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="edit-recipe-title"
        sx={{
          bgcolor: "background.body",
          color: "text.primary",
          borderRadius: 6,
          boxShadow: "lg",
          width: "100%",
          maxWidth: { xs: "95vw", sm: "500px" },
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <DialogTitle id="edit-recipe-title">
          {initialRecipe ? "Edit Recipe" : "Add New Recipe"}
        </DialogTitle>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <DialogContent
            sx={{
              flex: 1,
              overflow: "auto",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Nome Ricetta</FormLabel>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="e.g. Pasta alla carbonara"
                sx={{ width: "100%" }}
              />
            </FormControl>

            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Categoria</FormLabel>
              <Select
                value={categoria}
                onChange={(_, v) => setCategoria((v as Category) || "")}
                placeholder="Seleziona categoria"
                sx={{ width: "100%" }}
              >
                {validCategories.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Tipo</FormLabel>
              <Select
                value={tipo}
                onChange={(_, v) => setTipo((v as RecipeType) || "")}
                placeholder="Seleziona tipo"
                sx={{ width: "100%" }}
              >
                {validTypes.map((t) => (
                  <Option key={t} value={t}>
                    {t}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Ingredienti (uno per riga)</FormLabel>
              <Textarea
                minRows={3}
                maxRows={6}
                value={ingredienti}
                onChange={(e) => setIngredienti(e.target.value)}
                placeholder="pasta\nuova\nguanciale\n..."
                sx={{ width: "100%", resize: "none" }}
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Link alla ricetta (opzionale)</FormLabel>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://esempio.com/ricetta"
                type="url"
                sx={{ width: "100%" }}
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Stagioni (opzionale)</FormLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {allSeasons.map((season) => (
                  <Chip
                    key={season}
                    variant={stagioni.includes(season) ? "solid" : "outlined"}
                    color={stagioni.includes(season) ? "primary" : "neutral"}
                    onClick={() => toggleSeason(season)}
                    startDecorator={seasonIcons[season]}
                    sx={{
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                  >
                    {seasonLabels[season]}
                  </Chip>
                ))}
              </Box>
              {stagioni.length > 0 && (
                <Typography
                  level="body-sm"
                  sx={{ mt: 1, color: "text.secondary" }}
                >
                  Stagioni selezionate:{" "}
                  {stagioni.map((s) => seasonLabels[s]).join(", ")}
                </Typography>
              )}
            </FormControl>

            {error && (
              <Typography color="danger" level="body-sm" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              flexShrink: 0,
              pt: 2,
              gap: 1,
            }}
          >
            <Button
              color="primary"
              variant="soft"
              sx={{
                fontWeight: 700,
                borderRadius: 8,
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="solid"
              sx={{
                fontWeight: 700,
                borderRadius: 8,
                "&:hover": {
                  bgcolor: theme.palette.primary[700],
                  color: theme.palette.primary[200],
                },
              }}
            >
              {initialRecipe ? "Save" : "Add Recipe"}
            </Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
}
