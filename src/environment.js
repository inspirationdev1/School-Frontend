// require("dotenv").config();   
   console.log(import.meta.env.VITE_BASE_URL);
   console.log(import.meta.env.VITE_FRONTEND_URL);

   const baseUrl = import.meta.env.VITE_BASE_URL;
   const frontendUrl = import.meta.env.VITE_FRONTEND_URL;

   // const baseUrl = 'http://localhost:5001/api';
   // const frontendUrl = 'http://localhost:5173';
   // const baseUrl = 'https://school-api-rgq0.onrender.com/api';
   // const frontendUrl = 'https://school-frontend-m01u.onrender.com';
   
   const formatAmount = (value) => {
  if (!value) return "0";
  return Number(value).toLocaleString("en-IN"); // Indian format
};
   export {baseUrl,frontendUrl,formatAmount}