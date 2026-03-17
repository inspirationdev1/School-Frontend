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
    Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete,
    Tabs, Tab,
} from "@mui/material";
// import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete, TextField, Box } from '@mui/material';
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { marksheetSchema } from "../../../yupSchema/marksheetSchema";
import MarksheetPrint from "./MarksheetPrint";

export default function Marksheet() {
    const [isDataValid, setIsDataValid] = useState(true);
    const [dataError, setDataError] = useState('');
    const [studentMarksheet, setStudentMarksheet] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [date, setDate] = useState(new Date());

    const [isPrint, setPrint] = useState(false);
    const [printId, setPrintId] = useState(null);

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [allStudents, setAllStudents] = useState([])

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [section, setSection] = useState([])
    const [selectedSection, setSelectedSection] = useState(null);
    const [teacher, setTeacher] = useState([])
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [subject, setSubject] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [examination, setExamination] = useState([])
    const [selectedExamination, setSelectedExamination] = useState(null);
    const [questionpaper, setQuestionpaper] = useState([])
    const [selectedQuestionpaper, setSelectedQuestionpaper] = useState(null);

    const [tab, setTab] = useState(0);

    const [marksheetDetails, setMarksheetDetails] = useState([
        {
            student: null,
            marks: 0,
            remarks: "",
            isEdit: false
        },
    ]);


    const clearMarksheetDetails = () => {
        setMarksheetDetails([
            {
                student: null,
                marks: 0,
                remarks: "",
                isEdit: false
            },
        ])
        console.log("marksheetDetails", marksheetDetails);

    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/marksheet/delete/${id}`)
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
    const handleEdit = async (id) => {
        console.log("Handle  Edit is called", id);
        setEdit(true);
        axios.get(`${baseUrl}/marksheet/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("msCode", resp.data.data.msCode);
                Formik.setFieldValue("name", resp.data.data.name);
                Formik.setFieldValue(
                    "msDate",
                    resp.data.data.msDate ? dayjs(resp.data.data.msDate).format("YYYY-MM-DD") : ""
                );
                Formik.setFieldValue("msTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));
                Formik.setFieldValue("class", resp.data.data.class._id);
                Formik.setFieldValue("section", resp.data.data.section._id);
                Formik.setFieldValue("teacher", resp.data.data.teacher._id);
                Formik.setFieldValue("subject", resp.data.data.subject._id);
                Formik.setFieldValue("examination", resp.data.data.examination._id);
                Formik.setFieldValue("questionpaper", resp.data.data.questionpaper._id);
                Formik.setFieldValue("marksLimit", resp.data.data.marksLimit);
                Formik.setFieldValue("status", resp.data.data.status);


                Formik.setFieldValue("remarks", resp.data.data.remarks);

                setSelectedClass(resp.data.data.class || null);
                setSelectedSection(resp.data.data.section || null);
                setSelectedTeacher(resp.data.data.teacher || null);
                setSelectedSubject(resp.data.data.subject || null);
                setSelectedExamination(resp.data.data.examination || null);
                setSelectedQuestionpaper(resp.data.data.questionpaper || null);

                setEditId(resp.data.data._id);

                const editMarksheetDetails = resp.data.data.marksheetDetails.map((row) => ({
                    ...row,
                    student: allStudents.find(
                        (f) => f._id === row.student
                    ) || null,
                    isEdit: true
                }));

                setMarksheetDetails(editMarksheetDetails);
                setTab(0); // open Create Receipt tab

            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const handlePrint = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);


        window.open(`/school/MarksheetPrint?id=${id}`,
            '_blank');
        setPrint(false);


    };


    const cancelEdit = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        setSelectedClass(null);
        setSelectedSection(null);
        setSelectedTeacher(null);
        setSelectedSubject(null);
        setSelectedExamination(null);
        setSelectedQuestionpaper(null);

        setIsDataValid(true);
        // 🔥 reset Autocomplete values
        clearMarksheetDetails();
    };

    const clearForm = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        setSelectedClass(null);
        setSelectedSection(null);
        setSelectedTeacher(null);
        setSelectedSubject(null);
        setSelectedExamination(null);
        setSelectedQuestionpaper(null);
        clearMarksheetDetails();

    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        msCode: "",
        name: "",
        msDate: "",
        msTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        class: "",
        section: "",
        teacher: "",
        subject: "",
        examination: "",
        questionpaper: "",
        marksLimit: 0,
        status: "valid",
        remarks: ""
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: marksheetSchema,
        onSubmit: (values) => {

            if (marksheetDetails.length == 0) {
                setDataError('Invoice Details is missing');
                setIsDataValid(false);
                return;
            }

            let hasInvalidRow = false;

            for (const item of marksheetDetails) {
                if (item.student === undefined || item.student === '' || item.student === null) {
                    setDataError('Select student');
                    hasInvalidRow = true;
                    break; // exit loop when condition met
                }




                console.log(item);

            }
            if (hasInvalidRow) {
                setIsDataValid(false);
                return;
            }

            setIsDataValid(true);

            const payload = {
                ...values,
                marksheetDetails: marksheetDetails.map((row) => ({
                    msDate: values?.msDate, 
                    msTime: values?.msTime, 
                    class: values?.class,  
                    section: values?.section, 
                    teacher: values?.teacher, 
                    subject: values?.subject, 
                    examination: values?.examination, 
                    questionpaper: values?.questionpaper, 

                    student: row.student?._id, // 👈 convert here
                    marks: row.marks,
                    marksLimit: values.marksLimit,
                    remarks: '',
                })),
            };
            if (isEdit) {
                console.log("edit id", editId);

                axios
                    .patch(`${baseUrl}/marksheet/update/${editId}`, payload)
                    .then((resp) => {
                        console.log("Edit submit", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        // cancelEdit();
                        clearForm();
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, edit casting submit", e);
                    });
            } else {

                axios
                    .post(`${baseUrl}/marksheet/create`, payload)
                    .then((resp) => {
                        console.log("Response after submitting admin casting", resp);
                        setMessage(resp.data.message);
                        setType("success");
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, response admin casting calls", e);
                    });
                // Formik.resetForm();
                clearForm();
                setTab(1); // go to View List
            }
        },
    });

    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);


    const fetchstudentsmarksheet = () => {
        axios
            .get(`${baseUrl}/marksheet/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setStudentMarksheet(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
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
            const sections = await axios.get(`${baseUrl}/section/fetch-all`);
            console.log("sections", sections)
            setSection(sections.data.data);

        } catch (error) {
            console.error('Error fetching students or checking attendance:', error);
        }
    };

    const fetchTeacher = async () => {
        const params = {};
        axios
            .get(`${baseUrl}/teacher/fetch-with-query`, { params: params })
            .then((resp) => {
                console.log("Fetching data in  teacher Calls  admin.", resp);
                setTeacher(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching teacher calls admin data", e);
            });
    };

    const fetchSubject = async () => {
        try {
            const subjects = await axios.get(`${baseUrl}/subject/fetch-all`);
            console.log("subjects", subjects)
            setSubject(subjects.data.data);

        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchExamination = async () => {

        if (!selectedClass) return;
        if (!selectedSubject) return;
        const params = {
            parent: selectedClass?._id,
            subject: selectedSubject?._id
        }
        axios
            .get(`${baseUrl}/examination/fetch-with-query`, { params })
            .then((resp) => {
                setExamination(resp.data.data);
            })
            .catch(() => console.log("Error in fetching students data"));


    };

    const fetchQuestionpaper = async () => {

        if (!selectedClass) return;
        if (!selectedSubject) return;
        if (!selectedExamination) return;
        const params = {
            parent: selectedClass?._id,
            subject: selectedSubject?._id,
            examination: selectedExamination?._id
        }
        axios
            .get(`${baseUrl}/questionpaper/fetch-with-query`, { params })
            .then((resp) => {
                setQuestionpaper(resp.data.data);
            })
            .catch(() => console.log("Error in fetching students data"));


    };


    const fetchStudents = async () => {

        if (!selectedClass?._id) return;
        if (!selectedSection?._id) return;

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



    const fetchAllStudents = async () => {

        const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`); // Fetch based on class
        setAllStudents(studentsResponse.data.data);
    };

    useEffect(() => {
        fetchstudentsmarksheet();

        fetchClass();
        fetchSection();
        fetchTeacher();
        fetchSubject();


        fetchAllStudents();

    }, [message]);



    useEffect(() => {
        fetchExamination();
    }, [selectedClass, selectedSubject]);

    useEffect(() => {
        fetchQuestionpaper();
    }, [selectedClass, selectedSubject, selectedExamination]);

    useEffect(() => {
        fetchStudents();

    }, [selectedClass, selectedSection]);


    useEffect(() => {
        console.log("marksheetDetails:", marksheetDetails);
    }, [marksheetDetails]);

    useEffect(() => {
        console.log("isDataValid:", isDataValid);
    }, [isDataValid]);

    const handleChange = (index, field, value) => {
        const updated = [...marksheetDetails];
        updated[index][field] = value;

        if (field === "marks") {
            const marksLimit = (Formik.values.marksLimit||0);
            if (updated[index].marks > marksLimit) {
                updated[index].marks = 0;
            }

        }

        setMarksheetDetails(updated);
    };

    const addRow = () => {
        setMarksheetDetails([
            ...marksheetDetails,
            {
                student: "",
                marks: 0,
                remarks: ""
            },
        ]);
    };

    const removeRow = (index) => {
        setMarksheetDetails(marksheetDetails.filter((_, i) => i !== index));
        console.log(marksheetDetails);
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
                        <Tab label={isEdit ? "Edit Mark Sheet" : "Create Mark Sheet"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>


                {tab === 0 && (
                    <Box>
                        <Box component={"div"} sx={{}}>
                            <Paper
                                sx={{ padding: '20px', margin: "10px" }}
                            >
                                {isEdit ? (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Edit marksheet
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Add New  marksheet
                                    </Typography>
                                )}{" "}
                                <Box
                                    component="form"
                                    noValidate
                                    autoComplete="off"
                                    onSubmit={Formik.handleSubmit}
                                >



                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",      // mobile
                                                md: "1fr 1fr",  // desktop → 2 columns
                                            },
                                            gap: 2,
                                            mt: 2,
                                        }}
                                    >
                                        {/* Marksheet Code */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="Marksheet Code"
                                                variant="outlined"
                                                name="msCode"
                                                value={Formik.values.msCode}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}
                                            />
                                            {Formik.touched.msCode && Formik.errors.msCode && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.msCode}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Marksheet Name */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="name"
                                                variant="outlined"
                                                name="name"
                                                value={Formik.values.name}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.name && Formik.errors.name && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.name}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* MS Date */}
                                        <Box>
                                            <TextField
                                                name="msDate"
                                                label="Date"
                                                type="date"
                                                variant="outlined"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={Formik.values.msDate}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}

                                            />
                                            {Formik.touched.msDate && Formik.errors.msDate && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.msDate}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Class */}

                                        <Box>

                                            <Autocomplete
                                                disabled={isEdit}
                                                options={classes}
                                                getOptionLabel={(option) => option.class_text}
                                                value={selectedClass}
                                                onChange={(event, newValue) => {
                                                    setSelectedClass(newValue);

                                                    Formik.setFieldValue(
                                                        "class",
                                                        newValue ? newValue._id : ""
                                                    );

                                                    setSelectedExamination(null);
                                                    setSelectedQuestionpaper(null);

                                                    Formik.setFieldValue(
                                                        "examination",
                                                        ""
                                                    );
                                                    Formik.setFieldValue(
                                                        "questionpaper",
                                                        ""
                                                    );
                                                    Formik.setFieldValue(
                                                        "marksLimit",
                                                        0
                                                    );

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
                                                disabled={isEdit}
                                                options={section}
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
                                                disabled={isEdit}
                                                options={teacher}
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
                                                disabled={isEdit}
                                                options={subject}
                                                getOptionLabel={(option) => option.subject_name}
                                                value={selectedSubject}
                                                onChange={(event, newValue) => {
                                                    setSelectedSubject(newValue);

                                                    Formik.setFieldValue(
                                                        "subject",
                                                        newValue ? newValue._id : ""
                                                    );
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


                                        {/* Examination */}

                                        <Box>
                                            <Autocomplete
                                                disabled={isEdit}
                                                options={examination}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedExamination}
                                                onChange={(event, newValue) => {
                                                    setSelectedExamination(newValue);
                                                    setSelectedQuestionpaper(null);
                                                    Formik.setFieldValue(
                                                        "examination",
                                                        newValue ? newValue._id : ""
                                                    );
                                                    Formik.setFieldValue(
                                                        "questionpaper",
                                                        ""
                                                    );
                                                    Formik.setFieldValue(
                                                        "marksLimit",
                                                        0
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("examination", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Examination"
                                                        placeholder="Search examination..."
                                                        fullWidth
                                                        error={Formik.touched.examination && Boolean(Formik.errors.examination)}
                                                        helperText={Formik.touched.examination && Formik.errors.examination}
                                                    />
                                                )}
                                            />

                                        </Box>


                                        {/* Questionpaper */}

                                        <Box>
                                            <Autocomplete
                                                disabled={isEdit}
                                                options={questionpaper}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedQuestionpaper}
                                                onChange={(event, newValue) => {
                                                    setSelectedQuestionpaper(newValue);

                                                    Formik.setFieldValue(
                                                        "questionpaper",
                                                        newValue ? newValue._id : ""
                                                    );
                                                    Formik.setFieldValue(
                                                        "marksLimit",
                                                        newValue ? newValue.marksLimit : 0
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("questionpaper", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Questionpaper"
                                                        placeholder="Search questionpaper..."
                                                        fullWidth
                                                        error={Formik.touched.questionpaper && Boolean(Formik.errors.questionpaper)}
                                                        helperText={Formik.touched.questionpaper && Formik.errors.questionpaper}
                                                    />
                                                )}
                                            />

                                        </Box>

                                        {/* marksLimit */}
                                                    <Box>
                                                      <TextField
                                                        disabled
                                                        fullWidth
                                                        label="marksLimit"
                                                        variant="outlined"
                                                        name="marksLimit"
                                                        type="number"
                                                        value={Formik.values.marksLimit}
                                                        onChange={Formik.handleChange}
                                                        onBlur={Formik.handleBlur}
                                        
                                                      />
                                        
                                                      {Formik.touched.marksLimit && Formik.errors.marksLimit && (
                                                        <p style={{ color: "red", textTransform: "capitalize" }}>
                                                          {Formik.errors.marksLimit}
                                                        </p>
                                                      )}
                                        
                                                    </Box>



                                        <Box>

                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                label="Status"
                                                name="status"
                                                value={Formik.values.status}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled
                                            >
                                                <MenuItem value="">Select Status</MenuItem>
                                                <MenuItem value="valid">Valid</MenuItem>
                                                <MenuItem value="cancel">Cancel</MenuItem>
                                            </TextField>
                                            {Formik.touched.status && Formik.errors.status && (
                                                <p style={{ color: "red", textTransform: "capitalize" }}>
                                                    {Formik.errors.status}
                                                </p>
                                            )}
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
                                    </Box>

                                    {/* MarksheetDetail */}
                                    <Box sx={{ mt: 3 }}>

                                        {!isDataValid && (
                                            <Alert severity="error" sx={{ mt: 2 }}>
                                                {dataError}
                                            </Alert>
                                        )}

                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                                                gap: 1,
                                                fontWeight: "bold",
                                                mb: 1,
                                            }}
                                        >


                                        </Box>

                                        {/* Rows */}
                                        {marksheetDetails.map((row, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                                                    gap: 1,
                                                    mb: 1,
                                                }}
                                            >


                                                <Box>
                                                    <Autocomplete
                                                        disabled={row.isEdit}
                                                        options={students}
                                                        getOptionLabel={(option) => option?.name || ""}
                                                        isOptionEqualToValue={(option, value) =>
                                                            option._id === value?._id
                                                        }
                                                        value={row.student}
                                                        onChange={(event, newValue) => {
                                                            handleChange(index, "student", newValue);
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Select Student"
                                                                placeholder="Search student..."
                                                                fullWidth
                                                            />
                                                        )}
                                                    />


                                                </Box>



                                                {/* marks */}
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        label="marks"
                                                        variant="outlined"
                                                        name="marks"
                                                        type="number"
                                                        value={row.marks}
                                                        onChange={(e) =>
                                                            handleChange(index, "marks", e.target.value)
                                                        }

                                                    />

                                                </Box>





                                                <Box>
                                                    <Button
                                                        color="error"
                                                        onClick={() => removeRow(index)}
                                                    >
                                                        ✕
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}

                                        {/* Add Row */}
                                        <Button variant="outlined" onClick={addRow}>
                                            + Add Item
                                        </Button>
                                    </Box>





                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            mt: 4,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button type="submit" variant="contained">
                                            {isEdit ? "Update" : "Submit"}
                                        </Button>

                                        {isEdit && (
                                            <Button variant="outlined" onClick={cancelEdit}>
                                                Cancel
                                            </Button>
                                        )}
                                    </Box>


                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                )}


                {tab === 1 && (
                    <Box>
                        <Box>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            {/* <TableCell component="th" scope="row"> marksheet</TableCell> */}
                                            <TableCell align="right">msCode</TableCell>
                                            <TableCell align="right">MS Name</TableCell>
                                            <TableCell align="right">MS Date</TableCell>
                                            <TableCell align="right">Remarks</TableCell>
                                            <TableCell align="right">Status</TableCell>

                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {studentMarksheet.map((value, i) => (
                                            <TableRow
                                                key={i}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {value.msCode}
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    {value.name}
                                                </TableCell>
                                                <TableCell align="right">{dayjs(value.msDate).format("DD-MM-YYYY")}</TableCell>
                                                <TableCell align="right">{value.remarks}</TableCell>
                                                <TableCell align="right">{value.status}</TableCell>
                                                <TableCell align="right">  <Box component={'div'} sx={{ bottom: 0, display: 'flex', justifyContent: "end" }} >


                                                    <Box
                                                        component="div"
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "end",
                                                            gap: 1.5, // 👈 adds space between buttons
                                                        }}
                                                    >
                                                        {(value.status === "valid") && (
                                                            <>
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


                                                            </>
                                                        )}
                                                        <Button
                                                            variant="contained"
                                                            sx={{ background: "green", color: "#fff" }}
                                                            onClick={() => handlePrint(value._id)}
                                                        >
                                                            Print
                                                        </Button>
                                                    </Box>



                                                </Box>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Box>
                    </Box>
                )}



            </Box>
        </>
    );
}
