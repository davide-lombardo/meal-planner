import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Stack, Card, CardContent, Select, Option } from '@mui/joy';
import Skeleton from '@mui/joy/Skeleton';
import Layout from '../components/common/Layout';
import JoyPagination from '../components/JoyPagination';
import DiscoveryRecipeCard from '../components/DiscoveryRecipeCard';
import DiscoveryFilterSection from '../components/DiscoveryFilterSection';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

const DEFAULT_PAGE_SIZE = 10;

export default function DiscoveryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [area, setArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchAreas();
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [search, category, area, page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
      const data = await res.json();
      setCategories(data.meals.map((c: any) => c.strCategory));
    } catch {
      setCategories([]);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
      const data = await res.json();
      setAreas(data.meals.map((a: any) => a.strArea));
    } catch {
      setAreas([]);
    }
  };

  const fetchMeals = async () => {
    setLoading(true);
    setError('');
    let url = '';
    if (search) {
      url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`;
    } else if (category) {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    } else if (area) {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;
    } else {
      url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      setMeals(data.meals ? data.meals : []);
    } catch {
      setError('Failed to fetch meals');
      setMeals([]);
    }
    setLoading(false);
  };

  // Pagination logic
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const paginatedMeals = meals.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.ceil(meals.length / pageSize);

  return (
    <Layout
      title="Discover Recipes"
      subtitle="Browse thousands of international recipes, filter by cuisine and category, and find inspiration for your next meal. Use this page to quickly discover new dishes and expand your culinary horizons."
      showBackButton={false}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
        <DiscoveryFilterSection
          search={search}
          onSearchChange={value => { setSearch(value); setPage(1); }}
          category={category}
          onCategoryChange={value => { setCategory(value); setPage(1); }}
          categories={categories}
          area={area}
          onAreaChange={value => { setArea(value); setPage(1); }}
          areas={areas}
          filteredCount={meals.length}
          totalCount={meals.length}
          onReset={() => { setSearch(''); setCategory(''); setArea(''); setPage(1); }}
        />
      </Box>
      {loading ? (
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, py: 2 }}>
          <Stack direction="row" flexWrap="wrap" spacing={3} useFlexGap sx={{ justifyContent: 'flex-start', minHeight: 200 }}>
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                variant="soft"
                sx={{
                  bgcolor: 'neutral.solidBg',
                  width: 340,
                  height: 220,
                  mb: 3,
                  borderRadius: 12,
                  boxShadow: 'md',
                  p: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}
              >
                <CardContent sx={{ p: 3, pt: 2.5, pb: 1.5 }}>
                  <Skeleton variant="text" width={180} height={32} sx={{ mb: 2, borderRadius: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 10 }} />
                    <Skeleton variant="rectangular" width={40} height={20} sx={{ borderRadius: 10 }} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      ) : error ? (
        <Typography color="danger">{error}</Typography>
      ) : (
        <>
          <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, py: 2 }}>
            <Stack direction="row" flexWrap="wrap" spacing={3} useFlexGap sx={{ justifyContent: 'flex-start' }}>
              {paginatedMeals.map(meal => (
                <DiscoveryRecipeCard
                  key={meal.idMeal}
                  id={meal.idMeal}
                  title={meal.strMeal}
                  image={meal.strMealThumb}
                  category={meal.strCategory}
                  area={meal.strArea}
                />
              ))}
            </Stack>
          </Box>
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 6, mb: 2, gap: 2, flexWrap: 'wrap' }}>
              <JoyPagination
                page={page}
                total={meals.length}
                pageSize={pageSize}
                onPageChange={setPage}
              />
              <Typography level="body-md" sx={{ ml: 2 }}>
                Recipes per page:
              </Typography>
              <Box>
                <Select
                  value={pageSize}
                  onChange={(event, value) => value && setPageSize(Number(value))}
                  size="md"
                  color="neutral"
                  variant="outlined"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <Option key={size} value={size}>
                      {size}
                    </Option>
                  ))}
                </Select>
              </Box>
            </Box>
          )}
        </>
      )}
    </Layout>
  );
}
