/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { AuthContext } from '../context/AuthContext';
import Draggable from 'react-draggable';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  Tabs,
  Tab,
} from "@mui/material";


const ThemeToggleButton = () => {
  const { themeDark, themeChange, user } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);



  const handleClick = () => {

    themeChange()
  };

  return (
    <>
      
      <Box>
        <Draggable>
          <IconButton
            onClick={handleClick}
            color="inherit"
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 10000,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              },
            }}
          >
            {!themeDark ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Draggable>
      </Box>
      
    </>


  );
};

export default ThemeToggleButton;
