import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Typography,
  Paper,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem
} from "@mui/material";

/**
 * Generates a checklist of items based on the full_content passed in
 * @param {string} checklist_name The name that'll be displayed on the top of the component
 * @param {*} full_content All the content from a user you want to have entries for
 * @param {Function} indexDisplayFunction A function that specifies how want each entry's label to be displayed; should return components to display
 * @param {Function} rightSideDisplayFunction A function that specifies how you want each entry in full_content to be displayed on to the right side when clicked; should return components to display
 * @returns
 */
const ChecklistSelect = ({ checklist_name, full_content, indexDisplayFunction, rightSideDisplayFunction }) => {
  const [allContent, setAllContent] = useState(full_content || []);
  const [error, setError] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Set the entry to be viewed on the left
  const handleViewContent = (entry) => {
    setSelectedEntry(entry);
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
    <Box sx={{ minHeight: "1000", backgroundColor: "#e1e1e3" }}>
      <Box sx={{ maxWidth: 1800, mx: "auto", p: 3, display: 'flex' }}>
        <Paper elevation={12} sx={{ p: 3, width: 400, overflow: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            {checklist_name}
          </Typography>

          {/** Toast Message */}
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

          {/**Error Display */}
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

          {/** Entry options for selection (created dynamically) */}
          <FormGroup>
            {indexDisplayFunction && indexDisplayFunction(full_content)}
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
    </Box>
  );
};

export default ChecklistSelect;