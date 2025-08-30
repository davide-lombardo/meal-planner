import { Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/joy';
const Home = lazy(() => import('./pages/Home'));
const RecipeDetails = lazy(() => import('./pages/RecipeDetails'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Header = lazy(() => import('./components/common/Header'));
const ConfigPage = lazy(() => import('./pages/ConfigPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const FindRecipes = lazy(() => import('./pages/FindRecipes'));

export default function AppRouter() {
  return (
    <Suspense fallback={
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
      }}>
        <CircularProgress size="lg" thickness={4} color="primary" />
      </Box>
    }>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/find-recipes" element={<FindRecipes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
