import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const ResumeUpload = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle', 'uploading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (
        !file.name.toLowerCase().endsWith(".docx") &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        setErrorMessage("Please upload a DOCX or PDF file");
        return;
      }
      setFile(file);
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file first");
      return;
    }

    try {
      setUploadStatus("uploading");
      setUploadProgress(0);
      setErrorMessage("");

      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("resume", file);

      const response = await axios.post("/api/resume/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
        timeout: 60000, // 60 second timeout
      });
      console.log("Upload response:", response.data);
      if (response.data && response.data.status === "Success") {
        setUploadStatus("success");
        setFile(null);
        setUploadProgress(0);
      } else {
        throw new Error(response.data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload resume. Please try again."
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Your Resume
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Upload your resume in DOCX or PDF format to automatically parse your
          career history.
        </Typography>

        <Box sx={{ mt: 2, mb: 3 }}>
          <input
            accept=".docx,.pdf"
            style={{ display: "none" }}
            id="resume-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="resume-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mr: 2 }}
            >
              Select File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" component="span">
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        {uploadStatus === "uploading" && (
          <Box sx={{ width: "100%", mb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="text.secondary" align="center">
              {uploadProgress}%
            </Typography>
          </Box>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {uploadStatus === "success" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Resume uploaded successfully! Your career history has been updated.
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || uploadStatus === "uploading"}
          fullWidth
        >
          {uploadStatus === "uploading" ? "Uploading..." : "Upload Resume"}
        </Button>
      </Paper>
    </Box>
  );
};

export default ResumeUpload;
