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

const EducationInfo = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchEducationInfo();
  }, []);

  const fetchEducationInfo = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("http://localhost:8000/api/education", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Education response:", response.data);
      if (response.data && response.data.data) {
        // Map the data to match the form fields
        const formattedEducation = response.data.data.map((edu) => ({
          _id: edu._id, // Preserve the _id if it exists
          institution: edu.Institute || edu.institution,
          degree: edu.Degree || edu.degree,
          field: edu.Major || edu.field,
          gpa: edu.GPA || edu.gpa,
          startDate: edu.Start_Date || edu.startDate,
          endDate: edu.End_Date || edu.endDate,
        }));
        setEducation(formattedEducation);
      } else {
        // Initialize with an empty education entry if no data
        setEducation([{}]);
      }
    } catch (error) {
      console.error("Failed to fetch education history:", error);
      setError("Failed to fetch education history");
      // Initialize with an empty education entry on error
      setEducation([{}]);
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
      const formattedData = education.map((edu) => ({
        _id: edu._id, // Preserve _id for existing entries
        Institute: edu.institution,
        Degree: edu.degree,
        Major: edu.field,
        gpa: edu.gpa,
        Start_Date: edu.startDate,
        End_Date: edu.endDate,
      }));

      console.log("Submitting education data:", formattedData);
      const response = await axios.post(
        "http://localhost:8000/api/education",
        {
          education: formattedData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Save response:", response.data);

      if (response.data.status === "Success") {
        setSuccessMessage("Education information saved successfully!");
        // Update local state to match the saved data format
        const updatedEducation = response.data.data.map((edu) => ({
          _id: edu._id,
          institution: edu.Institute,
          degree: edu.Degree,
          field: edu.Major,
          gpa: edu.GPA,
          startDate: edu.Start_Date,
          endDate: edu.End_Date,
        }));
        setEducation(updatedEducation);
      } else {
        // If the save wasn't successful, refresh the data
        await fetchEducationInfo();
      }
    } catch (error) {
      console.error("Failed to save education information:", error);
      setError(
        "Failed to save education information: " +
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
            Education Information
          </Typography>
          <form onSubmit={handleSubmit}>
            {education.map((edu, index) => (
              <Box
                key={index}
                sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <TextField
                  fullWidth
                  label="Institution"
                  value={edu.institution || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      institution: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., University of California, Berkeley"
                />
                <TextField
                  fullWidth
                  label="Degree"
                  value={edu.degree || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      degree: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., Bachelor of Science"
                />
                <TextField
                  fullWidth
                  label="Field of Study"
                  value={edu.field || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      field: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., Computer Science"
                />
                <TextField
                  fullWidth
                  label="GPA"
                  value={edu.gpa || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      gpa: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., 4.0"
                />
                <TextField
                  fullWidth
                  label="Start Date"
                  value={edu.startDate || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      startDate: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., Sep 2018"
                />
                <TextField
                  fullWidth
                  label="End Date"
                  value={edu.endDate || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      endDate: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  margin="normal"
                  required
                  placeholder="e.g., May 2022"
                />
                {
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const newEducation = education.filter(
                        (_, i) => i !== index
                      );
                      setEducation(newEducation);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove Education
                  </Button>
                }
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setEducation([...education, {}])}
              >
                Add Another Education
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Education
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default EducationInfo;
