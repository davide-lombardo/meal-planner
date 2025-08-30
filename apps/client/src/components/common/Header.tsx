import React from "react";
import { Box, Typography, useTheme } from "@mui/joy";
import { ChefHat } from "lucide-react";
import { ColorSchemeToggle } from "../../ThemeProvider";
import { IconButton, Menu, MenuItem, Avatar, ListItemDecorator } from "@mui/joy";
import { User } from "lucide-react";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function Header() {
  const theme = useTheme();
  const { login, logout, register, user, isAuthenticated } = useKindeAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.body",
        py: 2,
        px: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "sm",
        mb: 2,
        position: "relative",
      }}
    >
      <Typography
        level="h2"
        sx={{
          color: "text.primary",
          fontWeight: 900,
          letterSpacing: 1,
          transition: "color 0.2s",
          fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
          flex: 1,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <ChefHat
            size={32}
            color={theme.palette.text.primary}
            strokeWidth={1}
          />
          <span
            style={{
              marginLeft: "0",
              fontWeight: 700,
              letterSpacing: "0",
              textTransform: "lowercase",
            }}
          >
            Meal Planner
          </span>
        </Box>
      </Typography>
      <Box
        sx={{
          position: "absolute",
          right: { xs: 12, sm: 24 },
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          height: "100%",
          gap: 1,
        }}
      >
        <ColorSchemeToggle />
        <IconButton onClick={handleMenuOpen} size="md" variant="plain" aria-label="user-menu">
          <Avatar variant="outlined" size="md">
            <User size={20} />
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} placement="bottom-end">
          {isAuthenticated ? (
            <>
              <MenuItem disabled>
                <ListItemDecorator>
                  <User size={18} />
                </ListItemDecorator>
                {user?.email || "No email"}
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                Logout
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => { handleMenuClose(); login(); }}>
                Login
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); register(); }}>
                Register
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>
    </Box>
  );
}
