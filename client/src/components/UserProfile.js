import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import NavBar from "./NavBar";
import {
    Avatar,
    Box,
    Typography,
    CircularProgress,
  } from "@mui/material";

const UserProfile  = () => {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();
    
    useEffect(() => {

        if (!isAuthenticated || !user) {
            <div>Please log in to view your profile.</div>;
            navigate('/');
        }
    })

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
            <NavBar />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 3 }}>
            <Avatar
                alt={user.name || user.email}
                src={user.picture}
                sx={{ width: 80, height: 80, marginBottom: 2 }}
            />
            <Typography variant="h5" gutterBottom>
                {user.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {user.email}
            </Typography>
            {user.email_verified && (
                <Typography variant="body2" color="success" gutterBottom>
                Email Verified
                </Typography>
            )}
            {/* You can add more user information here */}
            <Typography variant="body2" gutterBottom>
                User ID: {user.sub}
            </Typography>
            {/* Example of displaying other user properties */}
            {user.nickname && (
                <Typography variant="body2" gutterBottom>
                Nickname: {user.nickname}
                </Typography>
            )}
            {/* Add any other profile-related content or actions */}
            </Box>
        </Box>
      );
};

export default UserProfile;