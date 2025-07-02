import * as React from 'react';
import { Box, Typography, Tooltip } from '@mui/joy';
import { Info as InfoIcon } from 'lucide-react';

export interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}
export function Section({ title, description, children }: SectionProps) {
  return (
    <Box sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography level="h2" sx={{ fontWeight: 800, fontSize: { xs: 18, md: 22 }, color: 'text.primary', mr: 1 }}>
          {title}
        </Typography>
        {description && (
          <Tooltip title={description} variant="soft" color="primary" arrow>
            <InfoIcon size={18} style={{ opacity: 0.7, cursor: 'pointer' }} aria-label="Info" tabIndex={0} />
          </Tooltip>
        )}
      </Box>
      {children}
    </Box>
  );
}
