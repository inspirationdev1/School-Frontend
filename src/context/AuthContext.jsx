/* eslint-disable react/prop-types */
import React, { createContext, useState, useEffect } from 'react';
import axios from "axios";
import { baseUrl } from "../environment";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState(null); // Holds user data (e.g., id, name, role)
  const [loading, setLoading] = useState(false); // Loading state for initial auth check
  const [themeDark,setThemeDark] = useState(false)

  const [appsettings,setAppsettings] = useState([]);
  const [selectedAppsetting,setSelectedAppsetting] = useState(null)




  // Check for a token in localStorage to persist login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem("user");
    const theme  = localStorage.getItem("themeDark");

    fetchAppsettings();
    if(theme){
      console.log(theme,"THEME")
      setThemeDark(JSON.parse(theme))
    }
    // console.log("Token", token)
    if (token) {
      console.log("token", token)
      setAuthenticated(true)
      setUser(JSON.parse(userData));
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (credentials) => {
    setAuthenticated(true);
    setUser(credentials)
    console.log("login called", credentials)

  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user')
    setUser(null);
    setAuthenticated(false)
  };

  const themeChange =()=>{
    console.log(themeDark)
    localStorage.setItem("themeDark", `${!themeDark}`)
    setThemeDark(!themeDark)
  }

  const fetchAppsettings = () => {
        axios
            .get(`${baseUrl}/appsetting/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setAppsettings(resp.data.data);
                const id = resp.data.data[0]._id;
                setSelectedAppsetting(resp.data.data[0]);
                console.log("selectedAppseting",selectedAppsetting);
                
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };

  return (
    <AuthContext.Provider value={{authenticated, user, login, logout, loading,themeChange,themeDark,selectedAppsetting }}>
      {children}
    </AuthContext.Provider>
  );
};
