import * as React from "react";
import { Switch, useColorScheme } from "@mui/joy";
import { useTheme } from "@mui/joy/styles";

interface CustomSwitchProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: object;
  disabled?: boolean;
}

export default function CustomSwitch({
  checked,
  onChange,
  sx,
  disabled,
}: CustomSwitchProps) {
  const { mode } = useColorScheme();
  const theme = useTheme();
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      sx={{
        "--Switch-trackBackground": checked
          ? theme.palette.primary[500]
          : mode === "dark"
          ? theme.palette.neutral.solidBg
          : theme.palette.neutral.solidBg,
        "--Switch-trackColor": checked
          ? theme.palette.text.primary
          : theme.palette.text.primary,
        "--Switch-thumbBackground": checked
          ? theme.palette.primary[700]
          : theme.palette.background.level1,
        '&.Mui-checked:hover': {
          '--Switch-trackBackground': theme.palette.primary[700],
          '--Switch-thumbBackground': theme.palette.primary[900],
        },
        ...sx,
      }}
    />
  );
}
