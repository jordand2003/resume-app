import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import {
  Avatar,
  Alert,
  Box,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AccountCircle from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";

const UserProfile = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { user, isAuthenticated } = useAuth0();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tempPhoneNumber, setTempPhoneNumber] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [tempSecondaryEmail, setTempSecondaryEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPhoneNumberDialogOpen, setIsPhoneNumberDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
      return;
    }
    const fullName = user?.name?.split(" ") || [];
    setFirstName(fullName[0]);
    setLastName(fullName.slice(1).join(" ") || "");
    fetchPhoneNumber();
    fetchSecondaryEmail();
  }, [isAuthenticated, navigate]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUseAccountIcon = () => {
    setAvatarUrl(null); //Reset to default/Auth0 picture
    handleMenuClose();
  };

  //Get Phone Number
  const fetchPhoneNumber = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        "http://localhost:8000/api/user-profile/phone",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        console.log("User has no existing phone number. 204");
        setPhoneNumber("");
      } else if (response.status === 200 || response.status === 304) {
        console.log("User has existing phone number. 200");
        setPhoneNumber(response.data.phoneNumber);
      }
    } catch (error) {
      console.error("Error saving phone number:", error);
      setError("Failed to save phone number.");
    }
  };

  const handleSetPhoneNumber = async () => {
    setTempPhoneNumber(phoneNumber);
    setIsPhoneNumberDialogOpen(true);
  };

  const handleClosePhoneDialog = () => {
    setIsPhoneNumberDialogOpen(false);
    setTempPhoneNumber("");
  };

  const handlePhoneInputChange = (event) => {
    setTempPhoneNumber(event.target.value); //update temp and still display old number until save
  };

  const handleSavePhone = async () => {
    setPhoneNumber(tempPhoneNumber);
    setIsPhoneNumberDialogOpen(false);
    if (tempPhoneNumber === "") {
      console.log("Phone number field is empty.");
      setError("Phone number field is empty.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "http://localhost:8000/api/user-profile/phone",
        { phone: tempPhoneNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data && response.data.user.phone) {
        setPhoneNumber(response.data.user.phone);
        setSuccessMessage("Successfully saved phone number.");
      } else if (response.data && response.data.data) {
        setSuccessMessage(response.data.message);
        setError(null);
      }
      setTempPhoneNumber("");
    } catch (error) {
      console.error("Error saving phone number:", error);
      setError("Failed to save phone number.");
      setSuccessMessage("");
      setTempPhoneNumber("");
    }
  };

  //Get Second Email
  const fetchSecondaryEmail = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        "http://localhost:8000/api/user-profile/email2",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        console.log("User has no existing secondary email. 204");
        setSecondaryEmail("");
      } else if (response.status === 200 || response.status === 304) {
        console.log("User has existing secondary email. 200");
        setSecondaryEmail(response.data.secondaryEmail);
      }
    } catch (error) {
      console.error("Error saving secondary email:", error);
      setError("Failed to save secondary email.");
    }
  };

  //handle Email Update
  const handleSetSecondEmail = () => {
    setTempSecondaryEmail(secondaryEmail);
    setIsEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setIsEmailDialogOpen(false);
    setTempSecondaryEmail("");
  };

  const handleEmailInputChange = (event) => {
    setTempSecondaryEmail(event.target.value);
  };

  const handleSaveEmail = async () => {
    setIsEmailDialogOpen(false);

    // Check for valid Email syntax
    if (emailRegex.test(tempSecondaryEmail)) {
      //if email input is right
      setSecondaryEmail(tempSecondaryEmail);
      console.log("in regex here");
    } else {
      setError("Incorrect format, try username@domain.tld");
      console.log("out regex here");
      return;
    }

    if (tempSecondaryEmail === "") {
      console.log("Email2 field is empty.");
      setError("Secondary Email field is empty.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "http://localhost:8000/api/user-profile/email2",
        { email_2: tempSecondaryEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data && response.data.user.email_2) {
        setSecondaryEmail(response.data.user.email_2);
        console.log("Secondary email post response2:", response.data.data);
        setSuccessMessage("Successfully saved secondary email.");
      } else if (response.data && response.data.data) {
        setSuccessMessage(response.data.message);
        setError(null);
      }
      setTempSecondaryEmail("");
    } catch (error) {
      console.error("Error saving email 2:", error);
      setError("Failed to save secondary email.");
      setSuccessMessage("");
      setTempPhoneNumber("");
    }
  };

  const handleChangeTheme = () => {};

  // Upload profile photo
  async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("photo", file);

      try {
        const token = await getAccessTokenSilently();
        const response = await axios.post(
          "http://localhost:8000/api/user-profile/upload_photo",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.status === "Success") {
          setAvatarUrl(response.data.data);
          setSuccessMessage("Profile photo updated successfully!");
          setUploadError(null);
        }
      } catch (error) {
        console.error("Error uploading photo:", error);
        setUploadError("Failed to upload photo. Please try again.");
      }
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            My Profile
          </Typography>
          <Box sx={{ position: "relative", mb: 2 }}>
            <Box sx={{ position: "relative", mb: 2, display: "flex" }}>
              <Box sx={{ position: "relative", mb: 2 }}>
                <Avatar
                  alt={user.name || user.email}
                  src={avatarUrl || user?.picture}
                  sx={{ width: 80, height: 80 }}
                />
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    mb: 1,
                    position: "absolute",
                    bottom: -10,
                    left: 50,
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Box>

              <Box sx={{ mb: 2, display: "flex", paddingLeft: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {user.name}
                  <Typography variant="body2" gutterBottom>
                    User ID: {user.sub}
                    {user.email_verified && (
                      <Typography variant="body2" color="success" gutterBottom>
                        Email Verified
                      </Typography>
                    )}
                  </Typography>
                </Typography>
              </Box>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleUseAccountIcon}>
                Use Account Icon
              </MenuItem>
              <MenuItem>
                <label htmlFor="avatar-upload-input">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload-input"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </MenuItem>
            </Menu>
            {uploadError && (
              <Typography color="error">{uploadError}</Typography>
            )}
            {successMessage && (
              <Typography color="success">{successMessage}</Typography>
            )}
            {/*if successful upload, button disappear*/}
          </Box>

          <hr />
          <Box sx={{ position: "relative", mb: 2 }}>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              Email(s)
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                Primary: {user.email} <br></br>
                Secondary: {secondaryEmail || "None"}
              </Typography>
              <IconButton
                onClick={handleSetSecondEmail}
                sx={{
                  mb: 1,
                  position: "relative",
                  marginTop: -11.5,
                  float: "right",
                  marginLeft: 80,
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <EditIcon />
              </IconButton>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </Typography>
          </Box>

          <hr />
          <Box>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              Phone Number
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                Primary: {phoneNumber || "None"} <br></br>
              </Typography>
              <IconButton
                onClick={handleSetPhoneNumber}
                sx={{
                  mb: 1,
                  position: "relative",
                  float: "right",
                  marginLeft: 80,
                  marginTop: -8,
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <EditIcon />
              </IconButton>
            </Typography>
          </Box>

          <hr />
          <Box>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              Theme
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                Light
              </Typography>
              <IconButton
                onClick={handleChangeTheme}
                sx={{
                  mb: 1,
                  position: "relative",
                  float: "right",
                  marginLeft: 80,
                  marginTop: -8,
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <EditIcon />
              </IconButton>
            </Typography>
          </Box>
          <hr />
          <Typography variant="h6" color="textPrimary" gutterBottom>
            Language
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              English
            </Typography>
          </Typography>
        </Paper>
      </Box>

      <Dialog open={isEmailDialogOpen} onClose={handleCloseEmailDialog}>
        <DialogTitle>Add or Update Secondary Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="secondEmail"
            label="Secondary Email"
            type="email"
            fullWidth
            variant="outlined"
            defaultValue={secondaryEmail}
            onChange={handleEmailInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog}>Cancel</Button>
          <Button onClick={handleSaveEmail} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isPhoneNumberDialogOpen} onClose={handleClosePhoneDialog}>
        <DialogTitle>Add or Update Phone Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            defaultValue={tempPhoneNumber}
            onChange={handlePhoneInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneDialog}>Cancel</Button>
          <Button onClick={handleSavePhone} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
