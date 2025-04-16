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
} from "@mui/material";
import NavBar from "./NavBar";

const CareerHistory = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [careerHistory, setCareerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCareerHistory();
  }, []);

  const fetchCareerHistory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("http://localhost:8000/api/career-history/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Career history response:", response.data);
      if (response.data && response.data.data) {
        // Map the data to match the form fields
        const formattedHistory = response.data.data.map((job) => ({
          _id: job._id, // Preserve the _id if it exists
          company: job.Company || job.company,
          position: job.Job_Title || job.position || job["Job_Title(s)"],
          startDate: job.Start_Date || job.startDate,
          endDate: job.End_Date || job.endDate,
          description: Array.isArray(job.Responsibilities)
            ? job.Responsibilities.join("\n")
            : job.description,
        }));
        setCareerHistory(formattedHistory);
      } else {
        // Initialize with an empty job entry if no data
        setCareerHistory([{}]);
      }
    } catch (error) {
      console.error("Error fetching career history:", error);
      setError("Failed to fetch career history");
      // Initialize with an empty job entry on error
      setCareerHistory([{}]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    try {
      const token = await getAccessTokenSilently();

      // Format the data to match the database schema
      const formattedData = careerHistory.map((job) => ({
        _id: job._id, // Preserve _id for existing entries
        Job_Title: job.position,
        Company: job.company,
        Start_Date: job.startDate,
        End_Date: job.endDate,
        Responsibilities: job.description ? job.description.split("\n") : [],
      }));

      console.log("Submitting career history:", formattedData);
      const response = await axios.post(
        "http://localhost:8000/api/career-history/history",
        {
          work_experience: formattedData, // Match the database field name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Career history submission response:", response.data);

      if (response.data.status === "Success") {
        setSuccessMessage("Career history saved successfully!");
        // Update local state to match the saved data format
        const updatedHistory = formattedData.map((job) => ({
          _id: job._id,
          company: job.Company,
          position: job.Job_Title,
          startDate: job.Start_Date,
          endDate: job.End_Date,
          description: Array.isArray(job.Responsibilities)
            ? job.Responsibilities.join("\n")
            : job.Responsibilities,
        }));
        setCareerHistory(updatedHistory);
      } else {
        // If the save wasn't successful, refresh the data
        await fetchCareerHistory();
      }
    } catch (error) {
      console.error("Error saving career history:", error);
      setError(
        "Failed to save career history: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
        <NavBar />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Career History
          </Typography>
          <form onSubmit={handleSubmit}>
            {careerHistory.map((job, index) => (
              <Box
                key={index}
                sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <TextField
                  fullWidth
                  label="Company"
                  value={job.company || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      company: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Position"
                  value={job.position || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      position: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Start Date"
                  value={job.startDate || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      startDate: e.target.value,

                      // Do string validation
                      
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., Jan 2020"
                />
                <TextField
                  fullWidth
                  label="End Date"
                  value={job.endDate || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      endDate: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., Present"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Key Responsibilities"
                  value={job.description || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      description: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  required
                  placeholder="Enter job responsibilities and achievements"
                />
                {
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const newCareerHistory = careerHistory.filter(
                        (_, i) => i !== index
                      );
                      setCareerHistory(newCareerHistory);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove Job
                  </Button>
                }
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setCareerHistory([...careerHistory, {}])}
              >
                Add Another Job
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Career History
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CareerHistory;
