import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/joy";

interface DiscoveryRecipeCardProps {
  title: string;
  image: string;
  category: string;
  area: string;
  id: string;
}

const DiscoveryRecipeCard: React.FC<DiscoveryRecipeCardProps> = ({
  title,
  image,
  category,
  area,
  id,
}) => {
  const displayCategory = category && category.trim() ? category : "Unknown";
  const displayArea = area && area.trim() ? area : "Unknown";
  return (
    <Card
      variant="soft"
      sx={{
        bgcolor: "background.level1",
        color: "text.primary",
        width: { xs: "100%", sm: 340 },
        height: 320,
        mb: 3,
        borderRadius: 12,
        boxShadow: "md",
        position: "relative",
        overflow: "hidden",
        p: 0,
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": {
          transform: "translateY(-4px) scale(1.025)",
          boxShadow: "lg",
          "& .discovery-card-img": {
            transform: "scale(1.08)",
          },
        },
      }}
      onClick={() => window.open(`/meal/${id}`, "_blank")}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s cubic-bezier(.25,.8,.25,1)",
            willChange: "transform",
          }}
          className="discovery-card-img"
        />
        {/* Blur overlay at bottom */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "25%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.09) 65%, rgba(0,0,0,0.04) 85%, rgba(0,0,0,0.0) 100%)",
            backdropFilter: "blur(18px)",
            zIndex: 2,
          }}
        />
      </Box>
      <CardContent
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          p: 3,
          pt: 2.5,
          pb: 1.5,
          display: "flex",
          flexDirection: "column",
          height: "auto",
          background: "none",
        }}
      >
        <Typography
          level="h3"
          sx={{
            fontWeight: 900,
            fontSize: 22,
            lineHeight: 1.2,
            mb: 1,
            pr: 0,
            minWidth: 0,
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "unset",
            color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            transition: "padding-right 0.2s",
          }}
          title={title}
        >
          {title}
        </Typography>
        <Box sx={{ mt: "auto", display: "flex", gap: 1, alignItems: "center" }}>
          <Box
            sx={{
              px: 1.2,
              py: 0.3,
              border: "1.5px solid #ccc",
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.25)",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {displayCategory}
          </Box>
          <Box
            sx={{
              px: 0.6,
              py: 0.2,
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.15)",
              borderRadius: 2,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 0.8,
              userSelect: "none",
              alignSelf: "center",
              minWidth: 40,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {displayArea}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default DiscoveryRecipeCard;
