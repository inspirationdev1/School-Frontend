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
    Alert,
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { schoolreportsSchema } from "../../../yupSchema/schoolreportsSchema";
import { AuthContext } from "../../../context/AuthContext";

export default function Sendwhatsapp() {
    const { authenticated, user } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    //   CLEARING IMAGE FILE REFENCE FROM INPUT
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);

    const [screenNames, setScreenNames] = useState([]);
    const [selectedScreen, setSelectedScreen] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [parents, setParents] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isPrint, setPrint] = useState(false);
    const [isDataValid, setIsDataValid] = useState(true);
    const [dataError, setDataError] = useState("");
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: `${year}-${year + 1}`, value: year };
    });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleClearFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
        setFile(null); // Reset the file state
    };

    const handleWhatsapp = async (values) => {
        // if (!file) return alert("Select file");

        // const fd = new FormData();
        const formData = new FormData();
        // Object.keys(values).forEach((key) => fd.append(key, values[key]));
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });
        
        formData.append("file", file);
        
        try {
            // if (selectedScreen?.screenId == "teacher") {
                await axios
                    .post(`${baseUrl}/whatsapp/send_bulk_whatsapp`, formData)
                    .then((resp) => {
                        setMessage(resp.data.message);
                        setType("success");
                        handleClearFile();
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, response whatsapp", e);
                    });
            // } 

            
        } catch (err) {
            console.error(err);
            setMessage(err.response.data.message);
            setType("error");
        }
    };

    const cancelEdit = () => {
        setEdit(false);
        Formik.resetForm();
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        screenId: "",
        class: "",
        parent: "",
        student: "",
        teacher: "",
        phone_no: "",
    };
    const Formik = useFormik({
        initialValues: initialValues,
        // validationSchema: schoolreportsSchema,
        onSubmit: (values) => {
            if (!values.screenId) {
                setDataError("Select the Screen Name");
                setIsDataValid(false);
                return;
            }

            // if (!file) {
            //     setDataError("Select the file");
            //     setIsDataValid(false);
            //     return;
            // }

            //   if (values.screenId == "accountlevel") {
            //   }

            setIsDataValid(true);
            handleWhatsapp(values);
        },
    });

    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);

    const fetchScreenNames = async () => {
        try {
            const screensData = [
                { screenId: "teacher", screenName: "Teacher" },
                { screenId: "parent", screenName: "Parent" },
                { screenId: "student", screenName: "Student" },
                { screenId: "class", screenName: "Class" },

            ];
            setScreenNames(screensData);
        } catch (error) {
            console.error("Error fetching Screen Names:", error);
        }
    };

    const fetchClass = async () => {
        try {
            const classData = await axios.get(`${baseUrl}/class/fetch-all`);
            console.log("class", classData)
            setClasses(classData.data.data);

        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };
    const fetchSection = async () => {
        try {
            const sectionsData = await axios.get(`${baseUrl}/section/fetch-all`);
            console.log("sections", sectionsData)
            setSections(sectionsData.data.data);

        } catch (error) {
            console.error('Error fetching section:', error);
        }
    };

    const fetchTeacher = async () => {
        const params = {};
        axios
            .get(`${baseUrl}/teacher/fetch-with-query`, { params: params })
            .then((resp) => {
                console.log("Fetching data in  teacher Calls  admin.", resp);
                setTeachers(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching teacher calls admin data", e);
            });

    };

    const fetchStudents = async () => {

        const params = {};

        try {
            const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`, {
                params: params
            }); // Fetch based on class
            setStudents(studentsResponse.data.data);

        } catch (error) {
            console.error('Error fetching students or checking attendance:', error);
        }
    };

    const fetchParents = async () => {

        const params = {};

        try {
            const parentsResponse = await axios.get(`${baseUrl}/parent/fetch-with-query`, {
                params: params
            }); // Fetch based on Parents
            setParents(parentsResponse.data.data);

        } catch (error) {
            console.error('Error fetching Parents or checking attendance:', error);
        }
    };

    useEffect(() => {
        fetchScreenNames();
        fetchTeacher();
        fetchClass();
        fetchSection();
        fetchStudents();
        fetchParents();
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
                <Box component={"div"} sx={{}}>
                    <Paper sx={{ padding: "20px", margin: "10px" }}>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: "800", textAlign: "center" }}
                        >
                            Send Whatsapp
                        </Typography>
                        <Box
                            component="form"
                            noValidate
                            autoComplete="off"
                            onSubmit={Formik.handleSubmit}
                        >
                            {!isDataValid && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {dataError}
                                </Alert>
                            )}

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr", // mobile
                                        md: "1fr 1fr", // desktop → 2 columns
                                    },
                                    gap: 2,
                                    mt: 2,
                                }}
                            >
                                {/* ScreenNames */}
                                <Box>
                                    <Autocomplete
                                        options={screenNames}
                                        getOptionLabel={(option) => option.screenName}
                                        value={selectedScreen}
                                        onChange={(event, newValue) => {
                                            setSelectedScreen(newValue);
                                            setSelectedClass(null);
                                            setSelectedParent(null);
                                            setSelectedStudent(null);
                                            setSelectedTeacher(null);
                                            Formik.setFieldValue(
                                                "phone_no",
                                                newValue ? "" : "",
                                            );

                                            Formik.setFieldValue(
                                                "screenId",
                                                newValue ? newValue.screenId : "",
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("screenId", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Screen Name"
                                                placeholder="Search screen name..."
                                                fullWidth
                                                error={
                                                    Formik.touched.screenId &&
                                                    Boolean(Formik.errors.screenId)
                                                }
                                                helperText={
                                                    Formik.touched.screenId && Formik.errors.screenId
                                                }
                                            />
                                        )}
                                    />
                                </Box>

                                {/* Class */}
                                {selectedScreen &&
                                    (selectedScreen.screenId === "class") && (
                                        <Box>
                                            <Autocomplete
                                                options={classes}
                                                getOptionLabel={(option) => option.class_name}
                                                value={selectedClass}
                                                onChange={(event, newValue) => {
                                                    setSelectedClass(newValue);

                                                    Formik.setFieldValue(
                                                        "class",
                                                        newValue ? newValue._id : "",
                                                    );

                                                     Formik.setFieldValue(
                                                        "phone_no",
                                                        newValue ? "" : "",
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("class", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Class"
                                                        placeholder="Search class..."
                                                        fullWidth
                                                        error={
                                                            Formik.touched.class &&
                                                            Boolean(Formik.errors.class)
                                                        }
                                                        helperText={
                                                            Formik.touched.class && Formik.errors.class
                                                        }
                                                    />
                                                )}
                                            />
                                        </Box>
                                    )}

                                {/* Section */}
                                {selectedScreen &&
                                    (selectedScreen.screenId === "section") && (
                                        <Box>
                                            <Autocomplete
                                                options={sections}
                                                getOptionLabel={(option) => option.section_name}
                                                value={selectedSection}
                                                onChange={(event, newValue) => {
                                                    setSelectedSection(newValue);
                                                    Formik.setFieldValue(
                                                        "section",
                                                        newValue ? newValue._id : "",
                                                    );
                                                    Formik.setFieldValue(
                                                        "phone_no",
                                                        newValue ? "" : "",
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("section", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Section"
                                                        placeholder="Search section..."
                                                        fullWidth
                                                        error={
                                                            Formik.touched.section &&
                                                            Boolean(Formik.errors.section)
                                                        }
                                                        helperText={
                                                            Formik.touched.section && Formik.errors.section
                                                        }
                                                    />
                                                )}
                                            />
                                        </Box>
                                    )}

                                {/* Teacher */}
                                {selectedScreen &&
                                    selectedScreen.screenId === "teacher" && (
                                        <Box>
                                            <Autocomplete
                                                options={teachers}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedTeacher}
                                                onChange={(event, newValue) => {
                                                    setSelectedTeacher(newValue);

                                                    Formik.setFieldValue(
                                                        "teacher",
                                                        newValue ? newValue._id : "",
                                                    );

                                                    Formik.setFieldValue(
                                                        "phone_no",
                                                        newValue ? newValue?.phoneno : "",
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("teacher", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Teacher"
                                                        placeholder="Search teacher..."
                                                        fullWidth
                                                        error={
                                                            Formik.touched.teacher &&
                                                            Boolean(Formik.errors.teacher)
                                                        }
                                                        helperText={
                                                            Formik.touched.teacher && Formik.errors.teacher
                                                        }
                                                    />
                                                )}
                                            />
                                        </Box>
                                    )}


                                {/* Students */}
                                {selectedScreen &&
                                    selectedScreen.screenId === "student" && (
                                        <Box>
                                            <Autocomplete
                                                options={students}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedStudent}
                                                onChange={(event, newValue) => {
                                                    setSelectedStudent(newValue);

                                                    Formik.setFieldValue(
                                                        "student",
                                                        newValue ? newValue._id : "",
                                                    );
                                                    Formik.setFieldValue(
                                                        "phone_no",
                                                        newValue ? newValue?.guardian_phone : "",
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("student", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Student"
                                                        placeholder="Search student..."
                                                        fullWidth
                                                        error={
                                                            Formik.touched.student &&
                                                            Boolean(Formik.errors.student)
                                                        }
                                                        helperText={
                                                            Formik.touched.student && Formik.errors.student
                                                        }
                                                    />
                                                )}
                                            />
                                        </Box>
                                    )}

                                {/* Parents */}
                                {selectedScreen &&
                                    selectedScreen.screenId === "parent" && (
                                        <Box>
                                            <Autocomplete
                                                options={parents}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedParent}
                                                onChange={(event, newValue) => {
                                                    setSelectedParent(newValue);

                                                    Formik.setFieldValue(
                                                        "phone_no",
                                                        newValue ? newValue?.phoneno : "",
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("parent", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Parent"
                                                        placeholder="Search parent..."
                                                        fullWidth
                                                        error={
                                                            Formik.touched.parent &&
                                                            Boolean(Formik.errors.parent)
                                                        }
                                                        helperText={
                                                            Formik.touched.parent && Formik.errors.parent
                                                        }
                                                    />
                                                )}
                                            />
                                        </Box>
                                    )}

                                {selectedScreen &&
                                    (selectedScreen.screenId === "parent"
                                        || selectedScreen.screenId === "student"
                                        || selectedScreen.screenId === "teacher"
                                    ) && (
                                        <Box>
                                            <TextField
                                                fullWidth
                                                sx={{ marginTop: "10px" }}
                                                id="filled-basic"
                                                label="Phone No"
                                                variant="outlined"
                                                name="phone_no"
                                                value={Formik.values.phone_no}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                            />

                                        </Box>
                                    )}



                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    inputRef={fileInputRef}
                                />
                            </Box>

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
            </Box>
        </>
    );
}
