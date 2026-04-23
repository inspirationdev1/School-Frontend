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
import { castecertificateSchema } from "../../../yupSchema/castecertificateSchema";

export default function Castecertificates() {
    const [castecertificates, setCastecertificates] = useState([]);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [castecategories, setCastecategories] = useState([]);
    const [selectedCastecategory, setSelectedCastecategory] = useState(null);


    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);
    const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

    const [selectedYear, setSelectedYear] = useState(null);

    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: `${year}-${year + 1}`, value: year };
    });



    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/castecertificate/delete/${id}`)
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
        axios.get(`${baseUrl}/castecertificate/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("castecertificate_name", resp.data.data.castecertificate_name);
                Formik.setFieldValue("castecertificate_code", resp.data.data.castecertificate_code);
                

                Formik.setFieldValue(
                    "docDate",
                    resp.data.data.docDate ? dayjs(resp.data.data.docDate).format("YYYY-MM-DD") : ""
                );
                Formik.setFieldValue("docTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));

                Formik.setFieldValue("class", resp.data.data?.class?._id);
                setSelectedClass(resp.data.data?.class);

                Formik.setFieldValue("section", resp.data.data?.section?._id);
                setSelectedSection(resp.data.data?.section);
                Formik.setFieldValue("student", resp.data.data?.student?._id);
                setSelectedStudent(resp.data.data?.student);

                Formik.setFieldValue("castecategory", resp.data.data?.generalmaster?._id);
                setSelectedCastecategory(resp.data.data?.castecategory);


                Formik.setFieldValue("remarks", resp.data.data.remarks);
                Formik.setFieldValue("year", resp.data.data.year);

                const matchedYear = years.find(s => s.value === resp.data.data.year);
                setSelectedYear(matchedYear || null);

                setEditId(resp.data.data._id);
                setTab(0); // open Create Class tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        setSelectedClass(null);
        setSelectedSection(null);
        setSelectedStudent(null);
        setSelectedCastecategory(null);
        setSelectedYear(null);
        Formik.resetForm()
    };

    const handlePrint = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);


        window.open(`/school/CastecertificatePrint?id=${id}`,
            '_blank');
        setPrint(false);


    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        castecertificate_name: "",
        castecertificate_code: "",
        class: "",
        section: "",
        student: "",
        docDate: "",
        docTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        status: "valid",
        remarks: "",
        year: "",
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: castecertificateSchema,
        onSubmit: (values) => {
            values.class = selectedClass?._id;
            values.section = selectedSection?._id;
            values.student = selectedStudent?._id;

            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/castecertificate/update/${editId}`, {
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
                    .post(`${baseUrl}/castecertificate/create`, { ...values })
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


    const fetchcastecertificates = () => {
        axios
            .get(`${baseUrl}/castecertificate/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setCastecertificates(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };
    const fetchclasses = () => {
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

    const fetchsections = () => {
        axios
            .get(`${baseUrl}/section/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setSections(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };
    const fetchStudents = async () => {
        try {
            const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`, {
                params: {
                    student_class: selectedClass?._id,
                    section: selectedSection?._id
                }
            }); // Fetch based on class
            setStudents(studentsResponse.data.data);

        } catch (error) {
            console.error('Error fetching students or checking attendance:', error);
        }
    };

    const fetchcastecategories = () => {
        axios
            .get(`${baseUrl}/generalmaster/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setCastecategories(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };

    useEffect(() => {
        fetchclasses();
        fetchsections();
        fetchcastecategories();
        fetchcastecertificates();

    }, [message]);


    useEffect(() => {
        fetchStudents();

    }, [selectedClass, selectedSection]);


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
                        <Tab label={isEdit ? "Edit Castecertificate" : "Add New Castecertificate"} />
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

                                {/* Castecertificate Name */}
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Castecertificate Name"
                                        name="castecertificate_name"
                                        value={Formik.values.castecertificate_name}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {Formik.touched.castecertificate_name && Formik.errors.castecertificate_name && (
                                        <p style={{ color: "red" }}>
                                            {Formik.errors.castecertificate_name}
                                        </p>
                                    )}
                                </Box>

                                {/* Castecertificate Code */}
                                <Box>
                                    <TextField
                                        disabled={isEdit}
                                        fullWidth
                                        label="Castecertificate Code"
                                        name="castecertificate_code"
                                        value={Formik.values.castecertificate_code}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        size="small"
                                    />
                                    {Formik.touched.castecertificate_code && Formik.errors.castecertificate_code && (
                                        <p style={{ color: "red" }}>
                                            {Formik.errors.castecertificate_code}
                                        </p>
                                    )}
                                </Box>

                                {/* doc Date */}
                                <Box>
                                    <TextField
                                        name="docDate"
                                        label="Date"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={Formik.values.docDate}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        disabled={isEdit}

                                    />
                                    {Formik.touched.docDate && Formik.errors.docDate && (
                                        <Typography color="error" variant="caption">
                                            {Formik.errors.docDate}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Academic Year */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={years}
                                        getOptionLabel={(option) => option.label}
                                        value={selectedYear}
                                        onChange={(event, newValue) => {
                                            setSelectedYear(newValue);

                                            Formik.setFieldValue(
                                                "year",
                                                newValue ? newValue.value : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("year", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Academic Year"
                                                placeholder="Search year..."
                                                fullWidth
                                                error={Formik.touched.year && Boolean(Formik.errors.year)}
                                                helperText={Formik.touched.year && Formik.errors.year}
                                            />
                                        )}
                                    />
                                </Box>


                                {/* Class Dropdown */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={classes}
                                        getOptionLabel={(option) => option.class_name}
                                        value={selectedClass}
                                        onChange={(event, newValue) => {
                                            setSelectedClass(newValue);

                                            Formik.setFieldValue(
                                                "class",
                                                newValue ? newValue._id : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("class", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select class"
                                                placeholder="Search Class..."
                                                fullWidth
                                                error={Formik.touched.class && Boolean(Formik.errors.class)}
                                                helperText={Formik.touched.class && Formik.errors.class}
                                            />
                                        )}
                                    />

                                </Box>

                                {/* Section Dropdown */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={sections}
                                        getOptionLabel={(option) => option.section_name}
                                        value={selectedSection}
                                        onChange={(event, newValue) => {
                                            setSelectedSection(newValue);

                                            Formik.setFieldValue(
                                                "section",
                                                newValue ? newValue._id : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("section", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select section"
                                                placeholder="Search Section..."
                                                fullWidth
                                                error={Formik.touched.section && Boolean(Formik.errors.section)}
                                                helperText={Formik.touched.section && Formik.errors.section}
                                            />
                                        )}
                                    />

                                </Box>


                                {/* Student Dropdown */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={students}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedStudent}
                                        onChange={(event, newValue) => {
                                            setSelectedStudent(newValue);

                                            Formik.setFieldValue(
                                                "student",
                                                newValue ? newValue._id : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("student", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select student"
                                                placeholder="Search Student..."
                                                fullWidth
                                                error={Formik.touched.student && Boolean(Formik.errors.student)}
                                                helperText={Formik.touched.student && Formik.errors.student}
                                            />
                                        )}
                                    />

                                </Box>

                                {/* Castecategory Dropdown */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={castecategories}
                                        getOptionLabel={(option) => option.generalmaster_name}
                                        value={selectedCastecategory}
                                        onChange={(event, newValue) => {
                                            setSelectedCastecategory(newValue);

                                            Formik.setFieldValue(
                                                "castecategory",
                                                newValue ? newValue._id : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("castecategory", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select castecategory"
                                                placeholder="Search castecategory..."
                                                fullWidth
                                                error={Formik.touched.castecategory && Boolean(Formik.errors.castecategory)}
                                                helperText={Formik.touched.castecategory && Formik.errors.castecategory}
                                            />
                                        )}
                                    />

                                </Box>

                                {/* Remarks → full width */}
                                <Box sx={{ gridColumn: "1 / -1" }}>
                                    <TextField
                                        fullWidth
                                        label="Remarks"
                                        variant="outlined"
                                        name="remarks"
                                        value={Formik.values.remarks}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                        multiline
                                        rows={3}
                                    />
                                    {Formik.touched.remarks && Formik.errors.remarks && (
                                        <Typography color="error" variant="caption">
                                            {Formik.errors.remarks}
                                        </Typography>
                                    )}
                                </Box>


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
                                        <TableCell component="th" scope="row"> castecertificate Name</TableCell>
                                        <TableCell align="right">Code</TableCell>
                                        <TableCell align="right">Class</TableCell>
                                        <TableCell align="right">Section</TableCell>
                                        <TableCell align="right">Student</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {castecertificates.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {value.castecertificate_name}
                                            </TableCell>
                                            <TableCell align="right">{value.castecertificate_code}</TableCell>
                                            <TableCell align="right">{value.class?.class_name}</TableCell>
                                            <TableCell align="right">{value.section?.section_name}</TableCell>
                                            <TableCell align="right">{value.student?.name}</TableCell>
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

                                                    <Button
                                                        variant="contained"
                                                        sx={{ background: "green", color: "#fff" }}
                                                        onClick={() => handlePrint(value._id)}
                                                    >
                                                        Print
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
