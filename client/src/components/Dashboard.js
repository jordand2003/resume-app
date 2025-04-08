import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";

const Dashboard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [careerHistory, setCareerHistory] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await getAccessTokenSilently();

      // Fetch career history
      const careerResponse = await axios.get("/api/career-history/history", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      console.log("Career history response:", careerResponse.data);
      setCareerHistory(careerResponse.data.data || []);

      // Fetch education
      const educationResponse = await axios.get("/api/education", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      console.log("Education response:", educationResponse.data);
      setEducation(educationResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <WorkIcon sx={{ mr: 1 }} />
          Career History
        </Typography>
        <List>
          {careerHistory.map((job, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={job.Job_Title || job.position || job["Job_Title(s)"]}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {job.Company || job.company}
                      </Typography>
                      {job.Location && (
                        <>
                          <br />
                          {job.Location}
                        </>
                      )}
                      <br />
                      {job.Start_Date || job.startDate} -{" "}
                      {job.End_Date || job.endDate}
                      <br />
                      {Array.isArray(job.Responsibilities)
                        ? job.Responsibilities.map((resp, i) => (
                            <React.Fragment key={i}>
                              • {resp}
                              <br />
                            </React.Fragment>
                          ))
                        : job.description}
                    </>
                  }
                />
              </ListItem>
              {index < careerHistory.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {careerHistory.length === 0 && (
            <ListItem>
              <ListItemText primary="No career history available" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <SchoolIcon sx={{ mr: 1 }} />
          Education
        </Typography>
        <List>
          {education.map((edu, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={edu.Degree || edu.degree}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {edu.Institute || edu.institution}
                      </Typography>
                      <br />
                      {edu.Major || edu.field}
                      <br />
                      {edu.Start_Date || edu.startDate} -{" "}
                      {edu.End_Date || edu.endDate}
                    </>
                  }
                />
              </ListItem>
              {index < education.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {education.length === 0 && (
            <ListItem>
              <ListItemText primary="No education information available" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard;
