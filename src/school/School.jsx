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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import Collapse from '@mui/material/Collapse';
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";


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

const drawerWidth = 200;

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
    // transition: theme.transitions.create(['width', 'margin'], {
    //     easing: theme.transitions.easing.sharp,
    //     duration: theme.transitions.duration.leavingScreen,
    // }),
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

export default function School() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);


    const [openMenu, setOpenMenu] = React.useState({});



    const toggleMenu = (label) => {
        setOpenMenu(prev => ({
            ...prev,
            [label]: !prev[label],
        }));
    };



    const navArr = [
        {
            label: "Dashboard",
            icon: DashboardIcon,
            link: "/school",
        },
        {
            label: "Academics",
            icon: MenuBookIcon,
            children: [
                { label: "Class", link: "/school/class" },
                { label: "Section", link: "/school/section" },
                { label: "Subjects", link: "/school/subject" },
                { label: "Departments", link: "/school/department" },
                { label: "Schedule", link: "/school/periods" },
                { label: "Notice", link: "/school/notice" },

            ],
        },
        {
            label: "Students",
            icon: GroupIcon,
            children: [
                { label: "Students", link: "/school/students" },
                { label: "Parents", link: "/school/parents" },
                { label: "Attendance", link: "/school/attendance" },
                { label: "Reports", link: "/school/studentreports" },
            ],
        },
        {
            label: "Fees",
            icon: FormatListNumberedIcon,
            children: [
                { label: "Fee Types", link: "/school/feestype" },
                { label: "Fee Structure", link: "/school/feestructure" },
                { label: "Fee Invoice", link: "/school/salesinvoice" },
                { label: "Receipts", link: "/school/receipt" },
            ],
        },
        {
            label: "Exam",
            icon: MenuBookIcon,
            children: [
                { label: "Examinations", link: "/school/examinations" },
                { label: "Questionpapers", link: "/school/questionpapers" },
                { label: "Marksheets", link: "/school/marksheet" },
                { label: "Reports", link: "/school/schoolreports" },
            ],
        },
        {
            label: "Human Res",
            icon: GroupIcon,
            children: [
                { label: "Teachers", link: "/school/teachers" },
                { label: "Staff", link: "/school/employees" },
            ],
        },
        {
            label: "Finance",
            icon: MenuBookIcon,
            children: [
                { label: "Expense Type", link: "/school/expensetype" },
                { label: "Expenses", link: "/school/expense" },
                { label: "Reports", link: "/school/financereports" },

            ],
        },
        {
            label: "Permissions",
            icon: GroupIcon,
            children: [
                { label: "Menu", link: "/school/menu" },
                { label: "Role", link: "/school/role" },
                { label: "Screen", link: "/school/screen" },
                { label: "Users", link: "/school/users" },
            ],
        },
        
        {
            label: "Logout",
            icon: LogoutIcon,
            link: "/logout",
        },
    ];


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
            <AppBar sx={{}} position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={[
                            {
                                marginRight: 5,
                            },
                            open && { display: 'none' },
                        ]}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        School Management System
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>

                <Divider />

                <List>
                    {navArr.map((item, index) => {
                        const Icon = item.icon;
                        const hasChildren = Boolean(item.children);

                        return (
                            <React.Fragment key={index}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() =>
                                            hasChildren
                                                ? toggleMenu(item.label)
                                                : handleNavigation(item.link)
                                        }
                                    >
                                        <ListItemIcon>
                                            <Icon />
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} />
                                        {hasChildren &&
                                            (openMenu[item.label] ? <ExpandLess /> : <ExpandMore />)}
                                    </ListItemButton>
                                </ListItem>

                                {hasChildren && (
                                    <Collapse in={openMenu[item.label]} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.children.map((child, idx) => (
                                                <ListItemButton
                                                    key={idx}
                                                    sx={{ pl: 6 }}
                                                    onClick={() => handleNavigation(child.link)}
                                                >
                                                    <ListItemText primary={child.label} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>

                <Divider />
            </Drawer>


            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: "100vh",
                    marginLeft: 16,
                    px: 2,
                    pt: 10, // space for AppBar height
                }}
            >

                <Outlet />
            </Box>

        </Box>
    );
}