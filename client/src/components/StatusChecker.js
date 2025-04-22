import React from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Stack, CircularProgress, Typography, Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { green } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";

const StatusChecker = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [failure, setFailure] = React.useState(false);
  const [ErrorMessage, setErrorMessage] = React.useState("");
  const navigate = useNavigate();

  // Only start checking when a new resume generation begins
  React.useEffect(() => {
    const startTime = localStorage.getItem("resumeGenerationStartTime");
    if (!startTime) {
      // No active resume generation
      setLoading(false);
      setSuccess(false);
      setFailure(false);
      return;
    }

    // Check if this is a stale generation (older than 5 minutes)
    const now = Date.now();
    if (now - parseInt(startTime) > 5 * 60 * 1000) {
      // Clear stale status
      localStorage.removeItem("resumeId");
      localStorage.removeItem("status");
      localStorage.removeItem("error");
      localStorage.removeItem("resumeGenerationStartTime");
      setLoading(false);
      setSuccess(false);
      setFailure(false);
      return;
    }

    if (isAuthenticated) {
      const status = localStorage.getItem("status");
      if (status === "Processing") {
        setLoading(true);
        setSuccess(false);
        setFailure(false);
      } else if (status === "Completed") {
        setSuccess(true);
        setLoading(false);
        setFailure(false);
      } else if (status === "Failed") {
        setFailure(true);
        setLoading(false);
        setSuccess(false);
        setErrorMessage(localStorage.getItem("error") || "Generation failed");
      }
    }
  }, [isAuthenticated]);

  // Periodically check for status if processing
  React.useEffect(() => {
    let timer;
    if (loading && isAuthenticated) {
      timer = setTimeout(() => {
        updateStatus();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [loading, isAuthenticated]);

  async function updateStatus() {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const resumeId = localStorage.getItem("resumeId");
    if (!resumeId) {
      setFailure(true);
      setErrorMessage("No resume ID found");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      const response = await axios.get(
        `http://localhost:8000/api/resumes/status/${resumeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        if (data.status !== localStorage.getItem("status")) {
          localStorage.setItem("status", data.status);
          if (data.status === "COMPLETED") {
            setSuccess(true);
            setLoading(false);
          } else if (data.status === "FAILED") {
            setFailure(true);
            setLoading(false);
          }
        }
      } else {
        localStorage.setItem("status", "Failed");
        localStorage.setItem("error", response.data.message);
        setFailure(true);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setFailure(true);
      if (error.message.includes("Missing Refresh Token")) {
        navigate("/");
        return;
      }
      setErrorMessage("Unable to Retrieve Resume Status: " + error.message);
      console.log("Unable to Retrieve Resume Status:", error);
    }
  }

  return (
    <Stack
      sx={{
        maxWidth: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
        alignItems: "center",
      }}
      spacing={2}
    >
      {loading && <CircularProgress color="secondary" />}
      {success && (
        <CheckIcon
          sx={{
            color: green[500],
          }}
        />
      )}
      {failure && <Alert severity="error">{ErrorMessage}</Alert>}
      {loading && <Typography>Processing...</Typography>}
      {success && <Typography>Completed!</Typography>}
    </Stack>
  );
};

export default StatusChecker;
