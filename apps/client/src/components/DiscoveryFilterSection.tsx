import React from 'react';
import { Box, Typography, Input, Select, Option, IconButton, Badge, Button } from '@mui/joy';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface DiscoveryFilterSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  area: string;
  onAreaChange: (value: string) => void;
  areas: string[];
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
}

const DiscoveryFilterSection: React.FC<DiscoveryFilterSectionProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  area,
  onAreaChange,
  areas,
  filteredCount,
  totalCount,
  onReset,
}) => {
  const hasActiveFilters = !!search || !!category || !!area;
  const activeFilterCount = [search, category, area].filter(Boolean).length;

  return (
    <Box sx={{ mb: 4, p: 3, bgcolor: 'background.surface', borderRadius: 16, border: '1px solid', borderColor: 'divider', boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={activeFilterCount} color="primary" invisible={!hasActiveFilters}>
            <SlidersHorizontal size={20} />
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
            <IconButton size="sm" variant="soft" color="neutral" onClick={onReset} sx={{ borderRadius: 8, '&:hover': { bgcolor: 'danger.softHoverBg' } }}>
              <RotateCcw size={16} />
            </IconButton>
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography level="body-sm" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
          Search recipes
        </Typography>
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name..."
          startDecorator={<Search size={18} />}
          endDecorator={search && (
            <IconButton size="sm" variant="plain" onClick={() => onSearchChange('')} sx={{ minHeight: 'unset', minWidth: 'unset', p: 0.5, borderRadius: '50%' }}>
              <X size={14} />
            </IconButton>
          )}
          sx={{ '--Input-focusedThickness': '2px', '--Input-focusedHighlight': 'var(--joy-palette-primary-500)', fontSize: '0.95rem', py: 1.5, borderRadius: 12 }}
        />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
            Category
          </Typography>
          <Select
            value={category}
            onChange={(_, value) => onCategoryChange(value || '')}
            placeholder="All categories"
            sx={{ borderRadius: 12, '--Select-focusedThickness': '2px', '--Select-focusedHighlight': 'var(--joy-palette-primary-500)' }}
          >
            <Option value="">All categories</Option>
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
            Area
          </Typography>
          <Select
            value={area}
            onChange={(_, value) => onAreaChange(value || '')}
            placeholder="All areas"
            sx={{ borderRadius: 12, '--Select-focusedThickness': '2px', '--Select-focusedHighlight': 'var(--joy-palette-primary-500)' }}
          >
            <Option value="">All areas</Option>
            {areas.map(a => (
              <Option key={a} value={a}>{a}</Option>
            ))}
          </Select>
        </Box>
      </Box>
    </Box>
  );
};

export default DiscoveryFilterSection;
