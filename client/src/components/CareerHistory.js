import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Snackbar,
} from "@mui/material";

const CareerHistory = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    fetchCareerHistory();
  }, []);

  const fetchCareerHistory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("/api/career-history/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.data) {
        setHistory(response.data.data);
        // If there's existing data, convert it to text format
        if (response.data.data.length > 0) {
          const latestHistory = response.data.data[0];
          const text = convertHistoryToText(latestHistory);
          setText(text);
        }
      }
    } catch (error) {
      setError("Failed to fetch career history");
    } finally {
      setLoading(false);
    }
  };

  const convertHistoryToText = (history) => {
    let text = "";

    if (history.work_experience) {
      history.work_experience.forEach((job) => {
        text += `Work Experience:\n`;
        text += `Company: ${job.Company}\n`;
        text += `Position: ${job.Job_Title}\n`;
        text += `Location: ${job.Location}\n`;
        text += `Duration: ${job.Start_Date} - ${job.End_Date}\n`;
        text += `Responsibilities:\n`;
        job.Responsibilities.forEach((resp) => {
          text += `- ${resp}\n`;
        });
        text += `\n`;
      });
    }

    if (history.education) {
      history.education.forEach((edu) => {
        text += `Education:\n`;
        text += `Institution: ${edu.Institute}\n`;
        text += `Degree: ${edu.Degree} in ${edu.Major}\n`;
        text += `Location: ${edu.Location}\n`;
        text += `Duration: ${edu.Start_Date} - ${edu.End_Date}\n`;
        if (edu.GPA) text += `GPA: ${edu.GPA}\n`;
        if (edu.RelevantCoursework)
          text += `Relevant Coursework: ${edu.RelevantCoursework}\n`;
        text += `\n`;
      });
    }

    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "/api/career-history/history",
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      setError(null);
      // Update the history with the new data
      if (response.data && response.data.data) {
        setHistory([response.data.data]);
      }
    } catch (error) {
      setError("Failed to save career history");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Career History
        </Typography>

        <Typography variant="body1" paragraph>
          Enter your career history and education details in the text box below.
          Our AI will automatically structure and format your information.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={15}
            variant="outlined"
            label="Enter your career history and education details"
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="Example:
Work Experience:
Company: Tech Corp
Position: Software Engineer
Location: New York, NY
Duration: 2020 - Present
Responsibilities:
- Developed web applications
- Collaborated with cross-functional teams
- Implemented new features

Education:
Institution: University of Technology
Degree: Bachelor of Science in Computer Science
Location: Boston, MA
Duration: 2016 - 2020
GPA: 3.8
Relevant Coursework: Data Structures, Algorithms, Web Development"
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setText("")}
              disabled={loading}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !text.trim()}
            >
              {loading ? <CircularProgress size={24} /> : "Save Career History"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Career history saved successfully!"
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CareerHistory;
