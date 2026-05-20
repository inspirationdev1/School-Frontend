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
import { gradeSchema } from "../../../yupSchema/gradeSchema";

export default function Grades() {
    const [params, setParams] = useState({});
    const [grades, setGrades] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/grade/delete/${id}`)
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
        axios.get(`${baseUrl}/grade/fetch-single/${id}`)
            .then((resp) => {

                Formik.setFieldValue("grade_code", resp.data.data?.grade_code);
                Formik.setFieldValue("gpa", resp.data.data?.gpa);
                Formik.setFieldValue("marks_limit", resp.data.data?.marks_limit);
                Formik.setFieldValue("marks_max", resp.data.data?.marks_max);
                Formik.setFieldValue("marks_min", resp.data.data?.marks_min);

                setEditId(resp.data.data._id);
                setTab(0); // open Create Grade tab
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

        grade_code: "",
        gpa: "",
        marks_limit: 0,
        marks_max: 0,
        marks_min: 0,
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: gradeSchema,
        onSubmit: (values) => {
            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/grade/update/${editId}`, {
                        ...values,
                    })
                    .then((resp) => {
                        console.log("Edit submit", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        cancelEdit();
                        setParams({});
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, edit casting submit", e);
                    });
            } else {

                axios
                    .post(`${baseUrl}/grade/create`, { ...values })
                    .then((resp) => {
                        console.log("Response after submitting admin casting", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        setParams({});
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

    const [noofgrades, setNoofgrades] = useState(0);
    const fetchGrades = () => {
        axios
            .get(`${baseUrl}/grade/fetch-with-query`, { params })
            .then((resp) => {
                setGrades(resp.data.data);
                setNoofgrades(resp.data.data.length);
            })
            .catch(() => console.log("Error in fetching grades data"));
        // axios
        //     .get(`${baseUrl}/grade/fetch-all`)
        //     .then((resp) => {
        //         console.log("Fetching data in  Casting Calls  admin.", resp);
        //         setGrades(resp.data.data);
        //     })
        //     .catch((e) => {
        //         console.log("Error in fetching casting calls admin data", e);
        //     });

    };
    useEffect(() => {
        fetchGrades();

    }, [message, params]);

    const handleSearch = (e) => {
        let newParam;
        if (e.target.value !== "") {
            newParam = { ...params, search: e.target.value };
        } else {
            newParam = { ...params };
            delete newParam["search"];
        }

        setParams(newParam);
    };
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
                        <Tab label={isEdit ? "Edit Grade" : "Add New Grade"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        <Paper sx={{ p: 3, m: 1 }}>
                            <Box
                                component="form"
                                noValidate
                                autoComplete="off"
                                onSubmit={Formik.handleSubmit}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2, // ✅ equal spacing between all items
                                }}
                            >






                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Marks Limit"
                                        name="marks_limit"
                                        value={Formik.values.marks_limit}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.marks_limit &&
                                        Formik.errors.marks_limit && (
                                            <p style={{ color: "red" }}>
                                                {Formik.errors.marks_limit}
                                            </p>
                                        )}
                                </Box>

                                

                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Marks(Min)"
                                        name="marks_min"
                                        value={Formik.values.marks_min}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.marks_min &&
                                        Formik.errors.marks_min && (
                                            <p style={{ color: "red" }}>
                                                {Formik.errors.marks_min}
                                            </p>
                                        )}
                                </Box>

                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Marks(Max)"
                                        name="marks_max"
                                        value={Formik.values.marks_max}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.marks_max &&
                                        Formik.errors.marks_max && (
                                            <p style={{ color: "red" }}>
                                                {Formik.errors.marks_max}
                                            </p>
                                        )}
                                </Box>


                                <Box>
                                    <TextField
                                        disabled={isEdit}
                                        fullWidth
                                        label="Grade"
                                        variant="outlined"
                                        name="grade_code"
                                        value={Formik.values.grade_code}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.grade_code && Formik.errors.grade_code && (
                                        <p style={{ color: "red", textTransform: "capitalize" }}>
                                            {Formik.errors.grade_code}
                                        </p>
                                    )}
                                </Box>

                                <Box>
                                    <TextField
                                        disabled={isEdit}
                                        fullWidth
                                        label="GPA"
                                        variant="outlined"
                                        name="gpa"
                                        value={Formik.values.gpa}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.gpa && Formik.errors.gpa && (
                                        <p style={{ color: "red", textTransform: "capitalize" }}>
                                            {Formik.errors.gpa}
                                        </p>
                                    )}
                                </Box>

                                <Box>
                                    <Button
                                        type="submit"
                                        sx={{ mr: 1 }}
                                        variant="contained"
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
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            {/* Search */}
                            <TextField
                                label="Search Grade .."
                                size="small"
                                onChange={handleSearch}
                                fullWidth
                                sx={{
                                    flex: 2,
                                    "& .MuiInputBase-root": {
                                        height: 42,
                                        fontSize: "14px",
                                    },
                                }}
                            />

                            {/* No of Grades */}
                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: { xs: "100%", sm: 160 },
                                    height: 42,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 2,
                                    bgcolor: "primary.main",
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    boxShadow: 2,
                                }}
                            >
                                Grades Count : {noofgrades}
                            </Box>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right">Marks Limit</TableCell>
                                        <TableCell align="right">Marks (Min)</TableCell>
                                        <TableCell align="right">Marks (Max)</TableCell>
                                        <TableCell align="right">Grade</TableCell>
                                        <TableCell align="right">GPA</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {grades.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >


                                            <TableCell align="right">{value?.marks_limit}</TableCell>
                                            <TableCell align="right">{value?.marks_min}</TableCell>
                                            <TableCell align="right">{value?.marks_max}</TableCell>
                                            <TableCell align="right">{value?.grade_code}</TableCell>
                                            <TableCell align="right">{value?.gpa}</TableCell>
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
