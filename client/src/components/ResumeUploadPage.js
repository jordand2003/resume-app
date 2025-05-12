import NavBar from "./NavBar";
import ResumeUpload from "./ResumeUpload";
import { Box } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";

const ResumeUploadPage = () => {
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <NavBar />
      <ResumeUpload />
    </Box>
  );
};

export default ResumeUploadPage;
