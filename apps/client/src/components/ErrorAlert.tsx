import * as React from 'react';
import { Alert } from '@mui/joy';
import { Search } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  icon?: React.ReactNode;
  sx?: object;
}

export default function ErrorAlert({ message, icon, sx }: ErrorAlertProps) {
  return (
    <Alert
      color="warning"
      variant="soft"
      sx={{
        mb: 2,
        maxWidth: 600,
        mx: 'auto',
        border: '1px solid',
        borderColor: 'warning.solidBg',
        bgcolor: 'warning.softBg',
        color: 'text.primary',
        fontWeight: 500,
        fontSize: '16px',
        alignItems: 'center',
        gap: 1.5,
        ...sx,
      }}
      startDecorator={icon ?? <Search style={{ opacity: 0.7 }} />}
    >
      {message}
    </Alert>
  );
}
