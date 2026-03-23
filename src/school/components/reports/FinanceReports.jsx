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
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { schoolreportsSchema } from "../../../yupSchema/schoolreportsSchema";

export default function FinanceReports() {



    const [loading, setLoading] = useState(true);


    const [reportNames, setReportNames] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [sections, setSection] = useState([])
    const [selectedSection, setSelectedSection] = useState(null);
    const [teachers, setTeacher] = useState([])
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [subjects, setSubject] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [examinations, setExamination] = useState([])
    const [selectedExamination, setSelectedExamination] = useState(null);
    const [questionpapers, setQuestionpaper] = useState([])
    const [selectedQuestionpaper, setSelectedQuestionpaper] = useState(null);
    const [isPrint, setPrint] = useState(false);
    const [isDataValid, setIsDataValid] = useState(true);
    const [dataError, setDataError] = useState('');
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

    const cancelEdit = () => {
        setEdit(false);
        Formik.resetForm()
    };

    const handlePrint = async () => {

        setPrint(true);


        if (selectedReport.reportId == "income-expense-report") {
            const data = {
                year: selectedYear.value,
                
            };
            window.open(
                `/school/FinanceReportsPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
                "_blank"
            );
        } else if (selectedReport.reportId == "expense-report") {
            const data = {
                fromDate: fromDate,
                toDate: toDate,
                
            };
            window.open(
                `/school/ExpenseReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
                "_blank"
            );
        } else if (selectedReport.reportId == "income-report") {
            const data = {
                fromDate: fromDate,
                toDate: toDate,      
            };
            window.open(
                `/school/IncomeReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
                "_blank"
            );
        } else if (selectedReport.reportId == "pending-fees-report") {
            const data = {
                fromDate: fromDate,
                toDate: toDate,      
            };
            window.open(
                `/school/PendingFeesReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
                "_blank"
            );
        } else if (selectedReport.reportId == "paid-fees-report") {
            const data = {
                fromDate: fromDate,
                toDate: toDate,      
            };
            window.open(
                `/school/PaidFeesReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
                "_blank"
            );
        }

        
        setPrint(false);


    };


    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        reportId: "",
        year: "",   // 👈 add this
        fromDate: "",   // 👈 add
        toDate: "",     // 👈 add
        class: "",
        section: "",
        teacher: "",
        subject: "",
        examination: "",
        questionpaper: "",
        student: "",
    };
    const Formik = useFormik({
        initialValues: initialValues,
        // validationSchema: schoolreportsSchema,
        onSubmit: (values) => {


            if (!values.reportId) {
                setDataError('Select the Report Name');
                setIsDataValid(false);
                return;
            }

            if (values.reportId == "income-expense-report") {
                if (!values.year) {
                    setDataError('Select the Year');
                    setIsDataValid(false);
                    return;
                }
            }

            if (values.reportId == "expense-report" 
                || values.reportId == "income-report"
                || values.reportId == "pending-fees-report"
                || values.reportId == "paid-fees-report"
            ) {
                if (!values.fromDate || !values.toDate) {
                    setDataError('Select From Date and To Date');
                    setIsDataValid(false);
                    return;
                }

                if (dayjs(values.fromDate).isAfter(dayjs(values.toDate))) {
                    setDataError('From Date cannot be after To Date');
                    setIsDataValid(false);
                    return;
                }
            }

            if (values.reportId == "otherReport") {
                if (!values.student) {
                    setDataError('Select the Student');
                    setIsDataValid(false);
                    return;
                }
            }

            setIsDataValid(true);


            const id = "69b1de716debb1c7d5a431ed";
            handlePrint();
        },
    });

    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);


    const fetchReportNames = async () => {
        try {
            const reportsData = [{ reportId: "income-expense-report", reportName: "Income-Expense Report" },
             { reportId: "income-report", reportName: "Income Report" },
             { reportId: "expense-report", reportName: "Expense Report" },
             { reportId: "pending-fees-report", reportName: "Pending Fees Report" },
             { reportId: "paid-fees-report", reportName: "Paid Fees Report" }
             
            ];
            console.log("Report Names", reportsData)
            setReportNames(reportsData);

        } catch (error) {
            console.error('Error fetching Report Names:', error);
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
            setSection(sectionsData.data.data);

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


    useEffect(() => {
        fetchReportNames();
        fetchClass();
        fetchSection();
        fetchTeacher();
        fetchSubject();

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

    return (
        <>
            {message && (
                <CustomizedSnackbars
                    reset={resetMessage}
                    type={type}
                    message={message}
                />
            )}


            <Box sx={{ padding: "40px 10px 20px 10px" }}
            >


                <Box component={"div"} sx={{}}>
                    <Paper
                        sx={{ padding: '20px', margin: "10px" }}
                    >
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: "800", textAlign: "center" }}
                        >
                            Reports
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
                                        xs: "1fr",      // mobile
                                        md: "1fr 1fr",  // desktop → 2 columns
                                    },
                                    gap: 2,
                                    mt: 2,
                                }}
                            >


                                {/* ReportNames */}
                                <Box>

                                    <Autocomplete
                                        options={reportNames}
                                        getOptionLabel={(option) => option.reportName}
                                        value={selectedReport}
                                        onChange={(event, newValue) => {
                                            setSelectedReport(newValue);

                                            Formik.setFieldValue(
                                                "reportId",
                                                newValue ? newValue.reportId : ""
                                            );


                                        }}
                                        onBlur={() => Formik.setFieldTouched("reportId", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Report Name"
                                                placeholder="Search report name..."
                                                fullWidth
                                                error={Formik.touched.reportId && Boolean(Formik.errors.reportId)}
                                                helperText={Formik.touched.reportId && Formik.errors.reportId}
                                            />
                                        )}
                                    />


                                </Box>



                                {/* Academic Year */}
                                {selectedReport && selectedReport.reportId === "income-expense-report" && (
                                    <Box>
                                        <Autocomplete
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
                                )}

                                {/* From Date */}
                                {selectedReport && (selectedReport.reportId === "expense-report"
                                ||selectedReport.reportId === "income-report"
                                ||selectedReport.reportId === "pending-fees-report"
                                ||selectedReport.reportId === "paid-fees-report") && (
                                    <Box>
                                        <TextField
                                            label="From Date"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={Formik.values.fromDate}
                                            onChange={(e) => {
                                                Formik.setFieldValue("fromDate", e.target.value);
                                                setFromDate(e.target.value);
                                            }}
                                            error={Formik.touched.fromDate && Boolean(Formik.errors.fromDate)}
                                            helperText={Formik.touched.fromDate && Formik.errors.fromDate}
                                        />
                                    </Box>
                                )}

                                {/* To Date */}
                                {selectedReport && (selectedReport.reportId === "expense-report"
                                ||selectedReport.reportId === "income-report"
                                ||selectedReport.reportId === "pending-fees-report"
                                ||selectedReport.reportId === "paid-fees-report") && (
                                    <Box>
                                        <TextField
                                            label="To Date"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={Formik.values.toDate}
                                            onChange={(e) => {
                                                Formik.setFieldValue("toDate", e.target.value);
                                                setToDate(e.target.value);
                                            }}
                                            error={Formik.touched.toDate && Boolean(Formik.errors.toDate)}
                                            helperText={Formik.touched.toDate && Formik.errors.toDate}
                                        />
                                    </Box>
                                )}


                                {/* Class */}
                                {selectedReport && selectedReport.reportId === "otherReport" && (
                                    <Box>

                                        <Autocomplete
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
                                )}

                                {/* Section */}
                                {selectedReport && selectedReport.reportId === "otherReport" && (
                                    <Box>
                                        <Autocomplete
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
                                                    label="Select Section"
                                                    placeholder="Search section..."
                                                    fullWidth
                                                    error={Formik.touched.section && Boolean(Formik.errors.section)}
                                                    helperText={Formik.touched.section && Formik.errors.section}
                                                />
                                            )}
                                        />


                                    </Box>
                                )}

                                {/* Teacher */}
                                {selectedReport && selectedReport.reportId === "otherReport" && (
                                    <Box>
                                        <Autocomplete
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
                                                    label="Select Teacher"
                                                    placeholder="Search teacher..."
                                                    fullWidth
                                                    error={Formik.touched.teacher && Boolean(Formik.errors.teacher)}
                                                    helperText={Formik.touched.teacher && Formik.errors.teacher}
                                                />
                                            )}
                                        />

                                    </Box>
                                )}



                                {/* Subject */}
                                {selectedReport && selectedReport.reportId === "otherReport" && (
                                    <Box>
                                        <Autocomplete
                                            options={subjects}
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
                                )}

                                {/* Examination */}

                                {selectedReport && selectedReport.reportId === "otherReport" && (

                                    <Box>
                                        <Autocomplete
                                            options={examinations}
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
                                )}


                                {/* Questionpaper */}
                                {selectedReport && selectedReport.reportId === "otherReport" && (
                                    <Box>
                                        <Autocomplete
                                            options={questionpapers}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedQuestionpaper}
                                            onChange={(event, newValue) => {
                                                setSelectedQuestionpaper(newValue);

                                                Formik.setFieldValue(
                                                    "questionpaper",
                                                    newValue ? newValue._id : ""
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
                                )}

                                {/* Students */}
                                {selectedReport && selectedReport.reportId === "otherReport" && (
                                    <Box>
                                        <Autocomplete
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
                                                    label="Select Student"
                                                    placeholder="Search student..."
                                                    fullWidth
                                                    error={Formik.touched.student && Boolean(Formik.errors.student)}
                                                    helperText={Formik.touched.student && Formik.errors.student}
                                                />
                                            )}
                                        />

                                    </Box>
                                )}


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
