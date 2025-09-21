import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import { CONFIG, daysOfWeek } from "../utils/constants";
import { Recipe } from "shared/schemas";
import Layout from "../components/common/Layout";
import { Moon, Sun } from "lucide-react";

const CALENDAR_TITLE = "Meal Calendar";
const CALENDAR_SUBTITLE = "Easily browse your planned meals.";

// Types

interface MenuData {
  pranzo: Recipe[];
  cena: Recipe[];
  createdAt?: string; // ISO string, for sorting
  weekStart: string; // YYYY-MM-DD of week start
}

interface SelectedMeal {
  meal: Recipe;
  type: string;
  day: string;
  dayNumber: number; // month day number (1-31)
}

// Utility functions
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function CalendarPage() {
  const theme = useTheme();

  // Store all menus, grouped by weekStart (YYYY-MM-DD)
  const [menusByWeek, setMenusByWeek] = React.useState<Record<string, MenuData>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedMeal, setSelectedMeal] = React.useState<SelectedMeal | null>(
    null
  );

  // Generate calendar events for all weeks, using the latest menu per week
  const getCalendarEvents = React.useCallback(() => {
    const events: any[] = [];
    Object.entries(menusByWeek).forEach(([weekStart, menu]) => {
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(new Date(weekStart).getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        const pranzoMeal = menu.pranzo[i];
        const cenaMeal = menu.cena[i];

        if (pranzoMeal) {
          events.push({
            id: `pranzo-${weekStart}-${i}`,
            title: `${pranzoMeal.nome}`,
            start: dateStr,
            allDay: true,
            backgroundColor: theme.palette.primary[200],
            textColor: theme.palette.primary[900],
            extendedProps: {
              meal: pranzoMeal,
              type: "Pranzo",
              dayIndex: i,
              icon: "lunch",
            },
          });
        }
        if (cenaMeal) {
          events.push({
            id: `cena-${weekStart}-${i}`,
            title: `${cenaMeal.nome}`,
            start: dateStr,
            allDay: true,
            backgroundColor: theme.palette.primary[200],
            textColor: theme.palette.primary[900],
            extendedProps: {
              meal: cenaMeal,
              type: "Cena",
              dayIndex: i,
              icon: "dinner",
            },
          });
        }
      }
    });
    return events;
  }, [menusByWeek, theme.palette]);

  const renderEventContent = (eventInfo: any) => {
    const { meal, type } = eventInfo.event.extendedProps;

    const IconComponent = type === "Pranzo" ? Sun : Moon;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          overflow: "hidden",
          fontSize: "16px",
          color: "inherit",
          width: "100%",
        }}
      >
        <IconComponent size={16} style={{ flexShrink: 0 }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "inherit",
            color: "inherit",
          }}
        >
          {meal.nome}
        </span>
      </Box>
    );
  };

  // Fetch menu data
  React.useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("kinde_access_token");
        const response = await fetch(
          `${CONFIG.API_BASE_URL}/menu/history`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch menu history");
        }
        const data = await response.json();
        if (!data.history || data.history.length === 0) {
          setMenusByWeek({});
        } else {
          // Group menus by weekStart, keep only the latest per week
          const weekMenus: Record<string, MenuData> = {};
          data.history.forEach((menu: any) => {
            // Determine week start (Monday) for this menu
            const createdAt = menu.createdAt || menu.created_at || menu.date || new Date().toISOString();
            const menuDate = new Date(createdAt);
            const weekStartDate = getStartOfWeek(menuDate);
            const weekStartStr = weekStartDate.toISOString().split("T")[0];
            // If multiple menus for the same week, keep the latest
            if (!weekMenus[weekStartStr] || new Date(createdAt) > new Date(weekMenus[weekStartStr].createdAt || 0)) {
              weekMenus[weekStartStr] = {
                pranzo: menu.pranzo || [],
                cena: menu.cena || [],
                createdAt,
                weekStart: weekStartStr,
              };
            }
          });
          setMenusByWeek(weekMenus);
        }
      } catch (error) {
        setError("Failed to load weekly menu");
        console.error("Menu fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);


  const handleMealClick = React.useCallback(
    (meal: Recipe, type: string, dayIndex: number, dateStr: string) => {
      // dateStr is in format YYYY-MM-DD
      const date = new Date(dateStr);
      setSelectedMeal({
        meal,
        type,
        day: daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1],
        dayNumber: date.getDate(),
      });
    },
    []
  );


  const handleCloseModal = React.useCallback(() => {
    setSelectedMeal(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <Layout
        title={CALENDAR_TITLE}
        subtitle={CALENDAR_SUBTITLE}
        showBackButton={false}
      >
        <Card
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: { xs: 2, md: 3 },
            bgcolor: theme.palette.background.level1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress
              size="lg"
              sx={{ color: theme.palette.primary[500] }}
            />
          </Box>
        </Card>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout
        title={CALENDAR_TITLE}
        subtitle={CALENDAR_SUBTITLE}
        showBackButton={false}
      >
        <Card
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: { xs: 2, md: 3 },
            bgcolor: theme.palette.background.level1,
          }}
        >
          <Typography color="danger" level="body-lg" sx={{ color: "#f44336" }}>
            {error}
          </Typography>
        </Card>
      </Layout>
    );
  }

  // No menu state
  if (!menusByWeek || Object.keys(menusByWeek).length === 0) {
    return (
      <Layout
        title={CALENDAR_TITLE}
        subtitle={CALENDAR_SUBTITLE}
        showBackButton={false}
      >
        <Card
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: { xs: 2, md: 3 },
            bgcolor: theme.palette.background.level1,
          }}
        >
          <Typography
            level="body-lg"
            sx={{
              textAlign: "center",
              mt: 4,
              color: theme.palette.text.secondary,
            }}
          >
            No weekly menu found. Generate a menu from the main page!
          </Typography>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      title={CALENDAR_TITLE}
      subtitle={CALENDAR_SUBTITLE}
      showBackButton={false}
    >
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: theme.palette.background.level1,
          "& .fc": {
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            color: theme.palette.text.primary,
          },
          "& .fc-header-toolbar": {
            color: theme.palette.text.primary,
            borderRadius: 1,
            mb: 2,
            p: 1,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            "& .fc-toolbar-chunk": {
              display: "flex",
              alignItems: "center",
              gap: "12px",
            },
          },
          "& .fc-prev-button": {
            marginRight: "12px !important",
          },
          "& .fc-dayGridMonth-button": {
            marginRight: "12px !important",
          },
          "& .fc-toolbar-title": {
            color: `${theme.palette.text.primary} !important`,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            fontWeight: 600,
          },
          "& .fc-button": {
            backgroundColor: `${theme.palette.neutral[300]} !important`,
            color: `black !important`,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            padding: { xs: "4px 8px", sm: "6px 12px" },
            borderRadius: "4px !important",
            border: "none !important",
            "&:hover": {
              backgroundColor: `${theme.palette.neutral[400]} !important`,
            },
            "&:focus": {
              border: "none !important",
              boxShadow: "none !important",
            },
          },
          "& .fc-button-active": {
            backgroundColor: `${theme.palette.primary[500]} !important`,
            border: "none !important",
            color: `white !important`,
            fontWeight: "600 !important",
            "&:hover": {
              backgroundColor: `${theme.palette.primary.solidHoverBg} !important`,
              border: "none !important",
            },
          },
          "& .fc-button:disabled": {
            cursor: "not-allowed",
            backgroundColor: `${theme.palette.neutral[300]} !important`,
            border: "none !important",
          },
          "& .custom-meal-event": {
            fontSize: { xs: "10px", sm: "12px" },
            padding: "2px 4px",
            margin: "1px 0",
            borderRadius: "4px",
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
          "& .fc-event": {
            fontSize: { xs: "10px", sm: "12px" },
            border: "none !important",
          },
          "& .fc-daygrid-event": {
            marginBottom: "2px",
            padding: "1px 3px",
          },
          "& .fc-daygrid-day": {
            minHeight: { xs: "90px", sm: "100px" },
            height: { xs: "90px", sm: "100px" },
            borderColor: theme.palette.divider,
            padding: "0 !important",
          },
          "& .fc-col-header": {
            backgroundColor: theme.palette.background.level2,
            color: theme.palette.text.primary,
            fontWeight: 600,
            borderColor: theme.palette.divider,
          },
          "& .fc-col-header-cell": {
            backgroundColor: theme.palette.background.level2,
            color: theme.palette.text.primary,
          },
          "& .fc-today": {
            backgroundColor: `${theme.palette.primary.softBg} !important`,
          },
          "& .fc-daygrid-day-frame": {
            minHeight: { xs: "90px", sm: "100px" },
            height: { xs: "90px", sm: "100px" },
            padding: "0 !important",
          },
          "& .fc-daygrid-day-top": {
            padding: "4px 6px !important",
          },
          "& .fc-scrollgrid": {
            borderColor: theme.palette.divider,
          },
          "& .fc-scrollgrid-sync-table": {
            borderColor: theme.palette.divider,
          },
          "& .fc-dayGridWeek-view .fc-col-header-cell .fc-col-header-cell-cushion":
            {
              "& .fc-day-other": {
                display: "none",
              },
            },
        }}
      >
        <FullCalendar
          height="auto"
          buttonText={{
            today: "Jump to Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          titleFormat={{
            month: "long",
            year: "numeric",
          }}
          initialView="dayGridWeek"
          firstDay={1}
          plugins={[dayGridPlugin, interactionPlugin]}
          dayHeaderFormat={{
            weekday: "short",
            day: "numeric",
          }}
          events={getCalendarEvents()}
          eventContent={renderEventContent}
          eventClick={(info) => {
            const { meal, type, dayIndex } = info.event.extendedProps;
            handleMealClick(meal, type, dayIndex, info.event.startStr);
          }}
          eventDisplay="block"
          dayMaxEvents={false}
          moreLinkClick="popover"
          eventClassNames="custom-meal-event"
          editable={false}
          selectable={false}
          validRange={{
            start: new Date(2020, 0, 1),
            end: new Date(2030, 11, 31),
          }}
        />
      </Card>

      <MealDetailModal selectedMeal={selectedMeal} onClose={handleCloseModal} />
    </Layout>
  );
}

