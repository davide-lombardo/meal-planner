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
  Tabs,
  TabList,
  Tab,
  TabPanel,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/joy";
import {
  Plus,
  Trash2,
  Save,
  Snowflake,
  Sun,
  Leaf,
  CloudRain,
  Settings,
  Calendar,
  ShoppingCart,
  BarChart3,
  MessageCircle,
  User,
} from "lucide-react";
import { Config, MenuOptions, ConfigSchema, CategorySchema } from "shared/schemas";
import { EditableArray } from "../components/common/EditableArray";
import { FormField } from "../components/common/FormField";
import { CONFIG } from "../utils/constants";
import Layout from "../components/common/Layout";
import { Season } from "shared/schemas";
import CustomSwitch from "../components/CustomSwitch";
import { useTheme } from "../hooks/useTheme";
import { lightTheme, darkTheme } from "../theme";

const getCurrentSeason = (): "spring" | "summer" | "autumn" | "winter" => {
  const now = new Date();
  const month = now.getMonth() + 1;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");
  const [config, setConfig] = React.useState<Config | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  const { actualTheme } = useTheme();
  const themeObj = actualTheme === "dark" ? darkTheme : lightTheme;

  React.useEffect(() => {
    const accessToken = sessionStorage.getItem("kinde_access_token");
    fetch(`${CONFIG.API_BASE_URL}/config`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch config");
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
          return prev;
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
      const accessToken = sessionStorage.getItem("kinde_access_token");
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
            px: { xs: 2, sm: 4 },
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
            px: { xs: 2, sm: 4 },
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
      {/* Sticky Save Button */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          bgcolor: "background.body",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: { xs: 2, sm: 2 },
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 0 },
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: { xs: "flex", sm: "block" },
              justifyContent: "center",
            }}
          >
            {hasUnsavedChanges && (
              <Chip variant="soft" color="warning" size="sm">
                Unsaved changes
              </Chip>
            )}
          </Box>
          <Button
            variant="solid"
            color="primary"
            startDecorator={<Save size={18} />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasUnsavedChanges}
            sx={{
              fontWeight: 600,
              px: 4,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 1, sm: 2 },
          borderRadius: "12px",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value as number)}
          sx={{
            "& .MuiTabList-root": {
              bgcolor: "background.level1",
              borderRadius: "12px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
              p: 0.5,
              mb: 3,
              gap: { xs: 0, sm: 1 },
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              flexDirection: { xs: "column", sm: "row" },
              "& .MuiTabList-scroller": {
                overflow: { xs: "visible", sm: "auto" },
              },
            },
            "& .MuiTab-root": {
              borderRadius: { xs: "8px", sm: "12px" },
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
              transition: "all 0.2s ease",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              py: { xs: 1, sm: 1.5 },
              minHeight: { xs: 36, sm: 44 },
              "&:hover": {
                bgcolor: "background.level2",
              },
              '&[aria-selected="true"]': {
                bgcolor: "background.level2",
                color: themeObj.primary[500],
                borderBottom: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "background.level1",
                },
              },
            },
          }}
        >
          <TabList>
            <Tab>
              <Settings size={16} style={{ marginRight: 8 }} />
              <Box>General</Box>
            </Tab>
            <Tab>
              <Calendar size={16} style={{ marginRight: 8 }} />
              <Box >Seasonal</Box>
            </Tab>
            <Tab>
              <ShoppingCart size={16} style={{ marginRight: 8 }} />
              <Box>
                Ingredients
              </Box>
            </Tab>
            <Tab>
              <BarChart3 size={16} style={{ marginRight: 8 }} />
              <Box>Quotas</Box>
            </Tab>
          </TabList>

          {/* General Tab */}
          <TabPanel value={0} sx={{ px: 0 }}>
            <Box sx={{ mb: 4, p: { xs: 2, sm: 4 }, borderRadius: 3, bgcolor: "background.level1" }}>
              <Typography
                level="h4"
                startDecorator={<Settings size={18} />}
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, mb: 2 }}
              >
                Basic Settings
              </Typography>
              <Stack spacing={4}>
                <Box>
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
                      sx={{ maxWidth: { xs: "100%", sm: 180 } }}
                    />
                  </FormField>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: { xs: 2, sm: 0 },
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "background.level1",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography
                      level="title-sm"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Enable weighted selection
                    </Typography>
                    <Typography
                      level="body-sm"
                      sx={{ color: "text.secondary" }}
                    >
                      Prioritize less-used recipes when generating menus
                    </Typography>
                  </Box>
                  <Box sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                    <CustomSwitch
                      checked={!!mo.useWeightedSelection}
                      onChange={(e) =>
                        setMenuOption(
                          "useWeightedSelection",
                          e.target.checked
                        )
                      }
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ mb: 4, p: { xs: 2, sm: 4 }, borderRadius: 3, bgcolor: "background.level1" }}>
              <Typography
                level="h4"
                startDecorator={<MessageCircle size={18} />}
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, mb: 2 }}
              >
                Telegram Settings
              </Typography>
              <Stack spacing={4}>
                <Box>
                  <FormField
                    label="Default Telegram Chat ID"
                    tooltip="Default Telegram chat ID to send the menu"
                  >
                    <Input
                      type="text"
                      value={mo.telegramChatId ?? ""}
                      onChange={(e) =>
                        setMenuOption("telegramChatId", e.target.value)
                      }
                      placeholder="es. 123456789"
                      sx={{ maxWidth: { xs: "100%", sm: 280 } }}
                    />
                  </FormField>
                </Box>

                <Box>
                  <FormField
                    label="Additional Telegram Chat IDs"
                    tooltip="Other Telegram chat IDs to send the menu"
                  >
                    <Stack
                      spacing={2}
                      sx={{ maxWidth: { xs: "100%", sm: 400 } }}
                    >
                      {(mo.telegramChatIds || []).length > 0 && (
                        <List
                          sx={{
                            "--List-gap": "8px",
                            p: 0,
                            maxWidth: "100%",
                            ml: 0,
                          }}
                        >
                          {(mo.telegramChatIds || []).map(
                            (id: string, idx: number) => (
                              <ListItem
                                key={id}
                                sx={{
                                  px: 0,
                                  py: 1,
                                  alignItems: "center",
                                  minWidth: 0,
                                  width: "100%",
                                  ml: 0,
                                  gap: { xs: 1, sm: 2 },
                                }}
                              >
                                <Input
                                  size="md"
                                  value={id}
                                  type="text"
                                  onChange={(e) => {
                                    const arr = [
                                      ...(mo.telegramChatIds || []),
                                    ];
                                    arr[idx] = e.target.value;
                                    setMenuOption("telegramChatIds", arr);
                                  }}
                                  sx={{
                                    bgcolor: "background.level2",
                                    flex: 1,
                                  }}
                                />
                                <IconButton
                                  size="md"
                                  color="danger"
                                  variant="soft"
                                  onClick={() => {
                                    const arr = [
                                      ...(mo.telegramChatIds || []),
                                    ];
                                    arr.splice(idx, 1);
                                    setMenuOption("telegramChatIds", arr);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </ListItem>
                            )
                          )}
                        </List>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-end",
                        }}
                      >
                        <Input
                          size="md"
                          placeholder="Add new chat ID"
                          id="new-telegram-chat-id"
                          sx={{
                            bgcolor: "background.level2",
                            flex: 1,
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = e.target as HTMLInputElement;
                              const val = input.value.trim();
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
                        <IconButton
                          size="md"
                          variant="soft"
                          color="primary"
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
                        >
                          <Plus size={16} />
                        </IconButton>
                      </Box>
                    </Stack>
                  </FormField>
                </Box>
              </Stack>
            </Box>
          </TabPanel>

          {/* Seasonal Tab */}
          <TabPanel value={1} sx={{ px: 0 }}>
            <Card
              variant="outlined"
              sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}
            >
              <Stack spacing={4}>
                <Box sx={{ textAlign: "left", mb: 2 }}>
                  <Typography
                    level="h2"
                    startDecorator={seasonIcons[mo.currentSeason || "spring"]}
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    Seasonal Settings
                  </Typography>
                  <Typography
                    level="body-md"
                    sx={{ color: "text.secondary", mt: 1 }}
                  >
                    Filter recipes based on the current season
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: { xs: 2, sm: 0 },
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "background.level1",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography
                      level="title-sm"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Enable seasonal filtering
                    </Typography>
                    <Typography
                      level="body-sm"
                      sx={{ color: "text.secondary" }}
                    >
                      Only show recipes for the current season
                    </Typography>
                  </Box>
                  <Box sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                    <CustomSwitch
                      checked={!!mo.enableSeasonalFiltering}
                      onChange={(e) =>
                        handleSeasonalFilteringToggle(e.target.checked)
                      }
                    />
                  </Box>
                </Box>

                <Box sx={{ maxWidth: { xs: "100%", sm: 300 } }}>
                  <FormField
                    label="Current season"
                    tooltip="Select the current season for recipe filtering"
                  >
                    <Select
                      value={mo.currentSeason || getCurrentSeason()}
                      onChange={(_, value) => {
                        if (value) {
                          handleSeasonChange(value as Season);
                        }
                      }}
                      sx={{ width: "100%" }}
                    >
                      {Object.entries(seasonLabels).map(([key, label]) => (
                        <Option key={key} value={key}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            {seasonIcons[key as keyof typeof seasonIcons]}
                            {label}
                          </Box>
                        </Option>
                      ))}
                    </Select>
                  </FormField>
                </Box>

                {mo.enableSeasonalFiltering && (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "primary.50",
                      border: "1px solid",
                      borderColor: "primary.200",
                    }}
                  >
                    <Typography level="body-sm" sx={{ color: "primary.700" }}>
                      <strong>
                        Currently filtering for:{" "}
                        {seasonLabels[mo.currentSeason || "spring"]}
                      </strong>
                      <br />
                      Only recipes marked for this season will be included in
                      menu generation.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </TabPanel>

          {/* Ingredients Tab */}
          <TabPanel value={2} sx={{ px: 0 }}>
            <Card
              variant="outlined"
              sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}
            >
              <Stack spacing={4}>
                <Box sx={{ textAlign: "left", mb: 2 }}>
                  <Typography
                    level="h2"
                    startDecorator={<Leaf size={22} />}
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    Ingredient Planning
                  </Typography>
                  <Typography
                    level="body-md"
                    sx={{ color: "text.secondary", mt: 1 }}
                  >
                    Optimize menus based on available ingredients
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: { xs: 2, sm: 0 },
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "background.level1",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography
                      level="title-sm"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Enable ingredient planning
                    </Typography>
                    <Typography
                      level="body-sm"
                      sx={{ color: "text.secondary" }}
                    >
                      Prefer recipes using your available ingredients
                    </Typography>
                  </Box>
                  <Box sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
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
            </Card>
          </TabPanel>

          {/* Quotas Tab */}
          <TabPanel value={3} sx={{ px: 0 }}>
            <Card
              variant="outlined"
              sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}
            >
              <Stack spacing={4}>
                <Box sx={{ textAlign: "left", mb: 2 }}>
                  <Typography
                    level="h2"
                    startDecorator={<BarChart3 size={22} />}
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    Quotas & Preferences
                  </Typography>
                  <Typography
                    level="body-md"
                    sx={{ color: "text.secondary", mt: 1 }}
                  >
                    Control meal frequency and set recipe preferences
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: { xs: 2, sm: 0 },
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "background.level1",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography
                      level="title-sm"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Use meal type quotas
                    </Typography>
                    <Typography
                      level="body-sm"
                      sx={{ color: "text.secondary" }}
                    >
                      Limit specific meal types per week
                    </Typography>
                  </Box>
                  <Box sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                    <CustomSwitch
                      checked={!!mo.useQuotas}
                      onChange={(e) =>
                        setMenuOption("useQuotas", e.target.checked)
                      }
                    />
                  </Box>
                </Box>

                {mo.useQuotas && (
                  <Box>
                    <Typography
                      level="title-md"
                      sx={{ fontWeight: 600, mb: 3 }}
                    >
                      Weekly quotas by meal type
                    </Typography>
                    <Card variant="soft" sx={{ p: 3, borderRadius: 2 }}>
                      <List sx={{ "--List-gap": "12px" }}>
                        {CategorySchema.options.map(
                          (category) => (
                            <ListItem
                              key={category}
                              sx={{
                                bgcolor: "background.body",
                                borderRadius: 2,
                                px: 3,
                                py: 2,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <ListItemDecorator sx={{ minWidth: 140 }}>
                                <Typography
                                  level="title-sm"
                                  sx={{
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {category}
                                </Typography>
                              </ListItemDecorator>
                              <Box sx={{ ml: "auto" }}>
                                <Input
                                  type="number"
                                  value={mo.mealTypeQuotas?.[category] || 0}
                                  onChange={(e) =>
                                    setMenuOption("mealTypeQuotas", {
                                      ...mo.mealTypeQuotas,
                                      [category]: Number(e.target.value),
                                    })
                                  }
                                  sx={{ maxWidth: 100 }}
                                  size="md"
                                  endDecorator={
                                    <Typography
                                      level="body-sm"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      /week
                                    </Typography>
                                  }
                                />
                              </Box>
                            </ListItem>
                          )
                        )}
                      </List>
                    </Card>
                  </Box>
                )}
              </Stack>
            </Card>
          </TabPanel>
        </Tabs>

        {/* Account Delete Section */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Button
            color="danger"
            variant="soft"
            onClick={() => setDeleteDialogOpen(true)}
            startDecorator={<User size={16} />}
          >
            Delete Account
          </Button>
        </Box>
      </Box>

      {/* Snackbars and Dialogs */}
      <Snackbar
        open={deleteDialogOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          variant="solid"
          color="danger"
          sx={{ minWidth: 320 }}
          endDecorator={
            <Box>
              <Button
                size="sm"
                color="neutral"
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                color="danger"
                loading={deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteError("");
                  try {
                    const token = sessionStorage.getItem("kinde_access_token");
                    const res = await fetch(`${CONFIG.API_BASE_URL}/account`, {
                      method: "DELETE",
                      headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                    });
                    if (!res.ok) {
                      const errText = await res.text();
                      throw new Error(errText || "Failed to delete account");
                    }
                    sessionStorage.removeItem("kinde_access_token");
                    window.location.href = "/";
                  } catch (err) {
                    setDeleteError(
                      err instanceof Error
                        ? err.message
                        : "Failed to delete account"
                    );
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                Confirm Delete
              </Button>
            </Box>
          }
        >
          Are you sure you want to delete your account? This action cannot be
          undone.
          {deleteError && (
            <Typography color="danger" sx={{ mt: 1 }}>
              {deleteError}
            </Typography>
          )}
        </Alert>
      </Snackbar>

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
