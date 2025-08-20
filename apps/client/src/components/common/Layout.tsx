import { Box, Typography, Button, Stack } from "@mui/joy";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import Footer from "../Footer";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  maxWidth?: number;
}

export default function Layout({
  children,
  title,
  subtitle,
  showBackButton = true,
  backButtonPath = "/",
  maxWidth = 1200,
}: LayoutProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.body",
        py: { xs: 3, md: 6 },
        px: { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ maxWidth, mx: "auto", mb: 4 }}>
        {showBackButton && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            sx={{ mb: 3 }}
          >
            <Button
              size="lg"
              color="primary"
              variant="soft"
              onClick={() => navigate(backButtonPath)}
              sx={{ fontWeight: 700, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 40 }}
            >
              <ArrowLeft />
            </Button>
          </Stack>
        )}

        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            level="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 28, md: 36 },
              color: "text.primary",
              mb: 1,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography level="body-lg" sx={{ color: "text.secondary" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth, mx: "auto" }}>{children}</Box>
      {/* Footer */}
      <Footer />
    </Box>
  );
}
