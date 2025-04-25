import React from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import Auth0ProviderWithHistory from "./components/Auth0ProviderWithHistory";
import CareerHistory from "./components/CareerHistory";
import CssBaseline from "@mui/material/CssBaseline";
import EducationInfo from "./components/EducationInfo";
import HomePage from "./components/HomePage";
import JobDescriptions from "./components/JobDescriptions";
import LandingPage from "./components/LandingPage";
import MyResumes from "./components/MyResumes";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import ResumeDisplay from "./components/ResumeDisplay";
import ResumeGeneration from "./components/ResumeGeneration";
import ResumeUploadPage from "./components/ResumeUploadPage";
import { useAuth0 } from "@auth0/auth0-react";
import UserProfile from "./components/UserProfile";
import { createTheme, CircularProgress, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2c3e50",
      light: "#34495e",
      dark: "#2c3e50",
    },
    secondary: {
      main: "#e74c3c",
      light: "#e74c3c",
      dark: "#c0392b",
    },
    background: {
      default: "#f5f6fa",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

// Callback component
const AuthCallback = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return <Navigate to="/home" />;
};

// App Routes component (separated to avoid Auth0 context issues)
const AppRoutes = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/callback" element={<AuthCallback />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-upload"
        element={
          <ProtectedRoute>
            <ResumeUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-history"
        element={
          <ProtectedRoute>
            <CareerHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/education"
        element={
          <ProtectedRoute>
            <EducationInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-generation"
        element={
          <ProtectedRoute>
            <ResumeGeneration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume/status/:resumeId"
        element={
          <ProtectedRoute>
            <ResumeDisplay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/userProfile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/job-descriptions" 
        element={
          <ProtectedRoute>
            <JobDescriptions />
          </ProtectedRoute>
        } 
      />
      <Route path="/my-resumes" 
        element={
          <ProtectedRoute>
            <MyResumes />
          </ProtectedRoute>
        } 
      />
      <Route path="/user-profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Auth0ProviderWithHistory>
          <AppRoutes />
        </Auth0ProviderWithHistory>
      </Router>
    </ThemeProvider>
  );
}

export default App;
