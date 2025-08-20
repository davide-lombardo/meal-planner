import * as React from "react";
import { Box, Typography } from "@mui/joy";
import { useTheme } from "@mui/joy/styles";

const Footer: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.body",
        color: "text.secondary",
        textAlign: "center",
        py: 4,
        mt: 8,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography level="body-md" sx={{ mb: 1 }}>
        <Typography
          component={"span"}
          sx={{
            display: "inline",
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          Meal Planner
        </Typography>
        &copy; {new Date().getFullYear()} |{" "}
        <a
          href="https://undraw.co/"
          style={{ color: "inherit", textDecoration: "underline" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Illustrations by unDraw
        </a>
      </Typography>
      <Typography level="body-sm" sx={{ mt: 1 }}>
        <a
          href="/how-it-works"
          style={{
            color: theme.palette.primary.solidBg,
            textDecoration: "underline",
            fontWeight: 600,
            fontSize: 15,
            opacity: 0.9,
          }}
        >
          How it works
        </a>
      </Typography>
    </Box>
  );
};

export default Footer;
