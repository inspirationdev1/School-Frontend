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
    Autocomplete,
    Grid,
    FormControlLabel, Checkbox, FormGroup,
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { periodSchema } from "../../../yupSchema/periodSchema";


import { TimePicker } from "@mui/x-date-pickers/TimePicker";




export default function Periods() {
    const [periods, setPeriods] = useState([]);

    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [allClasses, setAllClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    const [allSections, setAllSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);

    const [allTeachers, setAllTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);



    const [tab, setTab] = useState(0);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);


    // Fetch all classes
    const fetchAllClasses = () => {
        axios
            .get(`${baseUrl}/class/fetch-all`)
            .then((resp) => {
                setAllClasses(resp.data.data);

            })
            .catch((e) => {
                console.error('Error in fetching all Classes');
            });
    };


    // Fetch all sections
    const fetchAllSections = () => {
        axios
            .get(`${baseUrl}/section/fetch-all`)
            .then((resp) => {
                setAllSections(resp.data.data);

            })
            .catch((e) => {
                console.error('Error in fetching all Sections');
            });
    };

    // Fetch all Teachers
    const fetchAllTeachers = () => {

        // const teacherResponse = await axios.get(`${baseUrl}/teacher/fetch-with-query`,{params:{}});
        axios
            .get(`${baseUrl}/teacher/fetch-with-query`, { params: {} })
            .then((resp) => {
                setAllTeachers(resp.data.data);
                setSelectedTeacher(null);
            })
            .catch((e) => {
                console.error('Error in fetching all Teachers');
            });
    };


    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/period/delete/${id}`)
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
        axios.get(`${baseUrl}/period/single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("period_name", resp.data.data.period_name);
                Formik.setFieldValue("period_code", resp.data.data.period_code);

                Formik.setFieldValue("class", resp.data?.data?.class?._id || "");
                setSelectedClass(resp.data.data.class);

                Formik.setFieldValue("section", resp.data?.data?.section?._id || "");
                setSelectedSection(resp.data.data.section);

                Formik.setFieldValue("teacher", resp.data?.data?.teacher?._id || "");
                setSelectedTeacher(resp.data.data.teacher);

                Formik.setFieldValue("subject", resp.data?.data?.subject?._id || "");
                setSelectedSubject(resp.data.data.subject);

                Formik.setFieldValue("starttime", resp.data.data.starttime);
                Formik.setFieldValue("endtime", resp.data.data.endtime);

                console.log("Days from API:", resp?.data?.data?.days);
                // ✅ FIXED DAYS
                Formik.setFieldValue("days", resp.data.data.days || []);

                setEditId(resp.data.data._id);
                setTab(0); // open Create Period tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        setSelectedClass(null);
        setSelectedSection(null);
        setSelectedSubject(null);
        setSelectedTeacher(null);
        setSelectedSubject(null);
        Formik.resetForm()
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        period_name: "",
        period_code: "",
        class: "",
        section: "",
        teacher: "",
        subject: "",
        starttime: "",
        endtime: "",
        days: [],
        // monday: true,
        // tuesday: true,
        // wednesday: true,
        // thursday: true,
        // friday: true,
        // saturday: true,
        // sunday: false
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: periodSchema,
        onSubmit: (values) => {
            console.log("values", values);
            const [hour, minute] = values.starttime.split(":");

            console.log(hour);   // 8
            console.log(minute); // 0
            const timeseq = hour.toString() + minute.toString();
            values.timeseq = timeseq;

            if (isEdit) {
                console.log("edit id", editId);
                axios
                    // .patch(`${baseUrl}/period/update/${editId}`, {
                    //     ...values,
                    // })
                    .patch(`${baseUrl}/period/update/${editId}`, {
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
                    .post(`${baseUrl}/period/create`, { ...values })
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


    const fetchPeriods = () => {
        axios
            .get(`${baseUrl}/period/all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setPeriods(resp?.data?.data || []); // ✅ SAFE
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
                setPeriods([]); // ✅ fallback
            });
    };

    const fetchSubjects = () => {
        axios
            .get(`${baseUrl}/subject/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setSubjects(resp?.data?.data || []); // ✅ SAFE
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
                setSubjects([]); // ✅ fallback
            });
    };
    useEffect(() => {

        fetchAllClasses();
        fetchAllSections();
        fetchAllTeachers();
        fetchSubjects();
        fetchPeriods();

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
                        <Tab label={isEdit ? "Edit Period" : "Add New Period"} />
                        <Tab label="View List" />

                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box component={"div"}>
                        <Paper sx={{ padding: "20px", margin: "10px" }}>
                            <Box
                                component="form"
                                noValidate
                                autoComplete="off"
                                onSubmit={Formik.handleSubmit}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",      // mobile: 1 column
                                        sm: "1fr 1fr",  // desktop: 2 columns
                                    },
                                    gap: 2,
                                }}
                            >

                                {/* Period Name */}
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Period Name"
                                        name="period_name"
                                        value={Formik.values.period_name}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />
                                    {Formik.touched.period_name && Formik.errors.period_name && (
                                        <p style={{ color: "red" }}>{Formik.errors.period_name}</p>
                                    )}
                                </Box>

                                {/* Period Code */}
                                <Box>
                                    <TextField
                                        disabled={isEdit}
                                        fullWidth
                                        label="Period Code"
                                        name="period_code"
                                        value={Formik.values.period_code}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />
                                    {Formik.touched.period_code && Formik.errors.period_code && (
                                        <p style={{ color: "red" }}>{Formik.errors.period_code}</p>
                                    )}
                                </Box>

                                {/* Class */}
                                <Box>
                                    <Autocomplete
                                        options={allClasses}
                                        getOptionLabel={(option) => option.class_name}
                                        value={selectedClass}
                                        onChange={(event, newValue) => {
                                            setSelectedClass(newValue);
                                            Formik.setFieldValue("class", newValue ? newValue._id : "");
                                        }}
                                        onBlur={() => Formik.setFieldTouched("class", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Class"
                                                placeholder="Search class..."
                                                fullWidth
                                                error={Formik.touched.class && Boolean(Formik.errors.class)}
                                                helperText={Formik.touched.class && Formik.errors.class}
                                            />
                                        )}
                                    />
                                </Box>

                                {/* Section */}
                                <Box>
                                    <Autocomplete
                                        options={allSections}
                                        getOptionLabel={(option) => option.section_name}
                                        value={selectedSection}
                                        onChange={(event, newValue) => {
                                            setSelectedSection(newValue);
                                            Formik.setFieldValue("section", newValue ? newValue._id : "");
                                        }}
                                        onBlur={() => Formik.setFieldTouched("section", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Section"
                                                placeholder="Search section..."
                                                fullWidth
                                                error={Formik.touched.section && Boolean(Formik.errors.section)}
                                                helperText={Formik.touched.section && Formik.errors.section}
                                            />
                                        )}
                                    />
                                </Box>

                                {/* Teacher */}
                                <Box>
                                    <Autocomplete
                                        options={allTeachers}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedTeacher}
                                        onChange={(event, newValue) => {
                                            setSelectedTeacher(newValue);
                                            Formik.setFieldValue("teacher", newValue ? newValue._id : "");
                                        }}
                                        onBlur={() => Formik.setFieldTouched("teacher", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Teacher"
                                                placeholder="Search teacher..."
                                                fullWidth
                                                error={Formik.touched.teacher && Boolean(Formik.errors.teacher)}
                                                helperText={Formik.touched.teacher && Formik.errors.teacher}
                                            />
                                        )}
                                    />
                                </Box>


                                {/* Subject */}
                                <Box>
                                    <Autocomplete
                                        options={subjects}
                                        getOptionLabel={(option) => option.subject_name}
                                        value={selectedSubject}
                                        onChange={(event, newValue) => {
                                            setSelectedSubject(newValue);
                                            Formik.setFieldValue("subject", newValue ? newValue._id : "");
                                        }}
                                        onBlur={() => Formik.setFieldTouched("subject", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Subject"
                                                placeholder="Search subject..."
                                                fullWidth
                                                error={Formik.touched.subject && Boolean(Formik.errors.subject)}
                                                helperText={Formik.touched.subject && Formik.errors.subject}
                                            />
                                        )}
                                    />
                                </Box>

                                {/* Start Time */}
                                <Box>
                                    <TimePicker
                                        label="Start Time"
                                        value={Formik.values.starttime ? dayjs(Formik.values.starttime, "HH:mm") : null}
                                        onChange={(newValue) => {
                                            Formik.setFieldValue(
                                                "starttime",
                                                newValue ? newValue.format("HH:mm") : ""
                                            );
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: Formik.touched.starttime && Boolean(Formik.errors.starttime),
                                                helperText: Formik.touched.starttime && Formik.errors.starttime,
                                            },
                                        }}
                                    />
                                </Box>

                                {/* End Time */}
                                <Box>
                                    <TimePicker
                                        label="End Time"
                                        value={Formik.values.endtime ? dayjs(Formik.values.endtime, "HH:mm") : null}
                                        onChange={(newValue) => {
                                            Formik.setFieldValue(
                                                "endtime",
                                                newValue ? newValue.format("HH:mm") : ""
                                            );
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: Formik.touched.endtime && Boolean(Formik.errors.endtime),
                                                helperText: Formik.touched.endtime && Formik.errors.endtime,
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ gridColumn: "1 / -1" }}>
                                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                                        Select Days
                                    </Typography>

                                    <FormGroup row>
                                        {[
                                            "Monday",
                                            "Tuesday",
                                            "Wednesday",
                                            "Thursday",
                                            "Friday",
                                            "Saturday",
                                            "Sunday",
                                        ].map((day) => (
                                            <FormControlLabel
                                                key={day}
                                                control={
                                                    <Checkbox
                                                        checked={Formik.values.days.includes(day)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                Formik.setFieldValue("days", [
                                                                    ...Formik.values.days,
                                                                    day,
                                                                ]);
                                                            } else {
                                                                Formik.setFieldValue(
                                                                    "days",
                                                                    Formik.values.days.filter((d) => d !== day)
                                                                );
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={day}
                                            />
                                        ))}
                                    </FormGroup>

                                    {/* Error */}
                                    {Formik.touched.days && Formik.errors.days && (
                                        <p style={{ color: "red" }}>{Formik.errors.days}</p>
                                    )}
                                </Box>


                                {/* Buttons - Full Width */}
                                <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
                                    <Button
                                        type="submit"
                                        sx={{ mr: 1 }}
                                        variant="contained"
                                    >
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
                                        <TableCell component="th" scope="row"> Period Name</TableCell>
                                        <TableCell align="right">Code</TableCell>
                                        <TableCell align="right">Starttime</TableCell>
                                        <TableCell align="right">Endtime</TableCell>
                                        <TableCell align="right">Class</TableCell>
                                        <TableCell align="right">Section</TableCell>
                                        <TableCell align="right">Teacher</TableCell>
                                        <TableCell align="right">Subject</TableCell>

                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {periods.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {value?.period_name || ""}
                                            </TableCell>
                                            <TableCell align="right">{value?.period_code || ""}</TableCell>
                                            <TableCell align="right">{value?.starttime || ""}</TableCell>
                                            <TableCell align="right">{value?.endtime || ""}</TableCell>
                                            <TableCell align="right">{value?.class?.class_name || ""}</TableCell>
                                            <TableCell align="right">{value?.section?.section_name || ""}</TableCell>
                                            <TableCell align="right">{value?.teacher?.name || ""}</TableCell>
                                            <TableCell align="right">{value?.subject?.subject_name || ""}</TableCell>
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
