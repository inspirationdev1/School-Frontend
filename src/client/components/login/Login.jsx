import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { Form, useFormik } from "formik";
import { loginSchema } from "../../../yupSchema/loginSchema";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./Login.css"
import { AuthContext } from "../../../context/AuthContext";

export default function Login() {
    let { role } = useParams();
    console.log(role);
    const [loginType, setLoginType] = useState("school_owner");
    const [isloginType, setIsloginType] = useState(false);

    const { authenticated, login } = useContext(AuthContext);
    
    useEffect(() => {
        if (role) {
            role=role.toLowerCase();
            if (role!=="school"){
                setIsloginType(true);
                setLoginType(role);
            }else{
                setLoginType("school_owner");
            }
            
        } else {
            setLoginType("school_owner");
            setIsloginType(false);
        }
    }, [role]);


    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const navigate = useNavigate()


    const resetMessage = () => {
        setMessage("")
    }

    const handleSelection = (e) => {
        setLoginType(e.target.value)
        resetInitialValue();

    }

    const resetInitialValue = () => {
        Formik.setFieldValue("email", "");
        Formik.setFieldValue("password", "")
    }

    const initialValues = {
        email: "",
        password: ""
    }
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: loginSchema,
        onSubmit: (values) => {

            if (loginType === null || loginType === "") {
                Alert("Select user type");
                return;
            }
            console.log("Login Formik values", values)
            let url;
            let navUrl;
            if (loginType == "school_owner") {
                url = `${baseUrl}/school/login`;
                navUrl = '/school'
            } else if (loginType == "teacher") {
                url = `${baseUrl}/teacher/login`
                navUrl = '/teacher'
            } else if (loginType == "student") {
                url = `${baseUrl}/student/login`
                navUrl = '/student'
            } else if (loginType == "parent") {
                url = `${baseUrl}/parent/login`
                navUrl = '/parent'
            } else if (loginType == "user") {
                url = `${baseUrl}/user/login`
                navUrl = '/user'
            }
            axios.post(url, { ...values }).then(resp => {
                setMessage(resp.data.message)
                setType("success")
                let token = resp.headers.get("Authorization");
                if (resp.data.success) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("user", JSON.stringify(resp.data.user));
                    navigate(navUrl)
                    login(resp.data.user)
                }
                Formik.resetForm();
            }).catch(e => {
                setMessage(e.response.data.message);
                setType("error")
                console.log("Error in  register submit", e.response.data.message)
            })


        }
    })

    return (<Box component={'div'} sx={{ width: "100%", height: "80vh", background: "url(https://cdn.pixabay.com/photo/2017/08/12/21/42/back2school-2635456_1280.png)", backgroundSize: "cover" }}>

        {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}

        <Box component={'div'} sx={{ padding: '40px', maxWidth: "700px", margin: "auto" }} >
            <Box sx={{ display: 'flex', justifyContent: "center", alignItems: "center", }} component={'div'}>
                <Typography variant="h2">Log In</Typography>
            </Box>
            
            <Paper sx={{ p: 4, mt: 2, maxWidth: 400, mx: "auto" }}>
                <Box
                    component="form"
                    noValidate
                    autoComplete="off"
                    onSubmit={Formik.handleSubmit}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2, // 🔥 consistent spacing
                    }}
                >
                    {/* User Type */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="user-type-label">User Type</InputLabel>
                        <Select
                            disabled={isloginType}
                            labelId="user-type-label"
                            label="User Type"
                            value={loginType}
                            onChange={handleSelection}
                        >
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="teacher">Teacher</MenuItem>
                            <MenuItem value="school_owner">Admin / School Owner</MenuItem>
                            <MenuItem value="parent">Parent</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Email */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        name="email"
                        value={Formik.values.email}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.email && Formik.errors.email && (
                        <Typography color="error" fontSize={13}>
                            {Formik.errors.email}
                        </Typography>
                    )}

                    {/* Password */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Password"
                        type="password"
                        name="password"
                        value={Formik.values.password}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.password && Formik.errors.password && (
                        <Typography color="error" fontSize={13}>
                            {Formik.errors.password}
                        </Typography>
                    )}

                    {/* Button */}
                    <Button type="submit" variant="contained" fullWidth>
                        Login
                    </Button>
                </Box>
            </Paper>

        </Box>
    </Box>)
}