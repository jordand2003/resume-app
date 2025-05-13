import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

const moveParticle = keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(var(--move-x, 0), var(--move-y, 0));
  }
`;

const Particle = ({ size, color, delay, x, y }) => (
  <Box
    sx={{
      position: "absolute",
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: "50%",
      opacity: 0.6,
      animation: `${moveParticle} 4s infinite alternate`,
      animationDelay: delay,
      "--move-x": x,
      "--move-y": y,
      pointerEvents: "none"
    }}
  />
);

const ParticlesBackground = () => {
  const particles = [
    {
      size: "8px",
      color: "#4ECDC4",
      delay: "0s",
      x: "20px",
      y: "20px",
      left: "10%",
      top: "20%",
    },
    {
      size: "12px",
      color: "#FF6B6B",
      delay: "0.5s",
      x: "-30px",
      y: "40px",
      left: "20%",
      top: "40%",
    },
    {
      size: "15px",
      color: "#4ECDC4",
      delay: "1s",
      x: "40px",
      y: "-30px",
      left: "30%",
      top: "60%",
    },
    {
      size: "10px",
      color: "#FF6B6B",
      delay: "1.5s",
      x: "-20px",
      y: "-20px",
      left: "40%",
      top: "25%",
    },
    {
      size: "14px",
      color: "#4ECDC4",
      delay: "2s",
      x: "30px",
      y: "30px",
      left: "60%",
      top: "35%",
    },
    {
      size: "8px",
      color: "#FF6B6B",
      delay: "2.5s",
      x: "-40px",
      y: "20px",
      left: "70%",
      top: "65%",
    },
    {
      size: "12px",
      color: "#4ECDC4",
      delay: "3s",
      x: "20px",
      y: "-40px",
      left: "80%",
      top: "45%",
    },
    {
      size: "10px",
      color: "#FF6B6B",
      delay: "3.5s",
      x: "-30px",
      y: "-30px",
      left: "90%",
      top: "25%",
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none"
      }}
    >
      {particles.map((particle, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: particle.left,
            top: particle.top,
          }}
        >
          <Particle {...particle} />
        </Box>
      ))}
    </Box>
  );
};

export default ParticlesBackground;
