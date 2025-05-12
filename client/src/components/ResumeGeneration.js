import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  Checkbox,
  Divider,
  MenuItem,
  ListItem,
  ListItemText,
  Select,
  InputLabel,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from "@mui/material";
import NavBar from "./NavBar";
import StatusChecker from "./StatusChecker";
import ChecklistSelect from "./ChecklistSelect";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";

//----------------- Functions ------------------------------
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// can be passed into the 'rightSideDisplayFunction' prop to show data on the right side of the checklist component
const ResumeContent = ({ content }) => {
  /*console.log("ResumeContent received content:", content);
  console.log("content.parsedData.education:", content?.parsedData?.education);
  console.log("content.parsedData.work_experience:", content?.parsedData?.work_experience);
  console.log("content.parsedData.skills:", content?.parsedData?.skills);*/
  if (!content) return null;

  const parsedData = content.parsedData || {}; // Add a fallback in case parsedData is missing

  return (
    <Box sx={{ p: 2 }}>
      {parsedData.education && parsedData.education.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 0 }}>
            Education
          </Typography>
          {parsedData.education.map((edu, index) => (
            <Box key={index} sx={{ mb: 2, ml: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {edu.institute || edu.Institute}, {edu.location || edu.Location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.degree || edu.Degree} in {edu.major || edu.Major}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GPA: {edu.gpa || edu.GPA}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.startDate || edu.Start_Date} -{" "}
                {edu.endDate || edu.End_Date}
              </Typography>
              <Typography
                color="text.primary"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
              >
                Relevant Coursework:
              </Typography>
              {(edu.relevantCoursework || edu.RelevantCoursework) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "12px", ml: 4 }}
                >
                  {edu.relevantCoursework || edu.RelevantCoursework}
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {/* Career Section */}
      {parsedData.work_experience && parsedData.work_experience.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Career
          </Typography>
          {parsedData.work_experience.map((exp, index) => (
            <Box key={index} sx={{ mb: 2, ml: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {exp.Job_Title} at {exp.Company}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exp.Location} | {exp.Start_Date} – {exp.End_Date}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {exp.Responsibilities &&
                  exp.Responsibilities.map((r, i) => (
                    <ListItem key={i} sx={{ ml: 2 }}>
                      <Typography variant="body2">• {r}</Typography>
                    </ListItem>
                  ))}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {/* Skills Section */}
      {parsedData.skills && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Skills
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {parsedData.skills.map((skill, index) => (
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
        </>
      )}
    </Box>
  );
};

/*-----------------------------------Actual component is here------------------------------------------*/
const ResumeGeneration = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("idle");
  const [jobList, setJobList] = useState([]);
  const [resumeId, setResumeId] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resumes, setResumes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  const [markedEntries, setMarkedEntries] = useState(new Set());
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  useEffect(() => {
    // Clear any existing status when component mounts
    localStorage.removeItem("status");
    localStorage.removeItem("resumeId");
    localStorage.removeItem("error");
    fetchJobList();
    fetchResumes();
  }, [getAccessTokenSilently]);

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

  // Fetch all Resumes
  const fetchResumes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("http://localhost:8000/api/resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setResumes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to fetch resumes"
      );
    } finally {
      setLoading(false);
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

  const handleTabChange = (event) => {
    setCurrentTab(event.target.value);
  };

  // Can use this for the `indexDisplsyFunction` prop to create List items
  const resumeIndexList = (allResumes, handleViewContent, markedEntries, setMarkedEntries) => {
    return allResumes.map((resume, index) => (
      <React.Fragment key={resume._id}>
        {index > 0 && <Divider />}
        <ListItem
          alignItems="flex-start"
          sx={{
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            cursor: "pointer",
          }}
          onClick={() => handleViewContent(resume)}
        >
          <Checkbox /** Add or remove entries from the markedEntry's set (in the child component) */
            checked={markedEntries.has(resume.parsedData)}
            onChange={(event) => {  
              if (event.target.checked) {
                //console.log(resume.parsedData)
                setMarkedEntries((prevMarked) => new Set(prevMarked).add(resume.parsedData));
              } else {
                setMarkedEntries((prevMarked) => {
                  const nextMarked = new Set(prevMarked);
                  nextMarked.delete(resume.parsedData);
                  return nextMarked;
                });
              }
            }}
          />
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="div">
                {resume.nickName || "New Resume Entry"}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.secondary">
                  Uploaded: {formatDate(resume.createdAt)}
                </Typography>
              </>
            }
          />
        </ListItem>
      </React.Fragment>
    ));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <NavBar />
      {/** Initial Toggle Menu */}
      <FormControl sx={{p: "50px"}}>
        <FormLabel id="demo-radio-buttons-group-label">How would you like to generate your resume?</FormLabel>
        <RadioGroup
          row
          //aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="manual"
          name="radio-buttons-group"
          onChange={handleTabChange}
        >
          <FormControlLabel value="manual" control={<Radio />} label="Manually Select Data" />
          <FormControlLabel value="resume" control={<Radio />} label="Use Resume Data" />
        </RadioGroup>
      </FormControl>

      {/** Main Selection Menu */}
        {/*currentTab === 0 && <Dashboard />*/}
        {currentTab === "resume" && (
          <ChecklistSelect
            checklist_name="Resume"
            full_content={resumes}
            indexDisplayFunction={(full_content, handleViewContentFromChild, markedEntriesFromChild, setMarkedEntriesFromChild) =>
              resumeIndexList(full_content, handleViewContentFromChild, markedEntriesFromChild, setMarkedEntriesFromChild)
            }
            rightSideDisplayFunction={(selectedEntry) => (
              <ResumeContent content={selectedEntry} />
            )}
            markedEntries={markedEntries} // Pass markedEntries as a prop
            setMarkedEntries={setMarkedEntries} // Pass setMarkedEntries as a prop
          />
        )} 

      {/** Submit Area */}
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
