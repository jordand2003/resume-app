import React from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { 
    Stack, 
    CircularProgress,
    Typography,
    Alert,
} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import { green } from '@mui/material/colors';

const StatusChecker = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [failure, setFailure] = React.useState(false);
    const [ErrorMessage, setErrorMessage] = React.useState("");

    // Retreive Cookie on page load
    React.useEffect(() => {
        fetchCookie();
    }, []);

    // Periodically check for status if processing
    React.useEffect(() => {
        let timer = setTimeout(() => {
            if (loading)
                updateStatus();
        }, 250);
        return () => clearTimeout(timer);
    });

    const fetchCookie = () => {
        const status = localStorage.getItem("status");
        if (status === "Completed")
            setSuccess(true);
        if (status === "Processing")
            setLoading(true);
        if (status === "Failed") {
            setFailure(true);
            setErrorMessage(localStorage.getItem("error"));
        }
    }

    async function updateStatus() {
        console.log("update");
        let resumeId = localStorage.getItem("resumeId");
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get("http://localhost:8000/api/resumes/status/" + resumeId, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 200) {
                if (data.status !== localStorage.getItem("status")) {
                    localStorage.setItem("status", data.status);       // Update cookie storage
                    setSuccess(true);
                    setLoading(false);
                }
            } 
            else {
                localStorage.setItem("status", "Failed");
                localStorage.setItem("error", data.message);
                setFailure(true);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            setFailure(true);
            setErrorMessage("Unable to Retreive Resume Status" + error)
        }
    }

    return (
        <Stack sx={{ 
            maxWidth: 'fit-content', 
            marginLeft: 'auto', 
            marginRight: 'auto', 
            alignItems: 'center'
        }} 
        spacing={2} >
            {loading && (
                <CircularProgress color="secondary" />
            )} 
            {success && (
                <CheckIcon sx={{
                    color: green[500],
                }}/>
            )}
            {failure && (
                <Alert severity="error">{ErrorMessage}</Alert>
            )}
            {loading && (
                <Typography >
                    Processing...
                </Typography>
            )}
            {success && (
                <Typography >
                    Completed!
                </Typography>
            )}
        </Stack>
    )
}

export default StatusChecker;