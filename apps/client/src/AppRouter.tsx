import { Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
const Home = lazy(() => import('./pages/Home'));
const RecipeDetails = lazy(() => import('./pages/RecipeDetails'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Header = lazy(() => import('./components/common/Header'));
const ConfigPage = lazy(() => import('./pages/ConfigPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const FindRecipes = lazy(() => import('./pages/FindRecipes'));

export default function AppRouter() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
