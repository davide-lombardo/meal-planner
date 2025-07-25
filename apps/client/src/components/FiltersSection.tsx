import { 
  Box, 
  Typography, 
  Input, 
  Select, 
  Option, 
  IconButton,
  Chip,
  Badge
} from '@mui/joy';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Category, RecipeType } from 'shared';

interface FilterSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: RecipeType | '';
  onTypeChange: (value: RecipeType | '') => void;
  filterCategory: Category | '';
  onCategoryChange: (value: Category | '') => void;
  types: RecipeType[];
  categories: Category[];
  filteredCount: number;
  totalCount: number;
}

export default function FilterSection({
  search,
  onSearchChange,
  filterType,
  onTypeChange,
  filterCategory,
  onCategoryChange,
  types,
  categories,
  filteredCount,
  totalCount
}: FilterSectionProps) {
  const hasActiveFilters = search || filterType || filterCategory;
  const activeFilterCount = [search, filterType, filterCategory].filter(Boolean).length;

  const clearAllFilters = () => {
    onSearchChange('');
    onTypeChange('');
    onCategoryChange('');
  };

  const clearSearch = () => onSearchChange('');
  
  return (
    <Box sx={{ 
      mb: 4,
      p: 3,
      bgcolor: 'background.surface',
      borderRadius: 16,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 'sm'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge 
            badgeContent={activeFilterCount} 
            color="primary" 
            invisible={!hasActiveFilters}
            sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
          >
            <Filter size={20} />
          </Badge>
          <Typography level="title-md" sx={{ fontWeight: 600 }}>
            Search & Filter
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography level="body-sm" color="neutral">
            {filteredCount} of {totalCount} recipes
          </Typography>
          {hasActiveFilters && (
            <IconButton
              size="sm"
              variant="soft"
              color="neutral"
              onClick={clearAllFilters}
              sx={{ 
                borderRadius: 8,
                '&:hover': { bgcolor: 'danger.softHoverBg' }
              }}
            >
              <RotateCcw size={16} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography level="body-sm" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
          Search recipes
        </Typography>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, ingredients, type, or category..."
          startDecorator={<Search size={18} />}
          endDecorator={
            search && (
              <IconButton
                size="sm"
                variant="plain"
                onClick={clearSearch}
                sx={{ 
                  minHeight: 'unset',
                  minWidth: 'unset',
                  p: 0.5,
                  borderRadius: '50%'
                }}
              >
                <X size={14} />
              </IconButton>
            )
          }
          sx={{
            '--Input-focusedThickness': '2px',
            '--Input-focusedHighlight': 'var(--joy-palette-primary-500)',
            fontSize: '0.95rem',
            py: 1.5,
            borderRadius: 12
          }}
        />
      </Box>

      {/* Filter Dropdowns */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
        mb: hasActiveFilters ? 2 : 0
      }}>
        <Box>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
            Recipe type
          </Typography>
          <Select
            value={filterType}
            onChange={(_, value) => onTypeChange(value || '')}
            placeholder="All types"
            sx={{ 
              borderRadius: 12,
              '--Select-focusedThickness': '2px',
              '--Select-focusedHighlight': 'var(--joy-palette-primary-500)'
            }}
          >
            <Option value="">All types</Option>
            {types.map(type => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Box>

        <Box>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
            Category
          </Typography>
          <Select
            value={filterCategory}
            onChange={(_, value) => onCategoryChange(value || '')}
            placeholder="All categories"
            sx={{ 
              borderRadius: 12,
              '--Select-focusedThickness': '2px',
              '--Select-focusedHighlight': 'var(--joy-palette-primary-500)'
            }}
          >
            <Option value="">All categories</Option>
            {categories.map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography level="body-sm" sx={{ 
            color: 'text.secondary', 
            alignSelf: 'center',
            mr: 1,
            fontWeight: 500
          }}>
            Active filters:
          </Typography>
          
          {search && (
            <Chip
              variant="soft"
              color="primary"
              size="sm"
              endDecorator={
                <IconButton
                  size="sm"
                  onClick={clearSearch}
                  sx={{ 
                    minHeight: 'unset',
                    minWidth: 'unset',
                    p: 0.25,
                    ml: 0.5
                  }}
                >
                  <X size={12} />
                </IconButton>
              }
              sx={{ borderRadius: 8 }}
            >
              Search: "{search.length > 20 ? search.slice(0, 20) + '...' : search}"
            </Chip>
          )}
          
          {filterType && (
            <Chip
              variant="soft"
              color="neutral"
              size="sm"
              endDecorator={
                <IconButton
                  size="sm"
                  onClick={() => onTypeChange('')}
                  sx={{ 
                    minHeight: 'unset',
                    minWidth: 'unset',
                    p: 0.25,
                    ml: 0.5
                  }}
                >
                  <X size={12} />
                </IconButton>
              }
              sx={{ borderRadius: 8 }}
            >
              Type: {filterType}
            </Chip>
          )}
          
          {filterCategory && (
            <Chip
              variant="soft"
              color="neutral"
              size="sm"
              endDecorator={
                <IconButton
                  size="sm"
                  onClick={() => onCategoryChange('')}
                  sx={{ 
                    minHeight: 'unset',
                    minWidth: 'unset',
                    p: 0.25,
                    ml: 0.5
                  }}
                >
                  <X size={12} />
                </IconButton>
              }
              sx={{ borderRadius: 8 }}
            >
              Category: {filterCategory}
            </Chip>
          )}
        </Box>
      )}
    </Box>
  );
}
