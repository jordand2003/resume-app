import React, { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import NavBar from "./NavBar";
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Typography,
    CircularProgress,
    Menu,
    MenuItem,
  } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AccountCircle from '@mui/icons-material/AccountCircle';

const UserProfile  = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);    
    useEffect(() => {

        if (!isAuthenticated || !user) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, navigate])

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUseAccountIcon = () => {
        setAvatarUrl(null); //Reset to default/Auth0 picture
        handleMenuClose();
    };

    async function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          setAvatarUrl(imageUrl);
          handleMenuClose();
        }
    }

    async function handleSaveAvatar() {
        if (!avatarUrl) return; //error handling

        setIsUploading(true);
        setUploadError(null);

        try {
          console.log('Saving here:', avatarUrl);
          setIsUploading(false);
        } 
        catch (error) {
          console.error('Error saving avatar:', error);
          setUploadError('Failed to save avatar.');
          setIsUploading(false);
        }
    }
    

    ///Create wireframe for user profile; possibly give user the chance to upload
    //photo or go back to Account Icon/some default. 
    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
            <NavBar />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 3 }}>
                <Box sx={{ position: 'relative', mb: 2 }}>   
                    <Avatar
                        alt={user.name || user.email}
                        src={ avatarUrl || user?.picture}
                        sx={{ width: 80, height: 80, marginBottom: 2 }}
                    />
                    

                        <IconButton 
                            onClick={handleMenuOpen}
                            sx={{ mb: 1,
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' },
                            }}>
                            <EditIcon />
                        </IconButton>

                        
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleUseAccountIcon}>
                            Use Account Icon
                        </MenuItem>
                        <MenuItem>
                            <label htmlFor="avatar-upload-input">
                                Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="avatar-upload-input"
                                    onChange={handleAvatarUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </MenuItem>
                        {avatarUrl && (
                            <MenuItem onClick={handleSaveAvatar} disabled={isUploading}>
                                {isUploading ? <CircularProgress size={16} /> : 'Save Photo'}
                            </MenuItem>
                        )}
                        {uploadError && (
                            <MenuItem disabled>
                                <Typography color="error">{uploadError}</Typography>
                            </MenuItem>
                        )}
                    </Menu>
                        

                </Box> 

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
                <Typography variant="body2" gutterBottom>
                    User ID: {user.sub}
                </Typography>
                
            </Box>
        </Box>
      );
};

export default UserProfile;