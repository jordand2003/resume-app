import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavBar from "./NavBar";
import { useTheme } from "../context/ThemeContext";
import useMediaQuery from '@mui/material/useMediaQuery';

const Settings = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const { darkMode, toggleDarkMode } = useTheme();
  const [useSystemPref, setUseSystemPref] = useState(false);

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const toggleUseSystemPref = () => {
    setUseSystemPref(!useSystemPref);
    if (!useSystemPref) {
      const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
      toggleDarkMode(systemPref);
    }
  };

  return (
    <Box>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={() => navigate("/home")}
              sx={{ mr: 2 }}
              aria-label="back to home"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">Preferences</Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Language
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={language}
                label="Language"
                onChange={handleLanguageChange}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Theme
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  name="darkMode"
                  disabled={useSystemPref}
                />
              }
              label="Dark Mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={useSystemPref}
                  onChange={toggleUseSystemPref}
                  name="systemPref"
                />
              }
              label="Use System Preferences"
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Settings;
