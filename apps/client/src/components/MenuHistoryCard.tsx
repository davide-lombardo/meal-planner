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
        maxWidth: { xs: "100%", sm: 800 },
        backgroundColor: "background.level1",
        border: "3px solid",
        borderColor: "primary.700",
        borderRadius: 0,
        boxShadow: "shadow.lg",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          opacity: 0.3,
        },
      }}
    >
      {/* Decorative corner flourishes */}
      <Box
        sx={{
          position: "absolute",
          top: 15,
          left: 15,
          width: 30,
          height: 30,
          border: "2px solid",
          borderColor: "primary.700",
          borderRight: "none",
          borderBottom: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: -2,
            width: 10,
            height: 10,
            border: "2px solid",
            borderColor: "primary.700",
            borderRight: "none",
            borderBottom: "none",
          }}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 15,
          right: 15,
          width: 30,
          height: 30,
          border: "2px solid",
          borderColor: "primary.700",
          borderLeft: "none",
          borderBottom: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 10,
            height: 10,
            border: "2px solid",
            borderColor: "primary.700",
            borderLeft: "none",
            borderBottom: "none",
          }}
        />
      </Box>
      <Box sx={{ p: 4, pt: 5, position: "relative", zIndex: 1 }}>
        {/* Menu Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            borderBottom: "2px solid",
            borderColor: "primary.700",
            pb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "1.5rem", sm: "2.5rem" },
              fontFamily: "inherit",
              fontWeight: "bold",
              color: "primary.700",
              letterSpacing: "0.1em",
              mb: 1,
            }}
          >
            {dateLabel || `Menu #${total - idx}`}
          </Typography>
        </Box>
        {/* Days Grid */}
        <Box>
          {daysOfWeek.map((day, i) => (
            <Box
              key={day}
              sx={{
                mb: 3,
                borderBottom: i < 6 ? "1px dotted" : "none",
                borderColor: "primary.500",
                pb: i < 6 ? 3 : 0,
              }}
            >
              {/* Day Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    height: 1,
                    bgcolor: "primary.500",
                    opacity: 0.4,
                  }}
                />
                <Typography
                  sx={{
                    mx: 3,
                    fontSize: { xs: "1.1rem", sm: "1.4rem" },
                    fontFamily: "inherit",
                    fontWeight: "bold",
                    color: "primary.700",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {day}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    height: 1,
                    bgcolor: "primary.500",
                    opacity: 0.4,
                  }}
                />
              </Box>
              {/* Meal Items */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: { xs: 2, sm: 4 },
                  px: { xs: 0, sm: 2 },
                }}
              >
                {/* Pranzo */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1.1rem" },
                      fontFamily: "inherit",
                      fontWeight: "bold",
                      color: "primary.700",
                      mb: 1,
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Pranzo
                  </Typography>
                  <Box
                    sx={{
                      minHeight: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "primary.100",
                      border: "1px dashed",
                      borderColor: "primary.500",
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        fontFamily: "inherit",
                        color: theme.palette.primary[900],
                        fontStyle: parsedMenu?.pranzo?.[i]?.nome
                          ? "normal"
                          : "italic",
                        textAlign: "center",
                        lineHeight: 1.4,
                        opacity: parsedMenu?.pranzo?.[i]?.nome ? 1 : 0.7,
                      }}
                    >
                      {parsedMenu?.pranzo?.[i]?.nome || "— Non disponibile —"}
                    </Typography>
                  </Box>
                </Box>
                {/* Cena */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontFamily: "inherit",
                      fontWeight: "bold",
                      color: "primary.700",
                      mb: 1,
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Cena
                  </Typography>
                  <Box
                    sx={{
                      minHeight: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "primary.100",
                      border: "1px dashed",
                      borderColor: "primary.500",
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        fontFamily: "inherit",
                        color: theme.palette.primary[900],
                        fontStyle: parsedMenu?.cena?.[i]?.nome
                          ? "normal"
                          : "italic",
                        textAlign: "center",
                        lineHeight: 1.4,
                        opacity: parsedMenu?.cena?.[i]?.nome ? 1 : 0.7,
                      }}
                    >
                      {parsedMenu?.cena?.[i]?.nome || "— Non disponibile —"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        {/* Footer decoration */}
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            pt: 3,
            borderTop: "2px solid",
            borderColor: "primary.700",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              fontFamily: "inherit",
              fontStyle: "italic",
              color: "primary.700",
              opacity: 0.7,
            }}
          >
            ✦ Buon Appetito ✦
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}