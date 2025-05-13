import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  styled,
  IconButton,
  InputAdornment,
  Modal,
  Fade,
  Backdrop
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ParticlesBackground from "./ParticlesBackground";
import { useAuth0 } from "@auth0/auth0-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LoginBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  border: '1px solid rgba(0, 47, 255, 0.6)',
  marginTop: theme.spacing(8),
}));

const Register = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [email, setEmail] = useState('');
  const [fname, setFName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [validEmailInput, setValidEmailInput] = useState(true)
  const [validName, setValidName] = useState(true)
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [approveBox, showApproveBox] = useState(false)
  const [phoneNum, setPhoneNum] = useState('')
  const [phoneError, setPhoneError] = useState(false);
  const navigate = useNavigate();
  const {loginWithRedirect} = useAuth0();
  
  const phoneRegex = /^\d+$/;

  // Function for Profile Pic
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  // Function: Make Password Text visible
  const handleToggleVisibility = () => {
    setShowPassword((prev) => !prev); 
  };

  // Password Strength Validation
  const validatePassword = (password) => {
    const passwordMsg = 'Your password must contain\nAt least 8 characters\nAt least 3 of the following: \nLowercase letters (a-z)\nUppercase letters (A-Z) \nNumbers (0-9)\nSpecial characters';
    if (password.length < 8) {
      return passwordMsg;
    }

    // Criteria 
    const criteria = [
      /[a-z]/, // Lowercase letters
      /[A-Z]/, // Uppercase letters
      /[0-9]/, // Numbers
      /[^0-9,^A-Z,^a-z]/, // Special characters
    ];

    let metCriteria = 0;
    criteria.forEach((regex) => {
      if (regex.test(password)) {
        metCriteria++;
      }
    });

    if (metCriteria < 3) {
      return passwordMsg;
    }

    return ''; // No error
  }

  const refreshVerificationStatus = async () => {
    try {
      // Force a refresh of the user profile to get the latest email_verified status
      await loginWithRedirect({
        prompt: "none",
        appState: {
          returnTo: window.location.pathname,
        },
      });
    } catch (error) {
      console.error("Error refreshing verification status:", error);
    }
  };
  
  // Redirect to Auth0 Login Page
  const toLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: "/home",
      },
      connection: "google-oauth2",
    });
  };

  // Submit Button Function
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check for valid Email syntax
    if(!emailRegex.test(email)){
      setValidEmailInput(false)
    }
    else if (!validEmailInput)
      setValidEmailInput(true);

    // Check Name field isn't empty
    if (!fname)
      setValidName(false);
    else if (!validName) 
      setValidName(true);

    // Validate Password check
    const passwordValidationResult = validatePassword(password);
    setPasswordError(passwordValidationResult);

    // Prevent submission if there are violations
    if (password !== confirmPassword || passwordValidationResult) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
    if (phoneNum.length != 10 || !phoneRegex.test(phoneNum)) {
      setPhoneError(true);
    }
    else 
      setPhoneError(false);
    if (!validName || passwordError === '' || confirmPasswordError === '' || phoneError)
      return;
    try {
      // API to Add User to Auth0
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/dbconnections/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          "client_id": process.env.AUTH0_CLIENT_ID,
          "email": email, 
          "password": password,
          "connection": "Username-Password-Authentication",
          "name": fname,
        }), 
      });

      const data = await response.json();
  
      // Respond Messages
      if (response.ok) {
        console.log('Registration successful!');
        showApproveBox(true)  // Reveal Confirmation Popup
        //navigate('/home');
      }
      else if (response.status === 400)
        setError('Email already taken');
      else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    }
  };

  // Return JSX (HTML)
  return (
    <>
    <ParticlesBackground></ParticlesBackground>
    <Container maxWidth="xs">
      <LoginBox elevation={3}>
        <Typography component="h1" variant="h5">
          Registration
        </Typography>
        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          
          {/* Image Upload Front-End. Has no real saving functionality atm 
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h6">Upload Profile Picture</Typography>
            <Avatar
              src={preview}
              sx={{ width: 100, height: 100 }}
            />
            <Button variant="contained" component="label">
              Choose Picture
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
          </Box>
          */}
            
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!validEmailInput && (
            <Typography color="error" style={{ marginLeft: '14px' }}>
              Enter a valid email
            </Typography>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="fname"
            label="Full Name"
            name="fname"
            autoComplete="fname"
            autoFocus
            value={fname}
            onChange={(e) => setFName(e.target.value)}
          />
          {!validName && (
            <Typography color="error" style={{ marginLeft: '14px' }}>
              Missing name
            </Typography>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(validatePassword(e.target.value));
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleVisibility}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {passwordError && (
            <Typography color="error" style={{ marginLeft: '14px' }}>
              {passwordError.split('\n').map((item, i) => (
                <div>
                <React.Fragment key={i}>
                  {i === 0 && <strong>{item}<br /></strong>}
                  {i === 1 && <p style={{'fontSize':"14px", 'marginLeft':'14px'}}>{item}</p>}
                  {i === 2 && <p style={{'fontSize':"14px", 'marginLeft':'14px'}}>{item}</p>}
                  {i > 2 && <li style={{'fontSize':"12px", 'marginLeft':'44px'}}>{item}</li>}
                </React.Fragment>
                </div>
              ))}
            </Typography>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value !== password) {
                setConfirmPasswordError("Passwords do not match");
              } else {
                setConfirmPasswordError("");
              }
            }}
          />
          {confirmPasswordError && (
            <Typography color="error" style={{ marginLeft: '14px' }}>
              {confirmPasswordError}
            </Typography>
          )}
          <TextField
            margin="normal"
            fullWidth
            name="phoneNumber"
            label="Phone Number"
            id="phoneNumber"
            autoComplete="(###) ###-####"
            value={phoneNum}
            onChange={(e) => {
              setPhoneNum(e.target.value);
              if (e.target.value.length === 10 && phoneRegex.test(e.target.value)) {
                setPhoneError(false);
              } else
                setPhoneError(true);
            }}
          />
          {phoneError && (
            <Typography color="error" style={{ marginLeft: '14px' }}>
              Invalid Phone Number
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            To Lighthouse!
          </Button>
        </Box>
      </LoginBox>
      <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={approveBox}
          onClose={(e, reason) => {
            if (reason === 'backdropClick') return;
            showApproveBox(true)
          }}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={approveBox}>
            <Paper sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: (theme) => theme.shadows[5],
              p: 4,
            }}>
              <div style={{"text-align": "center"}}>
                <h1>Land Ho!</h1>
                <h4>Please check your email to verify your account to gain access!</h4>
                <Button onClick={toLogin} color="primary">
                  To Login Page
                </Button>
              </div>
            </Paper>
          </Fade>
        </Modal>
    </Container>
    </>
  );
};

export default Register;
