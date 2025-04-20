import React from "react";
import { Box, Button } from "@mui/material";


const StatusChecker = () => {
    const fetchStatus = (userid) => {
        const expires = "expires=" + (Date.now() + (24 * 60 * 60 * 1000)); 
        document.cookie = "=" + userid + ";" +  expires + ";path=/";
    }
    const test = () => {
        fetch("http://localhost:8000/api/resumes/status/1000");
    }
    return (
        <Box>
            <button >Set</button>
            <button >Look</button> 
        </Box>
    )
}
export default StatusChecker;