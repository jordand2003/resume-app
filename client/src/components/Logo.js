import React from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const Logo = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
      <Box
        sx={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background:
            "linear-gradient(-45deg, #FF6B6B, #4ECDC4, #45b8b0, #FF6B6B)",
          backgroundSize: "400% 400%",
          animation: `${gradientShift} 3s ease infinite`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          L
        </Typography>
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
          backgroundClip: "text",
          textFillColor: "transparent",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Lighthouse
      </Typography>
    </Box>
  );
};

export default Logo;
