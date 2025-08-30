import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Input,
  Button,
  Snackbar,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemDecorator,
  IconButton,
  Stack,
  Grid,
  Select,
  Option,
} from "@mui/joy";
import {
  Plus,
  Trash2,
  Save,
  Snowflake,
  Sun,
  Leaf,
  CloudRain,
} from "lucide-react";
import {
  Config,
  MenuOptions,
  ConfigSchema
} from "shared/schemas";
import { EditableArray } from "../components/common/EditableArray";
import { FormField } from "../components/common/FormField";
import { CONFIG } from "../utils/constants";
import Layout from "../components/common/Layout";
import { Season } from "shared/schemas";
import CustomSwitch from "../components/CustomSwitch";

const getCurrentSeason = (): "spring" | "summer" | "autumn" | "winter" => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
};

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

export default function ConfigPage() {
  const [config, setConfig] = React.useState<Config | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  React.useEffect(() => {
    const accessToken = sessionStorage.getItem('kinde_access_token');
    fetch(`${CONFIG.API_BASE_URL}/config`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
      })
      .then((data: Config) => {
        try {
          if (!data.menuOptions) {
            data.menuOptions = {};
          }

          if (!data.menuOptions.currentSeason) {
            data.menuOptions.currentSeason = getCurrentSeason();
          }

          ConfigSchema.parse(data);
          setConfig(data);
        } catch (e) {
          console.error("Config validation error:", e);
          setError(
            "Config validation failed: " +
              (e instanceof Error ? e.message : "Unknown error")
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load config:", err);
        setError("Failed to load configuration");
        setLoading(false);
      });
  }, []);

  const setMenuOption = React.useCallback(
    (key: keyof MenuOptions, value: unknown) => {
      setConfig((prev: Config | null) => {
        if (!prev) return prev;

        const updatedConfig = {
          ...prev,
          menuOptions: {
            ...prev.menuOptions,
            [key]: value,
          },
        };

        try {
          ConfigSchema.parse(updatedConfig);
          setHasUnsavedChanges(true);
          setError("");
          return updatedConfig;
        } catch (e) {
          console.warn("Invalid config change:", e);
          setError(
            "Invalid configuration: " +
              (e instanceof Error ? e.message : "Unknown error")
          );
          return prev; // Don't apply invalid changes
        }
      });
    },
    []
  );

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!config) throw new Error("No configuration data available");

      ConfigSchema.parse(config);

      const accessToken = sessionStorage.getItem('kinde_access_token');
      const response = await fetch(`${CONFIG.API_BASE_URL}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Save failed: ${errorData}`);
      }

      setSuccess("Configuration saved successfully!");
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error("Save error:", e);
      setError(e instanceof Error ? e.message : "Save operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSeasonChange = React.useCallback(
    (newSeason: Season) => {
      setMenuOption("currentSeason", newSeason);
    },
    [setMenuOption]
  );

  const handleSeasonalFilteringToggle = React.useCallback(
    (enabled: boolean) => {
      setMenuOption("enableSeasonalFiltering", enabled);
    },
    [setMenuOption]
  );

  if (loading) {
    return (
      <Layout
        title="Loading..."
        subtitle="Please wait while we load your configuration"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
          }}
        >
          <Typography level="h4" sx={{ color: "text.secondary" }}>
            Loading configuration...
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (!config) {
    return (
      <Layout title="Configuration Error" showBackButton={false}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
          }}
        >
          <Card variant="soft" color="danger">
            <CardContent>
              <Typography level="h4">Configuration Error</Typography>
              <Typography>Unable to load configuration data.</Typography>
            </CardContent>
          </Card>
        </Box>
      </Layout>
    );
  }

  const mo = config.menuOptions || {};

  return (
    <Layout
      title="Settings"
      subtitle="Customize how your weekly menus are generated"
    >
      {/* Save Button Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "stretch", sm: "flex-end" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1.5, sm: 2 },
          mb: 4,
          width: "100%",
        }}
      >
        {hasUnsavedChanges && (
          <Chip
            variant="soft"
            color="warning"
            size="sm"
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            Unsaved changes
          </Chip>
        )}
        <Button
          variant="soft"
          color="primary"
          startDecorator={<Save size={18} />}
          onClick={handleSave}
          loading={saving}
          disabled={!hasUnsavedChanges}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 4,
            minWidth: 180,
            alignSelf: { xs: "stretch", sm: "center" },
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>

      <Grid
        container
        spacing={4}
        sx={{
          width: "100%",
          margin: 0,
          maxWidth: 1200,
          mx: "auto",
          alignItems: "stretch",
        }}
      >
        {/* General Settings */}
        <Grid xs={12} sx={{ display: "flex" }}>
          <Card
            variant="outlined"
            sx={{
              flex: 1.5,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 3,
              border: "2px solid",
              borderColor: "divider",
              boxShadow: 2,
              zIndex: 2,
            }}
          >
            <CardContent
              sx={{ p: 5, flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                level="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  fontSize: "2rem",
                }}
              >
                <Save size={22} style={{ marginRight: 4 }} />
                General Settings
              </Typography>
              <Box sx={{ width: "100%", my: 2 }}>
                <Box
                  sx={{
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    width: "100%",
                  }}
                />
              </Box>
              <Typography
                level="body-sm"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                Basic configuration for menu generation
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <FormField
                    label="Default Telegram Chat ID"
                    tooltip="Default Telegram chat ID to send the menu (used if not specified elsewhere)"
                  >
                    <Input
                      type="text"
                      value={mo.telegramChatId ?? ""}
                      onChange={(e) =>
                        setMenuOption("telegramChatId", e.target.value)
                      }
                      placeholder="es. 123456789"
                      sx={{ maxWidth: 240 }}
                    />
                  </FormField>
                  <FormField
                    label="Additional Telegram Chat IDs"
                    tooltip="Other Telegram chat IDs to send the menu (one or more, in addition to the default)"
                  >
                    <Stack spacing={1} sx={{ maxWidth: 340 }}>
                      <List sx={{ "--List-gap": "8px", mb: 1 }}>
                        {(mo.telegramChatIds || []).map(
                          (id: string, idx: number) => (
                            <ListItem
                              key={id}
                              sx={{ px: 0, py: 0.5, alignItems: "center" }}
                            >
                              <Input
                                size="sm"
                                value={id}
                                type="text"
                                onChange={(e) => {
                                  const arr = [...(mo.telegramChatIds || [])];
                                  arr[idx] = e.target.value;
                                  setMenuOption("telegramChatIds", arr);
                                }}
                                sx={{
                                  bgcolor: "background.level2",
                                  color: "text.primary",
                                  maxWidth: 200,
                                  mr: 1,
                                }}
                                aria-label="Telegram Chat ID"
                              />
                              <IconButton
                                size="md"
                                sx={{ minWidth: 45 }}
                                color="danger"
                                variant="soft"
                                onClick={() => {
                                  const arr = [...(mo.telegramChatIds || [])];
                                  arr.splice(idx, 1);
                                  setMenuOption("telegramChatIds", arr);
                                }}
                              >
                                <Trash2 size={14} />
                              </IconButton>
                            </ListItem>
                          )
                        )}
                      </List>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Input
                          size="sm"
                          placeholder="Add new chat ID"
                          sx={{
                            bgcolor: "background.level2",
                            color: "text.primary",
                          }}
                          id="new-telegram-chat-id"
                          aria-label="Add new chat ID"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = document.getElementById(
                                "new-telegram-chat-id"
                              ) as HTMLInputElement;
                              const val = input?.value.trim();
                              if (val) {
                                setMenuOption("telegramChatIds", [
                                  ...(mo.telegramChatIds || []),
                                  val,
                                ]);
                                input.value = "";
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={() => {
                            const input = document.getElementById(
                              "new-telegram-chat-id"
                            ) as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) {
                              setMenuOption("telegramChatIds", [
                                ...(mo.telegramChatIds || []),
                                val,
                              ]);
                              input.value = "";
                            }
                          }}
                          aria-label="Add new chat ID"
                        >
                          <Plus size={18} />
                        </Button>
                      </Box>
                    </Stack>
                  </FormField>
                  <Box sx={{ width: "100%", my: 3 }}>
                    <Box
                      sx={{
                        borderBottom: "2px solid",
                        borderColor: "divider",
                        width: "100%",
                      }}
                    />
                  </Box>
                </Box>
                <FormField
                  label="Maximum repetition weeks"
                  tooltip="Avoid repeating recipes for this many weeks"
                >
                  <Input
                    type="number"
                    value={mo.maxRepetitionWeeks ?? ""}
                    onChange={(e) =>
                      setMenuOption(
                        "maxRepetitionWeeks",
                        Number(e.target.value)
                      )
                    }
                    placeholder="e.g. 4"
                    sx={{ maxWidth: 140 }}
                  />
                </FormField>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.level1",
                    border: "1px solid",
                    borderColor: "divider",
                    mt: 1,
                    maxWidth: 420,
                  }}
                >
                  <Box>
                    <Typography
                      level="body-sm"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Enable weighted selection
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary" }}
                    >
                      Prioritize less-used recipes
                    </Typography>
                  </Box>
                  <CustomSwitch
                    checked={!!mo.useWeightedSelection}
                    onChange={(e) =>
                      setMenuOption("useWeightedSelection", e.target.checked)
                    }
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Seasonal Settings */}
        <Grid xs={12} lg={6} sx={{ display: "flex" }}>
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                {seasonIcons[mo.currentSeason || "spring"]}
                Seasonal Settings
              </Typography>
              <Box sx={{ width: "100%", my: 2 }}>
                <Box
                  sx={{
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    width: "100%",
                  }}
                />
              </Box>
              <Typography
                level="body-sm"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                Filter recipes based on the current season
              </Typography>

              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.level1",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography
                      level="body-sm"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Enable seasonal filtering
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary" }}
                    >
                      Only show recipes for the current season
                    </Typography>
                  </Box>
                  <CustomSwitch
                    checked={!!mo.enableSeasonalFiltering}
                    onChange={(e) =>
                      handleSeasonalFilteringToggle(e.target.checked)
                    }
                  />
                </Box>

                <FormField
                  label="Current season"
                  tooltip="Select the current season for recipe filtering"
                >
                  <Select
                    value={mo.currentSeason || getCurrentSeason()}
                    onChange={(_, value) => {
                      if (value) {
                        handleSeasonChange(
                          value as "spring" | "summer" | "autumn" | "winter"
                        );
                      }
                    }}
                    sx={{ maxWidth: 180 }}
                  >
                    {Object.entries(seasonLabels).map(([key, label]) => (
                      <Option key={key} value={key}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {seasonIcons[key as keyof typeof seasonIcons]}
                          {label}
                        </Box>
                      </Option>
                    ))}
                  </Select>
                </FormField>

                {mo.enableSeasonalFiltering && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.level2",
                      border: "1px solid",
                      borderColor: "primary.200",
                    }}
                  >
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary" }}
                    >
                      Currently filtering for:{" "}
                      <strong>
                        {seasonLabels[mo.currentSeason || "spring"]}
                      </strong>
                      <br />
                      Only recipes marked for this season will be included in
                      menu generation.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Ingredient Planning */}
        <Grid xs={12} lg={6} sx={{ display: "flex" }}>
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Leaf size={20} />
                Ingredient Planning
              </Typography>
              <Box sx={{ width: "100%", my: 2 }}>
                <Box
                  sx={{
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    width: "100%",
                  }}
                />
              </Box>
              <Typography
                level="body-sm"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                Optimize menus based on available ingredients
              </Typography>

              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.level1",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography
                      level="body-sm"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Enable ingredient planning
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary" }}
                    >
                      Prefer recipes using your ingredients
                    </Typography>
                  </Box>
                  <CustomSwitch
                    checked={!!mo.enableIngredientPlanning}
                    onChange={(e) =>
                      setMenuOption(
                        "enableIngredientPlanning",
                        e.target.checked
                      )
                    }
                  />
                </Box>

                <Box sx={{ opacity: mo.enableIngredientPlanning ? 1 : 0.5 }}>
                  <EditableArray
                    label="Available ingredients"
                    value={mo.availableIngredients || []}
                    onChange={(arr) =>
                      setMenuOption("availableIngredients", arr)
                    }
                    placeholder="Add ingredient"
                    tooltip="Ingredients you have at home"
                    disabled={!mo.enableIngredientPlanning}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quotas & Preferences */}
        <Grid xs={12} sx={{ display: "flex" }}>
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <ListItemDecorator sx={{ minWidth: 0 }}>
                  <CloudRain size={20} />
                </ListItemDecorator>
                Quotas & Preferences
              </Typography>
              <Box sx={{ width: "100%", my: 2 }}>
                <Box
                  sx={{
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    width: "100%",
                  }}
                />
              </Box>
              <Typography
                level="body-sm"
                sx={{ color: "text.secondary", mb: 4 }}
              >
                Control meal frequency and set recipe preferences
              </Typography>

              <Grid container spacing={4}>
                {/* Quotas Section */}
                <Grid xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "background.level1",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography
                          level="body-sm"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Use meal type quotas
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{ color: "text.secondary" }}
                        >
                          Limit meal types per week
                        </Typography>
                      </Box>
                      <CustomSwitch
                        checked={!!mo.useQuotas}
                        onChange={(e) =>
                          setMenuOption("useQuotas", e.target.checked)
                        }
                      />
                    </Box>

                    {mo.useQuotas && (
                      <Box>
                        <Typography
                          level="body-sm"
                          sx={{ fontWeight: 600, mb: 2 }}
                        >
                          Weekly quotas by meal type
                        </Typography>
                        <Card variant="soft" sx={{ p: 2 }}>
                          <List sx={{ "--List-gap": "8px" }}>
                            {Object.entries(mo.mealTypeQuotas || {}).map(
                              ([category, quota]: [string, number]) => (
                                <ListItem
                                  key={category}
                                  sx={{
                                    bgcolor: "background.body",
                                    borderRadius: 1,
                                    px: 2,
                                    py: 1,
                                  }}
                                >
                                  <ListItemDecorator sx={{ minWidth: 100 }}>
                                    <Typography
                                      level="body-sm"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {category}
                                    </Typography>
                                  </ListItemDecorator>
                                  <Input
                                    type="number"
                                    value={quota}
                                    onChange={(e) =>
                                      setMenuOption("mealTypeQuotas", {
                                        ...mo.mealTypeQuotas,
                                        [category]: Number(e.target.value),
                                      })
                                    }
                                    sx={{ maxWidth: 80, ml: "auto", mr: 1 }}
                                    size="sm"
                                  />
                                  <IconButton
                                    size="sm"
                                    color="danger"
                                    variant="soft"
                                    onClick={() => {
                                      const updated = { ...mo.mealTypeQuotas };
                                      delete updated[category];
                                      setMenuOption("mealTypeQuotas", updated);
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </IconButton>
                                </ListItem>
                              )
                            )}

                            <ListItem
                              sx={{
                                bgcolor: "background.level1",
                                borderRadius: 1,
                                px: 2,
                                py: 1,
                              }}
                            >
                              <Input
                                size="sm"
                                placeholder="Category name"
                                sx={{ flex: 1, mr: 1 }}
                                id="new-category"
                              />
                              <Input
                                size="sm"
                                type="number"
                                placeholder="Max per week"
                                sx={{ maxWidth: 120, mr: 1 }}
                                id="new-quota"
                              />
                              <IconButton
                                size="sm"
                                color="primary"
                                onClick={() => {
                                  const categoryInput = document.getElementById(
                                    "new-category"
                                  ) as HTMLInputElement;
                                  const quotaInput = document.getElementById(
                                    "new-quota"
                                  ) as HTMLInputElement;

                                  const category = categoryInput?.value.trim();
                                  const quota = Number(quotaInput?.value);

                                  if (category && quota > 0) {
                                    setMenuOption("mealTypeQuotas", {
                                      ...mo.mealTypeQuotas,
                                      [category]: quota,
                                    });
                                    categoryInput.value = "";
                                    quotaInput.value = "";
                                  }
                                }}
                              >
                                <Plus size={14} />
                              </IconButton>
                            </ListItem>
                          </List>
                        </Card>
                      </Box>
                    )}
                  </Stack>
                </Grid>

                {/* Preferences section */}
                <Grid xs={12} md={6}>
                  <Stack spacing={3}>
                    <EditableArray
                      label="Preferred recipes"
                      value={mo.preferredRecipes || []}
                      onChange={(arr) => setMenuOption("preferredRecipes", arr)}
                      placeholder="Recipe ID"
                      tooltip="Recipe IDs to prioritize"
                    />

                    <EditableArray
                      label="Avoided recipes"
                      value={mo.avoidedRecipes || []}
                      onChange={(arr) => setMenuOption("avoidedRecipes", arr)}
                      placeholder="Recipe ID"
                      tooltip="Recipe IDs to avoid"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert variant="solid" color="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert variant="solid" color="danger">
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
