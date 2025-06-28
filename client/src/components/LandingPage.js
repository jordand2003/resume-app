import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Icon,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import ParticlesBackground from "./ParticlesBackground";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { createApiUrl } from "../config/api";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  position: "relative",
  overflow: "hidden",
  animation: `${fadeIn} 0.6s ease-out`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #FF6B6B, #4ECDC4)",
  },
}));

const BackgroundContainer = styled(Box)({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0A1930 0%, #162B4D 100%)",
  position: "relative",
});

const ContentSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  position: "relative",
  zIndex: 1,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const ButtonContainer = styled(Stack)({
  flexDirection: "row",
  gap: "16px",
  width: "100%",
  justifyContent: "center",
  marginTop: "32px",
});

const StyledButton = styled(Button)(({ variant }) => ({
  padding: "12px 32px",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: 600,
  textTransform: "none",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  ...(variant === "contained" && {
    background: "linear-gradient(45deg, #4ECDC4, #45b8b0)",
    boxShadow: "0 4px 15px rgba(78, 205, 196, 0.3)",
    "&:hover": {
      background: "linear-gradient(45deg, #45b8b0, #3da59e)",
      boxShadow: "0 6px 20px rgba(78, 205, 196, 0.4)",
      transform: "translateY(-2px)",
    },
  }),
  ...(variant === "outlined" && {
    borderColor: "#4ECDC4",
    color: "#4ECDC4",
    "&:hover": {
      borderColor: "#45b8b0",
      background: "rgba(78, 205, 196, 0.08)",
      transform: "translateY(-2px)",
    },
  }),
}));

const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  position: "relative",
  zIndex: 1,
  padding: theme.spacing(4, 0),
}));

const HeroContent = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  padding: theme.spacing(6),
  animation: `${fadeIn} 0.6s ease-out`,
  position: "relative",
}));

const AuthButtonsContainer = styled(Stack)({
  flexDirection: "row",
  gap: "16px",
});

const NavBar = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2, 0),
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  zIndex: 1000,
}));

