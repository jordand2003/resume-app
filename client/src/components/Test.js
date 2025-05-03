import { Box, Button } from "@mui/material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const Temp = () => {
    const { getAccessTokenSilently } = useAuth0();
    const handleClick = async () => {
        const token = await getAccessTokenSilently();
        
        const r1 = await axios.post("http://localhost:8000/api/format/", {
            headers: { Authorization: `Bearer ${token}` },
            body: { resumeId: "6807e9f908a517ea2a2527ef", formatType: "text/markup", templateId: "basic", styleId: "" }
        });
        const response = await axios.get("http://localhost:8000/api/resumes/download/6807e9f908a517ea2a2527ef", {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response.headers);

        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.type = response.headers;
        
        link.download = "temp";
        document.body.appendChild(link);
        //link.click();
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