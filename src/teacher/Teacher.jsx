// import * as React from "react";
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { baseUrl } from "../environment";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import TheatersIcon from "@mui/icons-material/Theaters";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import ExplicitIcon from "@mui/icons-material/Explicit";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const drawerWidth = 240;

export default function Teacher() {
  const { user } = React.useContext(AuthContext);
  const [appsettings, setAppsettings] = useState([]);
  const [selectedAppsetting, setSelectedAppsetting] = useState(null)

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const navArr = [
    { link: "/", label: "Home", icon: HomeIcon },
    { link: "/teacher/details", label: "Details", icon: TheatersIcon },
    { link: "/teacher/periods", label: "Periods", icon: CalendarMonthIcon },
    { link: "/teacher/attendance", label: "Attendance", icon: RecentActorsIcon },
    { link: "/teacher/marksheet", label: "Marksheets", icon: RecentActorsIcon },
    { link: "/teacher/questionpapers", label: "Questionpapers", icon: RecentActorsIcon },
    { link: "/teacher/teacherreports", label: "Reports", icon: ExplicitIcon },
    { link: "/teacher/notice", label: "Notice", icon: CircleNotificationsIcon },
    { link: "/logout", label: "Logout", icon: LogoutIcon },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (link) => {
    navigate(link);
    if (isMobile) setOpen(false); // close on mobile
  };

  useEffect(() => {
    fetchAppsettings();

  }, []);

  const fetchAppsettings = () => {
    axios
      .get(`${baseUrl}/appsetting/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setAppsettings(resp.data.data);
        const id = resp.data.data[0]._id;
        setSelectedAppsetting(resp.data.data[0]);
        console.log("selectedAppseting", selectedAppsetting);

      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };

  // ✅ Drawer Content
  const drawerContent = (
    <Box>
      <Toolbar />
      <Divider />

      <List>
        {navArr.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.link;

          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.link)}
                sx={{
                  backgroundColor: isActive ? "rgba(0,0,0,0.08)" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.12)",
                  },
                }}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* ✅ AppBar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ position: "relative" }}>

          {/* LEFT */}
          <IconButton color="inherit" onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>



          {/* CENTER LOGO + TITLE */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 1,
              maxWidth: { xs: "70%", md: "80%" },
            }}
          >
            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: { xs: 16, md: 20 },
              }}
            >
              {isMobile ? "SMS" : "School Management System"}
            </Typography>
            {/* Logo */}
            <Box
              component="img"
              src={selectedAppsetting?.toolbar_image || "/logo.png"}
              alt="School Logo"
              sx={{
                width: { xs: 100, md: 350 },
                height: { xs: 100, md: 150 },
                objectFit: "contain",
              }}
            />


          </Box>

          {/* RIGHT */}
          <Box
            sx={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AccountCircleIcon />

            <Typography
              sx={{
                maxWidth: { xs: 80, sm: 120 },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name}
            </Typography>

            <Typography
              sx={{
                display: { xs: "none", md: "block" },
                fontSize: 12,
              }}
            >
              UDISE: {selectedAppsetting?.udise_no}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ✅ Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
