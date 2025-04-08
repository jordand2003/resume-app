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
} from "@mui/material";
import NavBar from "./NavBar";
const CareerHistory = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [careerHistory, setCareerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setCareerHistory(response.data.data || []);
      } else {
        setCareerHistory([]);
      }
    } catch (error) {
      console.error("Error fetching career history:", error);
      setError("Failed to fetch career history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      console.log("Submitting career history:", careerHistory);
      const response = await axios.post(
        "/api/career-history/history",
        {
          text: JSON.stringify(careerHistory),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Career history submission response:", response.data);
      // Refresh the career history
      fetchCareerHistory();
    } catch (error) {
      console.error("Error saving career history:", error);
      setError(
        "Failed to save career history: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      {error && <Alert severity="error">{error}</Alert>}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Career History
        </Typography>
        <form onSubmit={handleSubmit}>
          {careerHistory.map((job, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #ddd" }}>
              <TextField
                fullWidth
                label="Company"
                value={job.company || ""}
                onChange={(e) => {
                  const newCareerHistory = [...careerHistory];
                  newCareerHistory[index].company = e.target.value;
                  setCareerHistory(newCareerHistory);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Position"
                value={job.position || ""}
                onChange={(e) => {
                  const newCareerHistory = [...careerHistory];
                  newCareerHistory[index].position = e.target.value;
                  setCareerHistory(newCareerHistory);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Start Date"
                value={job.startDate || ""}
                onChange={(e) => {
                  const newCareerHistory = [...careerHistory];
                  newCareerHistory[index].startDate = e.target.value;
                  setCareerHistory(newCareerHistory);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="End Date"
                value={job.endDate || ""}
                onChange={(e) => {
                  const newCareerHistory = [...careerHistory];
                  newCareerHistory[index].endDate = e.target.value;
                  setCareerHistory(newCareerHistory);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={job.description}
                onChange={(e) => {
                  const newCareerHistory = [...careerHistory];
                  newCareerHistory[index].description = e.target.value;
                  setCareerHistory(newCareerHistory);
                }}
                margin="normal"
              />
            </Box>
          ))}
          <Button
            type="button"
            variant="outlined"
            onClick={() => setCareerHistory([...careerHistory, {}])}
            sx={{ mr: 2 }}
          >
            Add Job
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Career History
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CareerHistory;
