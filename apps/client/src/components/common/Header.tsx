import React from "react";
import { Box, Typography, useTheme } from "@mui/joy";
import { ColorSchemeToggle } from "../../ThemeProvider";
import { IconButton, Menu, MenuItem, ListItemDecorator } from "@mui/joy";
import { User, LogIn, UserPlus, LogOut, Settings, ChefHat } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export default function Header() {
  const theme = useTheme();
  const { login, logout, register, user, isAuthenticated } = useKindeAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement> | null) => {
    if (event) {
      setAnchorEl(event.currentTarget);
    }
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
          <Box sx={{ display: { xs: "none", sm: "inline-block" } }}>
            <ChefHat size={32} />
          </Box>
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0",
              color: theme.palette.primary.solidActiveBg,
            }}
          >
            Meal
          </span>
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0",
              color: theme.palette.text.primary,

              marginLeft: -4,
            }}
          >
            Planner
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
        <IconButton
          onClick={(event) => {
            if (open) {
              handleMenuClose();
            } else {
              handleMenuOpen(event);
            }
          }}
          size="md"
          variant="plain"
          aria-label="user-menu"
        >
          <User size={24} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          placement="bottom-end"
          sx={{ minWidth: 220, p: 1 }}
        >
          {isAuthenticated ? (
            <Box>
              <Typography
                level="body-xs"
                sx={{
                  px: 1,
                  pt: 1,
                  pb: 0.5,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                Signed in as
              </Typography>
              <MenuItem
                disabled
                sx={{ mb: 1, bgcolor: "background.level1", borderRadius: 2 }}
              >
                <Typography
                  level="body-sm"
                  sx={{ fontWeight: 700, color: "primary.solidBg" }}
                >
                  {user?.email || "No email"}
                </Typography>
              </MenuItem>
              <Typography
                level="body-xs"
                sx={{
                  px: 1,
                  pt: 0.5,
                  pb: 0.5,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                Account
              </Typography>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  window.location.href = "/config";
                }}
                sx={{ borderRadius: 2, mb: 1 }}
              >
                <ListItemDecorator>
                  <Settings size={18} />
                </ListItemDecorator>
                Settings
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  logout();
                }}
                sx={{ borderRadius: 2 }}
              >
                <ListItemDecorator>
                  <LogOut size={18} />
                </ListItemDecorator>
                Logout
              </MenuItem>
            </Box>
          ) : (
            <Box>
              <Typography
                level="body-xs"
                sx={{
                  px: 1,
                  pt: 1,
                  pb: 0.5,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                Welcome
              </Typography>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  login();
                }}
                sx={{ borderRadius: 2, mb: 1 }}
              >
                <ListItemDecorator>
                  <LogIn size={18} />
                </ListItemDecorator>
                Login
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  register();
                }}
                sx={{ borderRadius: 2 }}
              >
                <ListItemDecorator>
                  <UserPlus size={18} />
                </ListItemDecorator>
                Register
              </MenuItem>
            </Box>
          )}
        </Menu>
      </Box>
    </Box>
  );
}
