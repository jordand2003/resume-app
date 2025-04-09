import NavBar from "./NavBar";
import ResumeUpload from "./ResumeUpload";
import { Box } from "@mui/material";

const ResumeUploadPage = () => {
return (
<Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
    <NavBar/>
    <ResumeUpload/>
</Box>);
}

export default ResumeUploadPage;