import { Box, Button } from "@mui/material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const Temp = () => {
    const { getAccessTokenSilently } = useAuth0();
    const handleClick = async () => {
        const token = await getAccessTokenSilently();
        const resumes = await axios.get("http://localhost:8000/api/resumes/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        var response;
        try {
            response = await axios.get(`http://localhost:8000/api/resumes/download/${resumes.data.data[0]._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.log("Error", error);
            // Call format and download afterwards
            await axios.post("http://localhost:8000/api/format", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                resumeId: resumes.data.data[0]._id, 
                format: "", 
                templateId: "basic"
            });
            response = await axios.get(`http://localhost:8000/api/resumes/download/${resumes.data.data[0]._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        console.log(response);
        
        const blob = new Blob([response.data.content]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.type = response.headers;
        link.download = `resume.${response.data.file}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Button
            onClick={handleClick}>
                Press me!
            </Button>
        </Box>
    );
}

export default Temp;