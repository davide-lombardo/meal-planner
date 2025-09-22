import { Box, Typography } from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import dayjs from "dayjs";
import { daysOfWeek } from "../utils/constants";

interface MenuHistoryCardProps {
  menu: any;
  idx: number;
  total: number;
}

export default function MenuHistoryCard({ menu, idx, total }: MenuHistoryCardProps) {
  const theme = useTheme();
  const parsedMenu = menu;
  
  let dateLabel = "";
  if (menu.created_at) {
    dateLabel = dayjs(Number(menu.created_at)).format("D MMMM YYYY - HH:mm");
  }

  return (
    <Box
      sx={{
        mb: 4,
        mx: "auto",
        maxWidth: { xs: "100%", sm: 900 },
        backgroundColor: "background.surface",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        // Subtle gradient overlay
        background: `linear-gradient(135deg, 
          ${theme.palette.background.surface} 0%, 
          ${theme.palette.background.level1} 100%)`,
      }}
    >
      {/* Header with solid primary color */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.plainColor,
          p: 3,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1.4rem", sm: "1.8rem" },
            fontWeight: 700,
            color: "primary.solidColor",
            position: "relative",
            zIndex: 1,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          {dateLabel || `Menu #${total - idx}`}
        </Typography>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 20,
            transform: "translateY(-50%)",
            width: 4,
            height: 30,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 2,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: 20,
            transform: "translateY(-50%)",
            width: 4,
            height: 30,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Menu content */}
      <Box sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {daysOfWeek.map((day, i) => (
            <Box
              key={day}
              sx={{
                backgroundColor: "background.level1",
                borderRadius: 2,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s ease",
              }}
            >
              {/* Day header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2.5,
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: "primary.500",
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    fontWeight: 600,
                    color: "text.primary",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {day}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "divider",
                  }}
                />
              </Box>

              {/* Meals grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {/* Pranzo */}
                <Box
                  sx={{
                    backgroundColor: "background.surface",
                    borderRadius: 1.5,
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    minHeight: 80,
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    {/* Removed colored dot before Pranzo */}
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Pranzo
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      color: "text.primary",
                      fontStyle: parsedMenu?.pranzo?.[i]?.nome ? "normal" : "italic",
                      opacity: parsedMenu?.pranzo?.[i]?.nome ? 1 : 0.6,
                      lineHeight: 1.4,
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {parsedMenu?.pranzo?.[i]?.nome || "Non disponibile"}
                  </Typography>
                </Box>

                {/* Cena */}
                <Box
                  sx={{
                    backgroundColor: "background.surface",
                    borderRadius: 1.5,
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    minHeight: 80,
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Cena
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      color: "text.primary",
                      fontStyle: parsedMenu?.cena?.[i]?.nome ? "normal" : "italic",
                      opacity: parsedMenu?.cena?.[i]?.nome ? 1 : 0.6,
                      lineHeight: 1.4,
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {parsedMenu?.cena?.[i]?.nome || "Non disponibile"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9rem",
              color: "text.tertiary",
              fontStyle: "italic",
            }}
          >
            ✨ Buon Appetito ✨
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}