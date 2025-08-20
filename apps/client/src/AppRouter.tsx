import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeDetails from './pages/RecipeDetails';
import HowItWorks from './pages/HowItWorks';
import Header from './components/common/Header';
import ConfigPage from './pages/ConfigPage';
import NotFound from './pages/NotFound';
import FindRecipes from './pages/FindRecipes';

export default function AppRouter() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/find-recipes" element={<FindRecipes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