const NavContainer = styled(Container)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const LogoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const LandingPage = () => {
  const navigate = useNavigate();
  const {
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    user,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  React.useEffect(() => {
    // If user hasn't been logouted & they still require verification, this runs
    const checkEmailVerification = async () => {
      if (isAuthenticated && user) {
        if (
          !user.email_verified &&
          !(
            user.sub.startsWith("github|") ||
            user.sub.startsWith("google-oauth2|")
          )
        ) {
          // Stay on landing page with verification message
          return;
        } else {
          // Always check and create user in backend
          try {
            const accessToken = await getAccessTokenSilently();
            const checkResponse = await fetch(
              createApiUrl(`api/auth/users/${user.sub}`),
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (checkResponse.status === 404) {
              // User does not exist, create them
              await fetch(createApiUrl("api/auth/users"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  user_id: user.sub,
                  email: user.email,
                  name: user.name,
                }),
              });
            }
          } catch (error) {
            console.error("Error during user check/creation:", error);
          }
          navigate("/home");
        }
      }
    };

    checkEmailVerification();
  }, [isAuthenticated, navigate, user, getAccessTokenSilently]);

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

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress sx={{ color: "#4ECDC4" }} />
      </Box>
    );
  }

  // Function to sign out
  const handleSignOut = () => {
    logout({ returnTo: window.location.origin });
  };

  const isSocial =
    user?.sub &&
    (user.sub.startsWith("github|") || user.sub.startsWith("google-oauth2|"));

  if (isAuthenticated && !isSocial && !user?.email_verified) {
    return (
      <BackgroundContainer>
        <ParticlesBackground />
        <Container maxWidth="sm">
          <ContentSection>
            <StyledPaper elevation={3}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600, textAlign: "center" }}
              >
                Email Verification Required
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                We've sent a verification email to{" "}
                <strong>{user?.email}</strong>. Please check your inbox and
                click the verification link to access your account.
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                If you don't see the email, please check your spam folder.
              </Typography>
              <ButtonContainer>
                <StyledButton
                  variant="contained"
                  onClick={refreshVerificationStatus}
                >
                  Check Verification Status
                </StyledButton>
              </ButtonContainer>
              <StyledButton color="primary" onClick={handleSignOut}>
                Home Page
              </StyledButton>
            </StyledPaper>
          </ContentSection>
        </Container>
      </BackgroundContainer>
    );
  }

  const handleSignIn = () => {
    loginWithRedirect({
      appState: {
        returnTo: "/home",
      },
      connection: "google-oauth2",
    });
  };

  const handleRegister = () => {
    loginWithRedirect({
      screen_hint: "signup",
      connection: "google-oauth2",
    });
  };

  const features = [
    {
      title: "Smart Templates",
      description:
        "Choose from professionally designed templates that highlight your strengths",
      icon: "⚡",
    },
    {
      title: "AI-Powered",
      description: "Get intelligent suggestions to improve your resume content",
      icon: "🤖",
    },
    {
      title: "ATS-Friendly",
      description: "Ensure your resume passes Applicant Tracking Systems",
      icon: "✓",
    },
    {
      title: "Export Options",
      description: "Download your resume in PDF, Word, or plain text formats",
      icon: "📄",
    },
  ];

  return (
    <BackgroundContainer>
      <ParticlesBackground />

      {/* Navigation Bar */}
      <NavBar>
        <NavContainer maxWidth="lg">
          <LogoContainer>
            <Logo />
          </LogoContainer>
          <AuthButtonsContainer>
            <StyledButton variant="outlined" onClick={handleSignIn}>
              Sign In
            </StyledButton>
            <StyledButton
              variant="contained"
              /*onClick={handleRegister}*/ component={Link}
              to="/register"
            >
              Register
            </StyledButton>
          </AuthButtonsContainer>
        </NavContainer>
      </NavBar>

      {/* Hero Section */}
      <HeroContainer>
        <Container maxWidth="lg">
          <HeroContent>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    color: "#1A1A1A",
                    mb: 2,
                    fontSize: { xs: "2.5rem", sm: "3.5rem" },
                    maxWidth: "800px",
                  }}
                >
                  Build Your Future With a Professional Resume
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#666",
                    maxWidth: "600px",
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    lineHeight: 1.6,
                    mb: 4,
                  }}
                >
                  Create a professional resume that stands out and lands your
                  dream job. Our AI-powered platform makes it easy to craft the
                  perfect resume in minutes.
                </Typography>
                <StyledButton
                  variant="contained"
                  onClick={handleRegister}
                  sx={{
                    fontSize: "1.1rem",
                    padding: "14px 36px",
                  }}
                >
                  Get Started Free
                </StyledButton>
              </Grid>
            </Grid>
          </HeroContent>
        </Container>
      </HeroContainer>

      {/* Features Section */}
      <ContentSection sx={{ background: "rgba(255, 255, 255, 0.02)" }}>
        <Container>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              color: "white",
              mb: 6,
              fontWeight: 700,
            }}
          >
            Why Choose Lighthouse?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      {feature.icon}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: "#1A1A1A" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#666" }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </ContentSection>

      {/* About Section */}
      <ContentSection>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                sx={{ color: "white", mb: 3, fontWeight: 700 }}
              >
                About Lighthouse
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  mb: 3,
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                }}
              >
                Lighthouse is a modern resume builder that combines the power of
                AI with beautiful design. Our platform helps job seekers create
                professional resumes that catch employers' attention and
                increase their chances of landing interviews.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                }}
              >
                With our intuitive interface and smart features, you can create
                a stunning resume in minutes, not hours.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80"
                  alt="Resume Example"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </ContentSection>

      {/* Contact Section */}
      <ContentSection sx={{ background: "rgba(255, 255, 255, 0.02)" }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              color: "white",
              mb: 3,
              fontWeight: 700,
            }}
          >
            Get in Touch
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.8)",
              mb: 4,
              fontSize: "1.1rem",
            }}
          >
            Have questions? We're here to help!
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    📧
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, fontWeight: 600, color: "#1A1A1A" }}
                  >
                    Email Us
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#666" }}>
                    support@lighthouse.com
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    💬
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, fontWeight: 600, color: "#1A1A1A" }}
                  >
                    Live Chat
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#666" }}>
                    Available 24/7
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </ContentSection>
    </BackgroundContainer>
  );
};

export default LandingPage;
