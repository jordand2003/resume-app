import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress sx={{ color: "#4ECDC4" }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Allow social logins (GitHub, Google) even if email_verified is false
  const isSocial =
    user?.sub &&
    (user.sub.startsWith("github|") || user.sub.startsWith("google-oauth2|"));
  if (!user?.email_verified && !isSocial) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
