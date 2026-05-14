// import * as React from 'react';
import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Outlet, useNavigate } from "react-router-dom";

// ICONS
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import TheatersIcon from '@mui/icons-material/Theaters';
import GradingIcon from '@mui/icons-material/Grading';
import HomeIcon from '@mui/icons-material/Home';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExplicitIcon from '@mui/icons-material/Explicit';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

export default function Student() {
    const { authenticated, user } = React.useContext(AuthContext);
    const [appsettings, setAppsettings] = useState([]);
    const [selectedAppsetting, setSelectedAppsetting] = useState(null)

    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

    const navArr = [
        // {link:"/", component:"Home", icon:HomeIcon},
        // { link: "/student", component: "Dashboard", icon: DashboardIcon },
        { link: "/student/student-details", component: "Your Details", icon: DashboardIcon },
        // { link: "/student/periods", component: "Periods", icon: CalendarMonthIcon },
        { link: "/student/periodschedule", component: "Periods", icon: CalendarMonthIcon },
        // { link: "/student/attendance", component: "Attendance", icon: GradingIcon },
        { link: "/student/studentreports", component: "Reports", icon: GradingIcon },

        // { link: "/student/examinations", component: "Examination", icon: ExplicitIcon },
        { link: "/student/notice", component: "Notice", icon: CircleNotificationsIcon },
        { link: "/logout", component: "Log Out", icon: LogoutIcon }
    ]

    const navigate = useNavigate();
    const handleNavigation = (link) => {
        navigate(link)
    }
    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
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

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
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
            <Drawer variant="permanent" open={open}>
                <DrawerHeader >
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List sx={{ height: "100%" }}>
                    {navArr && navArr.map((navItem, index) => (
                        <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                    justifyContent: 'flex-start', // always left align
                                }}


                                onClick={() => { handleNavigation(navItem.link) }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        mr: 2,
                                    }}
                                >

                                    <navItem.icon />
                                </ListItemIcon>
                                <ListItemText primary={navItem.component}
                                    sx={{
                                        whiteSpace: 'nowrap'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />

            </Drawer>
            <Box component="main" sx={{ flexGrow: 1 }}>
                <DrawerHeader />
                <Outlet />
            </Box>
        </Box>
    );
}