import { Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { Box, CircularProgress } from "@mui/joy";
const Home = lazy(() => import("./pages/Home"));
const RecipeDetails = lazy(() => import("./pages/RecipeDetails"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Header = lazy(() => import("./components/common/Header"));
const ConfigPage = lazy(() => import("./pages/ConfigPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const DiscoveryPage = lazy(() => import("./pages/DiscoveryPage"));
const MealDetailPage = lazy(() => import("./pages/MealDetailPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ManualMenuPage = lazy(() => import("./pages/ManualMenuPage"));

export default function AppRouter() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            width: "100%",
          }}
        >
          <CircularProgress size="lg" thickness={4} color="primary" />
        </Box>
      }
    >
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/meal/:id" element={<MealDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/manual-menu" element={<ManualMenuPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
