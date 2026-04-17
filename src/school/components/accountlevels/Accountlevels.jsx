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
    Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete,
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { accountlevelSchema } from "../../../yupSchema/accountlevelSchema";

export default function Accountlevels() {
    const [accountlevels, setAccountlevels] = useState([]);
    const [selectedAccountlevel, setSelectedAccountlevel] = useState(null);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);



    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/accountlevel/delete/${id}`)
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
        axios.get(`${baseUrl}/accountlevel/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("accountlevel_name", resp.data.data.accountlevel_name);
                Formik.setFieldValue("accountlevel_code", resp.data.data.accountlevel_code);
                Formik.setFieldValue("levelId", resp.data.data?.levelId);
                setSelectedAccountlevel(resp.data.data?.levelId);
                setEditId(resp.data.data._id);
                setTab(0); // open Create Class tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        setSelectedAccountlevel(null);
        Formik.resetForm()
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        accountlevel_name: "",
        accountlevel_code: "",
        levelId: "",
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: accountlevelSchema,
        onSubmit: (values) => {
            values.levelId = selectedAccountlevel?._id||null;
            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/accountlevel/update/${editId}`, {
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
                    .post(`${baseUrl}/accountlevel/create`, { ...values })
                    .then((resp) => {
                        console.log("Response after submitting admin casting", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        cancelEdit();
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


    const fetchstudentsaccountlevel = () => {
        axios
            .get(`${baseUrl}/accountlevel/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setAccountlevels(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };
    useEffect(() => {
        fetchstudentsaccountlevel();

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
                        <Tab label={isEdit ? "Edit Accountlevel" : "Add New Accountlevel"} />
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
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, // ✅ 2 columns
                                    gap: 2,
                                }}
                            >

                                {/* Accountlevel Name */}
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Accountlevel Text"
                                        name="accountlevel_name"
                                        value={Formik.values.accountlevel_name}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {Formik.touched.accountlevel_name && Formik.errors.accountlevel_name && (
                                        <p style={{ color: "red" }}>
                                            {Formik.errors.accountlevel_name}
                                        </p>
                                    )}
                                </Box>

                                {/* Accountlevel Code */}
                                <Box>
                                    <TextField
                                        disabled={isEdit}
                                        fullWidth
                                        label="Accountlevel Code"
                                        name="accountlevel_code"
                                        value={Formik.values.accountlevel_code}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {Formik.touched.accountlevel_code && Formik.errors.accountlevel_code && (
                                        <p style={{ color: "red" }}>
                                            {Formik.errors.accountlevel_code}
                                        </p>
                                    )}
                                </Box>

                                {/* Accountlevels Dropdown */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={accountlevels}
                                        getOptionLabel={(option) => option?.accountlevel_name || ""}
                                        value={selectedAccountlevel}
                                        onChange={(event, newValue) => {
                                            setSelectedAccountlevel(newValue);
                                            Formik.setFieldValue(
                                                "levelId",
                                                newValue ? newValue._id : ""
                                            );
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Account Level"
                                                placeholder="Search Account Level..."
                                                fullWidth
                                                size="small"
                                            />
                                        )}
                                    />
                                </Box>

                                {/* Empty Box (for alignment) */}
                                <Box />

                                {/* Buttons (Full Width) */}
                                <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{ mr: 1 }}
                                    >
                                        Submit
                                    </Button>

                                    {isEdit && (
                                        <Button
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
                                        <TableCell component="th" scope="row"> accountlevel Name</TableCell>
                                        <TableCell align="right">Code</TableCell>
                                        <TableCell align="right">Account Level</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accountlevels.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {value.accountlevel_name}
                                            </TableCell>
                                            <TableCell align="right">{value.accountlevel_code}</TableCell>
                                            <TableCell align="right">{value.levelId?.accountlevel_name}</TableCell>
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
