import { Box, Button } from "@mui/material";
import axios from "axios";

const Temp = () => {
    const handleClick = () => {
        axios.get("http://localhost:8000/api/resumes/download/1", {
            headers: { Authorization: `Bearer ${token}` }
        });
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