import { Box, Typography, useTheme } from "@mui/joy";
import { ChefHat } from "lucide-react";
import { ColorSchemeToggle } from "../../ThemeProvider";

export default function Header() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.body",
        py: 2,
        px: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "sm",
        mb: 2,
        position: "relative",
      }}
    >
      <Typography
        level="h2"
        sx={{
          color: "text.primary",
          fontWeight: 900,
          letterSpacing: 1,
          transition: "color 0.2s",
          fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
          flex: 1,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <ChefHat
            size={32}
            color={theme.palette.text.primary}
            strokeWidth={1}
          />
          <span
            style={{
              marginLeft: "0",
              fontWeight: 700,
              letterSpacing: "0",
              textTransform: "lowercase",
            }}
          >
            Meal Planner
          </span>
        </Box>
      </Typography>
      <Box
        sx={{
          position: "absolute",
          right: { xs: 12, sm: 24 },
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        <ColorSchemeToggle />
      </Box>
    </Box>
  );
}
