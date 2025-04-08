import React, { useState, useCallback, useMemo } from "react";
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
import Dashboard from "./Dashboard";

const HomePage = () => {
  //console.log("Homepage mounted");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [currentTab, setCurrentTab] = useState(0);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const memoizedGetAccessTokenSilently = useCallback(getAccessTokenSilently, []);

  // Only include user properties that are actually used in the effect
  const userSub = user?.sub;

  React.useEffect(() => {
    const checkAndCreateUser = async () => {
      if (isAuthenticated && user) {
        try {
          const accessToken = await memoizedGetAccessTokenSilently();
          
          // First, check if user exists
          const checkResponse = await fetch(`http://localhost:8000/api/auth/users/${user.sub}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          });

          const textResponse = await checkResponse.text();
          //console.log('Raw response text:', textResponse);
          //console.log(user.sub)

          // User doesn't exist, create them
          //console.log(checkResponse.status)
          if (checkResponse.status === 404) {
            const createResponse = await fetch('http://localhost:8000/api/auth/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                user_id: user.sub,
                email: user.email,
                name: user.name,
              }),
            });

            if (!createResponse.ok) {
              console.error('Failed to create user in database');
            }
          } else if (!checkResponse.ok) {
            console.error('Error checking user existence');
          }
        } catch (error) {
          console.error('Error during user check/creation:', error);
        } finally {
          setIsCheckingUser(false);
        }
      }
    };

    checkAndCreateUser();
  }, [isAuthenticated, userSub, memoizedGetAccessTokenSilently, user]);

  if (isLoading || isCheckingUser) {
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

        {currentTab === 0 && <Dashboard />}
        {currentTab === 1 && <ResumeUpload />}
      </Container>
    </Box>
  );
};

export default HomePage;