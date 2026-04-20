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
import { attendeeSchema } from "../../../yupSchema/attendeeSchema";

export default function Attendees() {
    const [attendees, setAttendees] = useState([]);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);

    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);


    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);
    const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

   



    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/attendee/delete/${id}`)
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
        axios.get(`${baseUrl}/attendee/fetch-single/${id}`)
            .then((resp) => {
                

                Formik.setFieldValue("class", resp.data.data?.class?._id);
                setSelectedClass(resp.data.data?.class);

                Formik.setFieldValue("section", resp.data.data?.section?._id);
                setSelectedSection(resp.data.data?.section);
                Formik.setFieldValue("teacher", resp.data.data?.teacher?._id);
                setSelectedTeacher(resp.data.data?.teacher);

                Formik.setFieldValue("remarks", resp.data.data.remarks);
                
               
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
        setSelectedTeacher(null);
        
        Formik.resetForm()
    };

    const handlePrint = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);


        window.open(`/school/AttendeePrint?id=${id}`,
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
        class: "",
        section: "",
        teacher: "",
        status: "valid",
        remarks: "",
       
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: attendeeSchema,
        onSubmit: (values) => {
            values.class = selectedClass?._id;
            values.section = selectedSection?._id;
            values.teacher = selectedTeacher?._id;

            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/attendee/update/${editId}`, {
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
                    .post(`${baseUrl}/attendee/create`, { ...values })
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
                

            }
        },
    });

    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);


    const fetchattendees = () => {
        axios
            .get(`${baseUrl}/attendee/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setAttendees(resp.data.data);
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
    const fetchTachers = async () => {
        try {
            const teachersResponse = await axios.get(`${baseUrl}/teacher/fetch-with-query`, {
                params: {
                    teacher_class: selectedClass?._id,
                    section: selectedSection?._id
                }
            }); // Fetch based on class
            setTeachers(teachersResponse.data.data);

        } catch (error) {
            console.error('Error fetching teachers or checking attendance:', error);
        }
    };
    useEffect(() => {
        fetchclasses();
        fetchsections();
        fetchattendees();

    }, [message]);


    useEffect(() => {
        fetchTachers();

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
                        <Tab label={isEdit ? "Edit Attendee" : "Add New Attendee"} />
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


                                {/* Teacher Dropdown */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={teachers}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedTeacher}
                                        onChange={(event, newValue) => {
                                            setSelectedTeacher(newValue);

                                            Formik.setFieldValue(
                                                "teacher",
                                                newValue ? newValue._id : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("teacher", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select teacher"
                                                placeholder="Search Teacher..."
                                                fullWidth
                                                error={Formik.touched.teacher && Boolean(Formik.errors.teacher)}
                                                helperText={Formik.touched.teacher && Formik.errors.teacher}
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
                                        <TableCell align="left">Class</TableCell>
                                        <TableCell align="left">Section</TableCell>
                                        <TableCell align="left">Teacher</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendees.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                           
                                            <TableCell align="left">{value.class?.class_name}</TableCell>
                                            <TableCell align="left">{value.section?.section_name}</TableCell>
                                            <TableCell align="left">{value.teacher?.name}</TableCell>
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
