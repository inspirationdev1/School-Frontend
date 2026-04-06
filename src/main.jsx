import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { AuthProvider } from './context/AuthContext.jsx'
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

axios.interceptors.request.use((request) => {
  if (localStorage.getItem("token")) {
    request.headers.Authorization = localStorage.getItem("token")
  }
  return request;
})
createRoot(document.getElementById('root')).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LocalizationProvider>
)
