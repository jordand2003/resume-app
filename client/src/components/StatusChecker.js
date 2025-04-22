import React from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Stack, CircularProgress, Typography, Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { green } from "@mui/material/colors";

const StatusChecker = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [failure, setFailure] = React.useState(false);
  const [ErrorMessage, setErrorMessage] = React.useState("");

  // Check status only when there's an active generation
  React.useEffect(() => {
    const status = localStorage.getItem("status");
    const resumeId = localStorage.getItem("resumeId");

    // Only start checking if we have both a status and resumeId
    if (status && resumeId) {
      if (status === "COMPLETED") {
        setSuccess(true);
        setLoading(false);
      } else if (status === "Processing") {
        setLoading(true);
        setSuccess(false);
      } else if (status === "FAILED") {
        setFailure(true);
        setLoading(false);
        setErrorMessage(localStorage.getItem("error") || "Generation failed");
      }
    }

    // Cleanup function to clear status on unmount
    return () => {
      localStorage.removeItem("status");
      localStorage.removeItem("resumeId");
      localStorage.removeItem("error");
    };
  }, []);

  // Periodically check for status if processing
  React.useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        updateStatus();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  async function updateStatus() {
    let resumeId = localStorage.getItem("resumeId");
    if (!resumeId) {
      setFailure(true);
      setErrorMessage("No resume ID found");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `http://localhost:8000/api/resumes/status/${resumeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      if (data.status !== localStorage.getItem("status")) {
        localStorage.setItem("status", data.status);
        if (data.status === "COMPLETED") {
          setSuccess(true);
          setLoading(false);
        } else if (data.status === "FAILED") {
          setFailure(true);
          setLoading(false);
          setErrorMessage(data.message || "Generation failed");
        }
      }
    } catch (error) {
      console.error("Status check error:", error);
      setLoading(false);
      setFailure(true);
      setErrorMessage(error.response?.data?.message || error.message);
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
