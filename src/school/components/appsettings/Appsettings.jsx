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
import { appsettingSchema } from "../../../yupSchema/appsettingSchema";

export default function Appsettings() {
    const [appsettings, setAppsettings] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);


    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/appsetting/delete/${id}`)
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
        axios.get(`${baseUrl}/appsetting/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("appsetting_name", resp.data.data.appsetting_name);
                Formik.setFieldValue("appsetting_code", resp.data.data.appsetting_code);
                Formik.setFieldValue("udise_no", resp.data.data.udise_no);
                Formik.setFieldValue("discPerAllowed", resp.data.data.discPerAllowed);
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
        appsetting_name: "",
        appsetting_code: "",
        discPerAllowed: 0,
        udise_no:null,
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: appsettingSchema,
        onSubmit: (values) => {
            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/appsetting/update/${editId}`, {
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
                    .post(`${baseUrl}/appsetting/create`, { ...values })
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



    const fetchAppsettings = () => {
        axios
            .get(`${baseUrl}/appsetting/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setAppsettings(resp.data.data);
                const id = resp.data.data[0]._id;
                handleEdit(id);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };
    useEffect(() => {
        fetchAppsettings();

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
                        <Tab label={isEdit ? "Edit Appsettings" : "Add New Appsettings"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        <Paper sx={{ p: 3, m: 2 }}>
                            <Box
                                component="form"
                                noValidate
                                autoComplete="off"
                                onSubmit={Formik.handleSubmit}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2, // ✅ uniform spacing
                                }}
                            >
                                {/* Appsetting Name */}
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Appsettings Text"
                                        name="appsetting_name"
                                        value={Formik.values.appsetting_name}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {Formik.touched.appsetting_name && Formik.errors.appsetting_name && (
                                        <Typography color="error" variant="caption">
                                            {Formik.errors.appsetting_name}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Appsetting Code */}
                                <Box>
                                    <TextField
                                        disabled={isEdit}
                                        fullWidth
                                        label="Appsettings Code"
                                        name="appsetting_code"
                                        value={Formik.values.appsetting_code}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {Formik.touched.appsetting_code && Formik.errors.appsetting_code && (
                                        <Typography color="error" variant="caption">
                                            {Formik.errors.appsetting_code}
                                        </Typography>
                                    )}
                                </Box>

                                {/* UDISE No */}
                                <Box>
                                    <TextField
                                        // disabled={isEdit}
                                        fullWidth
                                        label="UDISE No"
                                        name="udise_no"
                                        value={Formik.values.udise_no}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {/* {Formik.touched.udise_no && Formik.errors.udise_no && (
                                        <Typography color="error" variant="caption">
                                            {Formik.errors.udise_no}
                                        </Typography>
                                    )} */}
                                </Box>

                                {/* Discount % */}
                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Disc % Allowed"
                                        name="discPerAllowed"
                                        value={Formik.values.discPerAllowed}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {Formik.touched.discPerAllowed && Formik.errors.discPerAllowed && (
                                        <Typography color="error" variant="caption">
                                            {Formik.errors.discPerAllowed}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Buttons */}
                                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                    <Button type="submit" variant="contained">
                                        Submit
                                    </Button>

                                    {isEdit && (
                                        <Button variant="outlined" onClick={cancelEdit}>
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
                                        <TableCell component="th" scope="row"> appsetting Name</TableCell>
                                        <TableCell align="right">Code</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {appsettings.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {value.appsetting_name}
                                            </TableCell>
                                            <TableCell align="right">{value.appsetting_code}</TableCell>
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
