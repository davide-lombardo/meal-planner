import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeDetails from './pages/RecipeDetails';
import HowItWorks from './pages/HowItWorks';
import Header from './Header';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </BrowserRouter>
  );
}
