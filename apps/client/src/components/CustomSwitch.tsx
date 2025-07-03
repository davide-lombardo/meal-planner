import * as React from 'react';
import { Switch, useColorScheme } from '@mui/joy';

interface CustomSwitchProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: object;
  disabled?: boolean;
}

export default function CustomSwitch({ checked, onChange, sx, disabled }: CustomSwitchProps) {
  const { mode } = useColorScheme();
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      sx={{
        '--Switch-trackBackground': checked
          ? 'var(--joy-palette-warning-solidBg, #ff8500)'
          : mode === 'dark'
          ? 'var(--joy-palette-neutral-700, #444)'
          : 'var(--joy-palette-neutral-300, #ccc)',
        '--Switch-trackColor': checked
          ? 'var(--joy-palette-warning-solidColor, #fff)'
          : 'var(--joy-palette-text-primary, #222)',
        '--Switch-thumbBackground': checked
          ? 'var(--joy-palette-warning-solidColor, #fff)'
          : 'var(--joy-palette-background-surface, #fff)',
        ...sx,
      }}
    />
  );
}
