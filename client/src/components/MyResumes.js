import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import NavBar from "./NavBar";

const ResumeContent = ({ content }) => {
  if (!content) return null;

  return (
    <Box sx={{ p: 2 }}>
      {/* Summary Section */}
      <Typography variant="h6" gutterBottom>
        Professional Summary
      </Typography>
      <Typography paragraph>{content.summary}</Typography>

      {/* Experience Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Experience
      </Typography>
      {content.experience.map((exp, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {exp.title} at {exp.company}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {exp.duration}
          </Typography>
          <List dense>
            {exp.achievements.map((achievement, i) => (
              <ListItem key={i}>
                <Typography variant="body2">• {achievement}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}

      {/* Skills Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Skills
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {content.skills.map((skill, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {skill}
          </Typography>
        ))}
      </Box>

      {/* Education Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Education
      </Typography>
      {content.education.map((edu, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {edu.degree}
          </Typography>
          <Typography variant="body2">
            {edu.institution} • {edu.year}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const MyResumes = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [getAccessTokenSilently]);

  const fetchResumes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("http://localhost:8000/api/resumes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setResumes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setError(error.response?.data?.message || "Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = (resume) => {
    setSelectedResume(resume);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResume(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            My Resumes
          </Typography>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && resumes.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", my: 4 }}
            >
              No resumes generated yet. Go to the Resume Generation page to
              create one!
            </Typography>
          )}

          <List>
            {resumes.map((resume, index) => (
              <React.Fragment key={resume._id}>
                {index > 0 && <Divider />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="div">
                        Resume for {resume.jobTitle} at {resume.company}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Generated on: {formatDate(resume.createdAt)}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewResume(resume)}
                          sx={{ mt: 1 }}
                        >
                          View Resume
                        </Button>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: "80vh" },
        }}
      >
        <DialogTitle>
          {selectedResume &&
            `Resume for ${selectedResume.jobTitle} at ${selectedResume.company}`}
        </DialogTitle>
        <DialogContent dividers>
          {selectedResume && <ResumeContent content={selectedResume.content} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyResumes;