// Modal component for meal details
interface MealDetailModalProps {
  selectedMeal: SelectedMeal | null;
  onClose: () => void;
}

function MealDetailModal({ selectedMeal, onClose }: MealDetailModalProps) {
  const theme = useTheme();

  return (
    <Modal open={!!selectedMeal} onClose={onClose}>
      <ModalDialog
        sx={{
          minWidth: { xs: 280, sm: 320 },
          maxWidth: { xs: 350, sm: 400 },
          mx: 2,
          bgcolor: theme.palette.background.level1,
          color: theme.palette.text.primary,
        }}
      >
        <ModalClose />
        {selectedMeal && (
          <Box>
            <Typography
              level="h3"
              startDecorator={
                selectedMeal.type === "Pranzo" ? <Sun /> : <Moon />
              }
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                color: theme.palette.text.primary,
                width: "100%",
              }}
            >
              {selectedMeal.type} - {selectedMeal.day} {selectedMeal.dayNumber}
            </Typography>

            <Typography
              level="title-md"
              sx={{
                mb: 1,
                fontSize: { xs: "1rem", sm: "1.125rem" },
                color: theme.palette.text.primary,
              }}
            >
              {selectedMeal.meal.nome}
            </Typography>

            {selectedMeal.meal.ingredienti.length > 0 && (
              <Typography
                level="body-sm"
                sx={{
                  mt: 1,
                  lineHeight: 1.4,
                  color: theme.palette.text.secondary,
                }}
              >
                <strong style={{ color: theme.palette.text.primary }}>
                  Ingredienti:
                </strong>{" "}
                {selectedMeal.meal.ingredienti.join(", ")}
              </Typography>
            )}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}
