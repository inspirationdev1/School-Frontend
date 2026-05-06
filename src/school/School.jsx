import * as React from "react";
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
  Collapse,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const drawerWidth = 240;

export default function School() {
  const { user, selectedAppsetting } = React.useContext(AuthContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = (label) => {
    setOpenMenu((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavigation = (link) => {
    navigate(link);
    if (isMobile) setOpen(false);
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
                { label: "Periods", link: "/school/period" },
                { label: "Schedule", link: "/school/periods" },
                { label: "Attendee", link: "/school/attendee" },
                { label: "Notice", link: "/school/notice" },
            ],
        },
        {
            label: "Students",
            icon: GroupIcon,
            children: [
                { label: "Students", link: "/school/students" },
                { label: "Parents", link: "/school/parents" },
                // { label: "Attendee", link: "/school/attendance" },

                { label: "Bonafide Cert", link: "/school/bonafidecertificate" },
                { label: "Transfer Cert", link: "/school/transfercertificate" },
                { label: "Caste Cert", link: "/school/castecertificate" },
                { label: "Enquiry form", link: "/school/enquiry" },
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
            label: "Staffs",
            icon: GroupIcon,
            children: [
                { label: "Teachers", link: "/school/teachers" },
                { label: "Staff", link: "/school/employees" },
                { label: "Reports", link: "/school/staffreports" },
            ],
        },
        {
            label: "Finance",
            icon: MenuBookIcon,
            children: [
                { label: "Expense Type", link: "/school/expensetype" },
                { label: "Expenses", link: "/school/expense" },
                { label: "Payments", link: "/school/payment" },
                { label: "Reports", link: "/school/financereports" },
                { label: "Account Level", link: "/school/accountlevel" },
                { label: "Account Ledger", link: "/school/accountledger" },


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
            label: "Settings",
            icon: GroupIcon,
            children: [
                { label: "Number Seq", link: "/school/numberseq" },
                { label: "App Settings", link: "/school/appsetting" },
                { label: "General Master", link: "/school/generalmaster" },
                { label: "Upload Data", link: "/school/uploaddata" },
            ],
        },

        {
            label: "Logout",
            icon: LogoutIcon,
            link: "/logout",
        },
    ];

  // ✅ Drawer Content
  const drawerContent = (
    <Box>
      <Toolbar />
      <Divider />

      <List>
        {navArr.map((item, index) => {
          const Icon = item.icon;
          const hasChildren = !!item.children;
          const isActive = location.pathname === item.link;

          return (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() =>
                    hasChildren
                      ? toggleMenu(item.label)
                      : handleNavigation(item.link)
                  }
                  sx={{
                    backgroundColor: isActive ? "rgba(0,0,0,0.08)" : "transparent",
                  }}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>

                  <ListItemText primary={item.label} />

                  {hasChildren &&
                    (openMenu[item.label] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {/* Children */}
              {hasChildren && (
                <Collapse in={openMenu[item.label]} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child, i) => {
                      const isChildActive =
                        location.pathname === child.link;

                      return (
                        <ListItemButton
                          key={i}
                          sx={{
                            pl: 6,
                            backgroundColor: isChildActive
                              ? "rgba(0,0,0,0.08)"
                              : "transparent",
                          }}
                          onClick={() => handleNavigation(child.link)}
                        >
                          <ListItemText primary={child.label} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
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

          {/* CENTER TITLE */}
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: { xs: "60%", md: "80%" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {isMobile ? "SMS" : "School Management System"}
          </Typography>

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
              {user?.owner_name}
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
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth },
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
