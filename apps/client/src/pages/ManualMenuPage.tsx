import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/joy/styles";
import { Loader2, Send, Mail } from "lucide-react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Select,
  Option,
  Sheet,
  Snackbar,
  Alert,
} from "@mui/joy";
import { useRecipes } from "../hooks/useRecipes";
import { CONFIG, daysOfWeek } from "../utils/constants";
import { Recipe } from "shared/schemas";
import Layout from "../components/common/Layout";
import { Section } from "../components/common/Section";
import { useForm, Controller, useWatch } from "react-hook-form";

export const LIBERO_RECIPE = {
  id: "libero",
  nome: "Libero",
  tipo: undefined,
  categoria: undefined,
  ingredienti: [],
  link: "",
  stagioni: [],
  timestamp: null,
  user_id: undefined,
};

type SelectedMenu = {
  pranzo: Record<string, string>;
  cena: Record<string, string>;
};

export default function ManualMenuPage() {
  const theme = useTheme();
  const { getAllRecipes, loading, error } = useRecipes(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sending, setSending] = useState<"telegram" | "email" | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const allRecipes = [LIBERO_RECIPE, ...recipes];

  useEffect(() => {
    (async () => {
      const all = await getAllRecipes();
      setRecipes(all);
    })();
  }, [getAllRecipes]);

  const { control, handleSubmit } = useForm<SelectedMenu>({
    defaultValues: {
      pranzo: {},
      cena: {},
    },
  });

  const selectedPranzo = useWatch({ control, name: "pranzo" });
  const selectedCena = useWatch({ control, name: "cena" });
  const [weekComplete, setWeekComplete] = useState(false);

  useEffect(() => {
    const complete = daysOfWeek.every(
      (day) =>
        typeof selectedPranzo?.[day] === "string" &&
        selectedPranzo[day]?.trim() !== "" &&
        typeof selectedCena?.[day] === "string" &&
        selectedCena[day]?.trim() !== ""
    );
    setWeekComplete(complete);
  }, [selectedPranzo, selectedCena]);

  const onSend = async (data: SelectedMenu, method: "telegram" | "email") => {
    setSending(method);
    setSendError(null);
    setSendSuccess(null);
    try {
      const menu = {
        pranzo: daysOfWeek.map((day) => data.pranzo[day] || null),
        cena: daysOfWeek.map((day) => data.cena[day] || null),
      };
      const token = sessionStorage.getItem("kinde_access_token");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/menu/manual-menu/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ menu, method }),
        }
      );
      if (!response.ok) throw new Error("Failed to send menu");
      setSendSuccess(
        `Menu sent via ${method === "telegram" ? "Telegram" : "Email"}!`
      );
    } catch (err: any) {
      setSendError(err.message || "Send failed");
    } finally {
      setSending(null);
    }
  };

  return (
    <Layout
      title="Manual Weekly Menu"
      subtitle="Choose recipes for each day and meal. Select from the list below and send your menu when ready."
    >
      <form>
        <Box sx={{ maxWidth: 900, mx: "auto", bgcolor: "background.body", borderRadius: 8, p: { xs: 0, md: 2 } }}>
          {daysOfWeek.map((day, idx) => (
            <Sheet
              key={day}
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 12,
                boxShadow: "md",
                border: "1px solid",
                borderColor: theme.palette.mode === "dark" ? "neutral.700" : "neutral.300",
                bgcolor: theme.palette.mode === "dark" ? "neutral.900" : "neutral.100",
                transition: "background 0.2s, border-color 0.2s"
              }}
            >
              <Typography level="h3" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                {day}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                {["pranzo", "cena"].map((type) => (
                  <Box
                    key={type}
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
                      borderRadius: 8,
                      transition: "background 0.2s"
                    }}
                  >
                    <Typography level="h4" sx={{ mb: 1, fontWeight: 500, color: theme.palette.text.secondary }}>
                      {type === "pranzo" ? "Pranzo" : "Cena"}
                    </Typography>
                    <Controller
                      name={
                        `${type}.${day}` as
                          | `pranzo.${string}`
                          | `cena.${string}`
                      }
                      control={control}
                      render={({ field }) => {
                        const isEmpty = !field.value || field.value === "";
                        return (
                          <>
                            <Select
                              {...field}
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : ""
                              }
                              onChange={(_, value) =>
                                field.onChange(value as string)
                              }
                              placeholder={
                                loading ? "Loading..." : "Select recipe"
                              }
                              sx={{
                                width: "100%",
                                borderColor: isEmpty
                                  ? "danger.main"
                                  : theme.palette.mode === "dark" ? "neutral.700" : "neutral.400",
                                borderWidth: isEmpty ? 2 : 1,
                                bgcolor: isEmpty
                                  ? theme.palette.mode === "dark" ? "danger.900" : "danger.50"
                                  : theme.palette.mode === "dark" ? "neutral.900" : "white",
                              }}
                              disabled={loading}
                              color={isEmpty ? "danger" : "neutral"}
                            >
                              {allRecipes
                                .filter((recipe) =>
                                  type === "cena"
                                    ? recipe.id === LIBERO_RECIPE.id ||
                                      recipe.tipo === "cena"
                                    : recipe.id === LIBERO_RECIPE.id ||
                                      recipe.tipo === "pranzo"
                                )
                                .map((recipe: Recipe) => (
                                  <Option key={recipe.id} value={recipe.id}>
                                    {recipe.nome}
                                  </Option>
                                ))}
                            </Select>
                            {isEmpty && (
                              <Typography
                                level="body-xs"
                                color="danger"
                                sx={{ mt: 0.5, fontWeight: 500 }}
                              >
                                Please select a recipe
                              </Typography>
                            )}
                          </>
                        );
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Sheet>
          ))}
        </Box>
      </form>
      {error && (
        <Typography color="danger" sx={{ mt: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 3, mt: 5, mb: 2, justifyContent: "center" }}>
        <Button
          color="primary"
          variant="soft"
          size="lg"
          sx={{ fontWeight: 700, borderRadius: 8, mr: 2 }}
          startDecorator={
            sending === "telegram" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <Send />
            )
          }
          disabled={!weekComplete || sending === "telegram"}
          onClick={handleSubmit((data: SelectedMenu) =>
            onSend(data, "telegram")
          )}
        >
          Send via Telegram
        </Button>
        <Button
          color="primary"
          variant="soft"
          size="lg"
          sx={{ fontWeight: 700, borderRadius: 8 }}
          startDecorator={
            sending === "email" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <Mail />
            )
          }
          disabled={!weekComplete || sending === "email"}
          onClick={handleSubmit((data: SelectedMenu) => onSend(data, "email"))}
        >
          Send via Email
        </Button>
      </Box>
      {/* Snackbar modals for feedback */}
      <Snackbar
        open={!!sendSuccess}
        autoHideDuration={3000}
        color="success"
        onClose={() => setSendSuccess(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert color="success" variant="solid">
          {sendSuccess}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!sendError}
        autoHideDuration={4000}
        color="danger"
        onClose={() => setSendError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert color="danger" variant="solid">
          {sendError}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
