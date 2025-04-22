import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import NavBar from "./NavBar";
import StatusChecker from "./StatusChecker";

const ResumeGeneration = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("idle");
  const [jobList, setJobList] = useState([]);
  const [resumeId, setResumeId] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  //const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any existing status when component mounts
    localStorage.removeItem("status");
    localStorage.removeItem("resumeId");
    localStorage.removeItem("error");
    fetchJobList();
  }, [getAccessTokenSilently]); //getAccessTokenSilently, user

  // Fetch Job Descriptions
  const fetchJobList = async () => {
    setGenerationStatus("loading");
    setErrorMessage("");
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("http://localhost:8000/api/job-desc", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setJobList(response.data.data);
      }
      setGenerationStatus("idle");
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch your data. Please try again."
      );
      setGenerationStatus("error");
    } finally {
      if (generationStatus === "loading") {
        setGenerationStatus("idle");
      }
    }
  };

  // Function to generate AI resume
  const handleGenerate = async () => {
    if (!selectedJobId) {
      setErrorMessage("Please select a job you are applying for.");
      return;
    }

    setGenerationStatus("loading");
    setErrorMessage("");
    setResumeId(null);
    setGeneratedMessage("");

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "http://localhost:8000/api/resumes/generate",
        { jobId: selectedJobId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.resumeId) {
        setResumeId(response.data.resumeId);
        setGenerationStatus("success");
        setGeneratedMessage(
          response.data.message || "Resume generation started."
        );

        // Set new status
        localStorage.setItem("resumeId", response.data.resumeId);
        localStorage.setItem("status", "Processing");
      } else {
        throw new Error(
          response.data?.message || "Failed to start resume generation."
        );
      }
    } catch (error) {
      console.error("Error starting resume generation:", error);
      setErrorMessage(
        error.response?.data?.error ||
          error.message ||
          "Failed to start resume generation."
      );
      setGenerationStatus("error");
    }
  };

  const handleJobChange = (event) => {
    setSelectedJobId(event.target.value);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Generate Your Resume
          </Typography>

          {generationStatus === "loading" && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                Starting resume generation...
              </Typography>
            </Box>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {generationStatus !== "loading" && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel id="job-listing-label">
                  Select Job You Are Applying For
                </InputLabel>
                <Select
                  labelId="job-listing-label"
                  id="job-listing"
                  value={selectedJobId}
                  onChange={handleJobChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {jobList.map((job) => (
                    <MenuItem key={job._id} value={job._id}>
                      {job.job_title || "Job"} at {job.company || "Company"}
                    </MenuItem>
                  ))}
                  {jobList.length === 0 && (
                    <MenuItem disabled>No job listings available.</MenuItem>
                  )}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                fullWidth
                disabled={generationStatus === "loading" || !selectedJobId}
                sx={{ mt: 3 }}
              >
                Generate Resume
              </Button>

              <StatusChecker resumeId={resumeId} />

              {generationStatus === "success" && generatedMessage && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {generatedMessage} - Resume ID: {resumeId}
                  <Typography variant="body2" color="text.secondary">
                    You can check the generation status using the Resume ID.
                  </Typography>
                </Alert>
              )}

              {generationStatus === "error" && errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorMessage}
                </Alert>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ResumeGeneration;
