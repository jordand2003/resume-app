import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import NavBar from "./NavBar";
import ResumeUpload from "./ResumeUpload";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [currentTab, setCurrentTab] = useState(0);

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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Welcome, {user?.name || user?.email || "User"}!
        </Typography>

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Dashboard" />
            <Tab label="Upload Resume" />
          </Tabs>
        </Paper>

        {currentTab === 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Your Dashboard
            </Typography>
            {/* Add dashboard content here */}
          </Box>
        )}

        {currentTab === 1 && (
          <Box sx={{ mt: 2 }}>
            <ResumeUpload />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
