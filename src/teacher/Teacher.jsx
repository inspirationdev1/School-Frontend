import * as React from 'react';
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import ExplicitIcon from '@mui/icons-material/Explicit';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
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

export default function Teacher() {
    const { authenticated, user } = React.useContext(AuthContext);
    console.log("user", user);
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

    // { label: "Reports", link: "/school/schoolreports" },

    const navArr = [
        { link: "/", component: "Home", icon: HomeIcon },
        { link: "/teacher/details", component: "Details", icon: TheatersIcon },

        { link: "/teacher/periods", component: "Periods", icon: CalendarMonthIcon },
        { link: "/teacher/attendance", component: "Attendance", icon: RecentActorsIcon },
        { link: "/teacher/marksheet", component: "Marksheets", icon: RecentActorsIcon },
        { link: "/teacher/questionpapers", component: "Questionpapers", icon: RecentActorsIcon },
        // { label: "Questionpapers", link: "/school/questionpapers" },
        // { label: "Marksheets", link: "/school/marksheet" },
        // { link: "/teacher/examinations", component: "Examinations", icon: ExplicitIcon },
        { link: "/teacher/teacherreports", component: "Reports", icon: ExplicitIcon },
        { link: "/teacher/notice", component: "Notice", icon: CircleNotificationsIcon },
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

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ position: "relative" }}>

                    {/* Left Section */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" noWrap sx={{ mr: 2 }}>
                            {user?.role === 'TEACHER' && user?.name}
                        </Typography>

                        <AccountCircleIcon />
                    </Box>

                    {/* Center Title */}
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                        }}
                    >
                        School Management System
                    </Typography>

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