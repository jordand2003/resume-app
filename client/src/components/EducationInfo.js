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
const EducationInfo = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEducationInfo();
  }, []);

  const fetchEducationInfo = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("/api/education", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.educationHistory) {
        setEducation(response.data.educationHistory || []);
      } else {
        setEducation([]); 
      }
    } catch (error) {
      setError("Failed to fetch career history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.post(
        "/api/education",
        {
          education: education,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh the education information
      fetchEducationInfo();
    } catch (error) {
      setError("Failed to save education information");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      {error && <Alert severity="error">{error}</Alert>}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Education Information
        </Typography>
        <form onSubmit={handleSubmit}>
          {education.map((edu, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #ddd" }}>
              <TextField
                fullWidth
                label="Institution"
                value={edu.institution || ""}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index].institution = e.target.value;
                  setEducation(newEducation);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Degree"
                value={edu.degree || ""}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index].degree = e.target.value;
                  setEducation(newEducation);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Field of Study"
                value={edu.field || ""}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index].field = e.target.value;
                  setEducation(newEducation);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Start Date"
                value={edu.startDate || ""}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index].startDate = e.target.value;
                  setEducation(newEducation);
                }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="End Date"
                value={edu.endDate || ""}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index].endDate = e.target.value;
                  setEducation(newEducation);
                }}
                margin="normal"
              />
            </Box>
          ))}
          <Button
            type="button"
            variant="outlined"
            onClick={() => setEducation([...education, {}])}
            sx={{ mr: 2 }}
          >
            Add Education
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Education
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EducationInfo;
