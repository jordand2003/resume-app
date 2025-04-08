import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import HomeIcon from "@mui/icons-material/Home";

const NavBar = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout({ returnTo: window.location.origin });
  };

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  const handleDrawerItemClick = (route) => {
    navigate(route);
    setDrawerOpen(false);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {["/", "/resume-upload", "/career-history", "/education"].map(
          (route, index) => (
            <ListItem key={route} disablePadding>
              <ListItemButton onClick={() => handleDrawerItemClick(route)}>
                <ListItemIcon>
                  {/* Add your icons here, e.g., for each item */}
                  {index === 0 && <HomeIcon />}
                  {index === 1 && <UploadFileIcon />}
                  {index === 2 && <WorkIcon />}
                  {index === 3 && <SchoolIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    index === 0
                      ? "Home"
                      : index === 1
                      ? "Upload Resume"
                      : index === 2
                      ? "Career History"
                      : "Education"
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#2c3e50" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/home")}
          >
            Lighthouse
          </Typography>
          {isAuthenticated && (
            <>
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ mr: 2 }}
              >
                Logout
              </Button>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user?.name || user?.email}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <IconButton onClick={toggleDrawer(true)} color="inherit">
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {DrawerList}
              </Drawer>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
                  {user?.name || user?.email}
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
