import React from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { 
    Stack, 
    CircularProgress,
    Typography,
    Button
} from "@mui/material";
import { ThemeContext } from "@emotion/react";

const StatusChecker = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [loadingPhrase, setLoadingPhrase] = React.useState("Processing...");
    const [wheelColor, setWheelColor] = React.useState("Inherit");
    let status = localStorage.getItem("status");

    localStorage.setItem("resumeid", "1");
    localStorage.setItem("status", "completed");

    async function updateStatus() {
        const token = await getAccessTokenSilently();
        const response = await axios.get("http://localhost:8000/api/resumes/status/" + localStorage.getItem("resumeid"), {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.status === 200) {
            localStorage.setItem("status", data.status);
            setLoadingPhrase = data.status;
        }
        
    }
    setInterval(() => {
        if (localStorage.getItem("status") === "processing") 
            updateStatus()
    }, 5000);

    const test = () => {
        fetch("http://localhost:8000/api/resumes/status/1000");
    }
    return (
        <Stack sx={{ 
            maxWidth: 'fit-content', 
            marginLeft: 'auto', 
            marginRight: 'auto', 
            alignItems: 'center'}} 
            spacing={2}
        >
            <CircularProgress color="success" sx={{}} />
            <Typography >
                {loadingPhrase}
            </Typography>
        </Stack>
    )
}

export default StatusChecker;