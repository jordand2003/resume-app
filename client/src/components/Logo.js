import React from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import LandingPageLogo from "../../src/landing-page-logo-nbg.png" ;

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
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img src={LandingPageLogo} alt="Logo" style={{height: 60, marginBottom: 12}} ></img>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: "linear-gradient(45deg, #FFFFE0, #4ECDC4)",
          backgroundClip: "text",
          textFillColor: "transparent",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          alignContent: "right"
        }}
      >
        Lighthouse
      </Typography>
    </Box>
  );
};

export default Logo;
