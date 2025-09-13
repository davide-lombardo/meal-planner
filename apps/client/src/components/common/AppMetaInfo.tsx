import React, { useEffect, useState } from "react";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Box, Typography } from "@mui/joy";
import { Monitor, Info, User } from "lucide-react";
import { APP_VERSION } from "../../version";

const getScreenSize = () => `${window.innerWidth} x ${window.innerHeight}`;

const AppMetaInfo: React.FC = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const [date, setDate] = useState(new Date());
  const { user, isAuthenticated } = useKindeAuth();

  useEffect(() => {
    const handleResize = () => setScreenSize(getScreenSize());
    window.addEventListener("resize", handleResize);
    const interval = setInterval(() => setDate(new Date()), 60000);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, []);

  return (
    <Box sx={{
      width: "100%",
      position: "fixed",
      left: 0,
      bottom: 0,
      zIndex: 2000,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      py: 1,
      px: 2,
      bgcolor: "background.level1",
      color: "text.secondary",
      fontSize: 13,
      boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
      borderTop: "1px solid",
      borderColor: "divider"
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Info size={16} style={{ marginRight: 4 }} />
        <Typography level="body-xs" sx={{ fontWeight: 500 }}>
          Version: {APP_VERSION}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <User size={16} style={{ marginRight: 4 }} />
        <Typography level="body-xs" sx={{ fontWeight: 500 }}>
          {isAuthenticated ? `User: ${user?.email || "No email"}` : "Not signed in"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Monitor size={16} style={{ marginRight: 4 }} />
        <Typography level="body-xs" sx={{ fontWeight: 500 }}>
          Screen: {screenSize}
        </Typography>
      </Box>
    </Box>
  );
};

export default AppMetaInfo;
