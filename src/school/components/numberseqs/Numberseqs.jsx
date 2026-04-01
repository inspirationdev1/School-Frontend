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
    Autocomplete,
    Grid,
    Tabs, Tab,
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { numberseqSchema } from "../../../yupSchema/numberseqSchema";

export default function Numberseqs() {
    const [numberseqs, setNumberseqs] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [screens, setScreens] = useState([]);
    const [selectedScreen, setSelectedScreen] = useState(null);
    const [tab, setTab] = useState(0);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/numberseq/delete/${id}`)
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
        axios.get(`${baseUrl}/numberseq/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("numberseq_name", resp.data.data.numberseq_name);
                Formik.setFieldValue("screen", resp.data.data?.screen._id);
                setSelectedScreen(resp.data.data.screen);
                Formik.setFieldValue("seq", resp.data.data?.seq);
                Formik.setFieldValue("prefix", resp.data.data?.prefix);
                Formik.setFieldValue("suffix", resp.data.data?.suffix);

                setEditId(resp.data.data._id);
                setTab(0); // open Create Receipt tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        Formik.resetForm();
        setSelectedScreen(null);
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        numberseq_name: "",
        screen: "",
        seq: 0,
        prefix: "",
        suffix: "",
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: numberseqSchema,
        onSubmit: (values) => {
            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/numberseq/update/${editId}`, {
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
                    .post(`${baseUrl}/numberseq/create`, { ...values })
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


    const fetchNumberseqs = () => {
        axios
            .get(`${baseUrl}/numberseq/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setNumberseqs(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };

    const fetchScreens = async () => {
        try {
            const screenData = await axios.get(`${baseUrl}/screen/fetch-all`);
            console.log("screen", screenData)
            setScreens(screenData.data.data);

        } catch (error) {
            console.error('Error fetching screens:', error);
        }
    };

    useEffect(() => {
        fetchScreens();
        fetchNumberseqs();


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
            <Box
            >

                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    <Tabs
                        value={tab}
                        onChange={(e, newValue) => setTab(newValue)}
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        {/* <Tab label="Create Receipt" /> */}
                        <Tab label={isEdit ? "Edit Number Seq" : "Add New Number Seq"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box component={"div"} sx={{}}>
                        <Paper
                            sx={{ padding: '20px', margin: "10px" }}
                        >
                            {isEdit ? (
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: "800", textAlign: "center" }}
                                >
                                    Edit numberseq
                                </Typography>
                            ) : (
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: "800", textAlign: "center" }}
                                >
                                    Add New  numberseq
                                </Typography>
                            )}{" "}


                            <Box
                                component="form"
                                noValidate
                                autoComplete="off"
                                onSubmit={Formik.handleSubmit}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",      // mobile: 1 column
                                        sm: "1fr 1fr"   // desktop: 2 columns
                                    },
                                    gap: 2
                                }}
                            >


                                <Box>
                                    <TextField
                                        disabled
                                        fullWidth
                                        label="Numberseq Name"
                                        name="numberseq_name"
                                        value={Formik.values.numberseq_name}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />
                                    {Formik.touched.numberseq_name && Formik.errors.numberseq_name && (
                                        <p style={{ color: "red" }}>{Formik.errors.numberseq_name}</p>
                                    )}
                                </Box>


                                {/* Screen */}

                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={screens}
                                        getOptionLabel={(option) => option.screen_name}
                                        value={selectedScreen}
                                        onChange={(event, newValue) => {
                                            setSelectedScreen(newValue);
                                            Formik.setFieldValue("screen", newValue ? newValue._id : "");
                                            Formik.setFieldValue("numberseq_name", newValue ? newValue.screen_name : "");
                                        }}
                                        onBlur={() => Formik.setFieldTouched("screen", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Screen"
                                                fullWidth
                                                error={Formik.touched.screen && Boolean(Formik.errors.screen)}
                                                helperText={Formik.touched.screen && Formik.errors.screen}
                                            />
                                        )}
                                    />
                                </Box>


                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Seq"
                                        name="seq"
                                        value={Formik.values.seq}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />
                                    {Formik.touched.seq && Formik.errors.seq && (
                                        <p style={{ color: "red" }}>{Formik.errors.seq}</p>
                                    )}
                                </Box>


                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Prefix"
                                        name="prefix"
                                        value={Formik.values.prefix}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />
                                    {Formik.touched.prefix && Formik.errors.prefix && (
                                        <p style={{ color: "red" }}>{Formik.errors.prefix}</p>
                                    )}
                                </Box>


                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Suffix"
                                        name="suffix"
                                        value={Formik.values.suffix}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />
                                    {Formik.touched.suffix && Formik.errors.suffix && (
                                        <p style={{ color: "red" }}>{Formik.errors.suffix}</p>
                                    )}
                                </Box>






                                <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
                                    <Button type="submit" variant="contained" sx={{ mr: 2 }}>
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
                                        <TableCell component="th" scope="row"> numberseq Name</TableCell>
                                        <TableCell align="right">Screen</TableCell>
                                        <TableCell align="right">Seq</TableCell>
                                        <TableCell align="right">Prefix</TableCell>
                                        <TableCell align="right">Suffix</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {numberseqs.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {value.numberseq_name}
                                            </TableCell>
                                            <TableCell align="right">{value?.screen.screen_name}</TableCell>
                                            <TableCell align="right">{value?.seq}</TableCell>
                                            <TableCell align="right">{value?.prefix}</TableCell>
                                            <TableCell align="right">{value?.suffix}</TableCell>
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
