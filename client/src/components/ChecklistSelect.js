// filepath: c:\Users\proga\Documents\Homework_n'_School\NJIT_Undergrad\S'25\CS 490\resume-app\client\src\components\ChecklistSelect.js
import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Typography,
  Paper,
  FormGroup,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ChecklistSelect = ({ checklist_name, full_content, indexDisplayFunction, rightSideDisplayFunction, markedEntries, setMarkedEntries }) => { // Add markedEntries and setMarkedEntries to props
  const [allContent, setAllContent] = useState(full_content || []);
  const [error, setError] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  //const [markedEntries, setMarkedEntries] = useState(new Set()); // REMOVE this line

  // Set the entry to be viewed on the right
  const handleViewContent = (entry) => {
    setSelectedEntry(entry);
    // console.log("handleViewContent in ChecklistSelect called with:", entry);
  };

  useEffect(() => {
    console.log("Marked Entries:", markedEntries);
  }, [markedEntries]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Runs the actual prop function to populate left side & renders the result
  const renderedIndexList = indexDisplayFunction && indexDisplayFunction(full_content, handleViewContent, markedEntries, setMarkedEntries);

  return (
    <Box sx={{ minHeight: "1000", backgroundColor: "#e1e1e3" }}>
      <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="panel2-content"
            >
              <Typography variant="h5" gutterBottom>
                {checklist_name}
              </Typography>
            </AccordionSummary>
      <Box sx={{ maxWidth: 1800, mx: "auto", p: 3, display: 'flex' }}>
        <Paper elevation={12} sx={{ p: 3, width: 400, overflow: 'auto' }}>
          {/* Toast Message */}
          {successMessage && (
            <Box
              sx={{
                position: "fixed",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                width: "auto",
                maxWidth: 600,
              }}
            >
              <Alert
                severity="success"
                variant="filled"
                onClose={() => setSuccessMessage("")}
                sx={{
                  padding: "20px",
                  minHeight: "20px",
                  animation: "fadeIn 0.5s ease-in-out",
                  "@keyframes fadeIn": {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                {successMessage}
              </Alert>
            </Box>
          )}

          {/*Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {!error && allContent.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", my: 4 }}
            >
              No content to display
            </Typography>
          )}

          {/* List selection options to the left side (created dynamically) */}
          <FormGroup sx={{maxHeight: "650px", overflow: "auto"}}>
            {indexDisplayFunction && renderedIndexList} {/* Render the result here */}
          </FormGroup>
        </Paper>
        {/* View Details off to the right side */}
        <Paper sx={{ p: 3, maxWidth: 1600, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 900, height: 700 }}>
          {!selectedEntry && <p>Tap an Entry to See Details</p>}
          {selectedEntry && (
            <Box sx={{ maxWidth: 800, maxHeight: 1000, height: 600, overflow: 'auto', margin: 'auto' }}>
              <Paper elevation={3} sx={{ p: 2, maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{checklist_name} Entry</Typography>
                </Box>

                {/* Main content (created dynamically)*/}
                <Box>
                  {rightSideDisplayFunction && rightSideDisplayFunction(selectedEntry)}
                </Box>
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
      </Accordion>
    </Box>
  );
};

export default ChecklistSelect;