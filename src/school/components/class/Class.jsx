/* eslint-disable react-hooks/exhaustive-deps */
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
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { classSchema } from "../../../yupSchema/classSchema";

export default function Class() {
    const [classes, setClasses] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/class/delete/${id}`)
                .then((resp) => {
                    setMessage(resp.data.message);
                    setType("success");
                })
                .catch((e) => {
                    setMessage(e.response.data.message);
                    setType("error");
                    console.log("Error, deleting", e);
                });
        }
    };
    const handleEdit = (id) => {
        console.log("Handle  Edit is called", id);
        setEdit(true);
        axios.get(`${baseUrl}/class/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("class_name", resp.data.data.class_name);
                Formik.setFieldValue("class_code", resp.data.data.class_code);
                setEditId(resp.data.data._id);
                setTab(0); // open Create Class tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        Formik.resetForm()
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        class_name: "",
        class_code: ""
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: classSchema,
        onSubmit: (values) => {
            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/class/update/${editId}`, {
                        ...values,
                    })
                    .then((resp) => {
                        console.log("Edit submit", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        cancelEdit();
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, edit casting submit", e);
                    });
            } else {

                axios
                    .post(`${baseUrl}/class/create`, { ...values })
                    .then((resp) => {
                        console.log("Response after submitting admin casting", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, response admin casting calls", e);
                    });
                Formik.resetForm();

            }
        },
    });

    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);


    const fetchClasses = () => {
        axios
            .get(`${baseUrl}/class/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setClasses(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };
    useEffect(() => {
        fetchClasses();

    }, [message]);
    return (
        <>
            {message && (
                <CustomizedSnackbars
                    reset={resetMessage}
                    type={type}
                    message={message}
                />
            )}
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    <Tabs
                        value={tab}
                        onChange={(e, newValue) => setTab(newValue)}
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        {/* <Tab label="Create Receipt" /> */}
                        <Tab label={isEdit ? "Edit Class" : "Add New Class"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                <Box component={"div"} sx={{}}>
                    <Paper
                        sx={{ padding: '20px', margin: "10px" }}
                    >
                        
                        <Box
                            component="form"
                            noValidate
                            autoComplete="off"
                            onSubmit={Formik.handleSubmit}
                        >


                            <TextField
                                fullWidth
                                sx={{ marginTop: "10px" }}
                                id="filled-basic"
                                label="Class Name "
                                variant="outlined"
                                name="class_name"
                                value={Formik.values.class_name}
                                onChange={Formik.handleChange}
                                onBlur={Formik.handleBlur}
                            />
                            {Formik.touched.class_name && Formik.errors.class_name && (
                                <p style={{ color: "red", textTransform: "capitalize" }}>
                                    {Formik.errors.class_name}
                                </p>
                            )}


                            <TextField
                                disabled={isEdit}
                                fullWidth
                                sx={{ marginTop: "10px" }}
                                id="filled-basic"
                                label="Class Code "
                                variant="outlined"
                                name="class_code"
                                value={Formik.values.class_code}
                                onChange={Formik.handleChange}
                                onBlur={Formik.handleBlur}
                            />
                            {Formik.touched.class_code && Formik.errors.class_code && (
                                <p style={{ color: "red", textTransform: "capitalize" }}>
                                    {Formik.errors.class_code}
                                </p>
                            )}








                            <Box sx={{ marginTop: "10px" }} component={"div"}>
                                <Button
                                    type="submit"
                                    sx={{ marginRight: "10px" }}
                                    variant="contained"
                                >
                                    Submit
                                </Button>
                                {isEdit && (
                                    <Button
                                        sx={{ marginRight: "10px" }}
                                        variant="outlined"
                                        onClick={cancelEdit}
                                    >
                                        Cancel Edit
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Box>
                )}


                {tab === 1 && (
                <Box>
                    
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell component="th" scope="row"> class Name</TableCell>
                                    <TableCell align="right">Code</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classes.map((value, i) => (
                                    <TableRow
                                        key={i}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {value.class_name}
                                        </TableCell>
                                        <TableCell align="right">{value.class_code}</TableCell>
                                        <TableCell align="right">

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    gap: 1.5, // 👈 space between buttons
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    sx={{ background: "red", color: "#fff" }}
                                                    onClick={() => handleDelete(value._id)}
                                                >
                                                    Delete
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    sx={{ background: "gold", color: "#222222" }}
                                                    onClick={() => handleEdit(value._id)}
                                                >
                                                    Edit
                                                </Button>
                                            </Box>
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Box>
                )}
            </Box>
        </>
    );
}
