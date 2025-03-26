import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import NavBar from "./NavBar";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h3" component="h1" color="primary" gutterBottom>
          Welcome, {user?.name || user?.email || "User"}!
        </Typography>
      </Container>
    </Box>
  );
};

export default HomePage;
