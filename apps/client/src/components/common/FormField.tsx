import * as React from 'react';
import { Box, Typography, Tooltip } from '@mui/joy';
import { Info as InfoIcon } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}
export function FormField({ label, tooltip, children, htmlFor, required }: FormFieldProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography component="label" htmlFor={htmlFor} level="body-sm" sx={{ fontWeight: 600 }}>
          {label}{required ? ' *' : ''}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} variant="soft" color="primary" arrow>
            <InfoIcon size={15} style={{ marginLeft: 4, opacity: 0.7, cursor: 'pointer' }} aria-label="Info" tabIndex={0} />
          </Tooltip>
        )}
      </Box>
      {children}
    </Box>
  );
}
