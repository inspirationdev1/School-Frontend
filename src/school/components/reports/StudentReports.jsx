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
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { schoolreportsSchema } from "../../../yupSchema/schoolreportsSchema";
import { AuthContext } from '../../../context/AuthContext';

export default function StudentReports() {


  const { authenticated, user } = useContext(AuthContext);
  console.log("user", user);

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

    let data = {}


    if (selectedStudent) {
      data.student = selectedStudent._id;
    }
    if (selectedClass) {
      data.class = selectedClass._id;
    }
    if (selectedSection) {
      data.section = selectedSection._id;
    }
    if (fromDate) {
      data.fromDate = fromDate;
    }
    if (toDate) {
      data.toDate = toDate;
    }

    if (selectedYear) {
      data.year = selectedYear.value;
    }

    
    if (user?.role === 'STUDENT') {
      if (selectedReport.reportId === "attendance-report") {
        window.open(
          `/student/AttendanceReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      } else if (selectedReport.reportId === "progresscard-report") {
          window.open(
          `/student/SchoolReportsPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      }else if (selectedReport.reportId === "questionpaper-report") {
          window.open(
          `/student/QuestionpaperReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      }
    } else if (user?.role === 'PARENT') {
      if (selectedReport.reportId === "attendance-report") {
        window.open(
          `/parent/AttendanceReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      } else if (selectedReport.reportId === "progresscard-report") {
          window.open(
          `/parent/SchoolReportsPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      }else if (selectedReport.reportId === "questionpaper-report") {
          window.open(
          `/parent/QuestionpaperReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      }
    } else {
      if (selectedReport.reportId === "attendance-report") {
        window.open(
          `/school/AttendanceReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      } else if (selectedReport.reportId === "progresscard-report") {
          window.open(
          `/school/SchoolReportsPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      }else if (selectedReport.reportId === "questionpaper-report") {
          window.open(
          `/school/QuestionpaperReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
          "_blank"
        );
      }
      

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
    class: "",
    section: "",
    teacher: "",
    subject: "",
    examination: "",
    questionpaper: "",
    student: "",
    fromDate: "",
    toDate: "",
    year: "",
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

      if (values.reportId == "attendance-report") {


        if (!values.class) {
          setDataError('Select the class');
          setIsDataValid(false);
          return;
        }

        if (!values.section) {
          setDataError('Select the Section');
          setIsDataValid(false);
          return;
        }
      }

      if (values.reportId == "attendance-report"
        || values.reportId == "questionpaper-report"
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

      if (values.reportId == "other-report"
        || values.reportId == "progresscard-report"
      ) {
        if (!values.student) {
          setDataError('Select the Student');
          setIsDataValid(false);
          return;
        }
      }

      if (values.reportId == "other-report"
        || values.reportId == "progresscard-report"
      ) {
        if (!values.year) {
          setDataError('Select the Year');
          setIsDataValid(false);
          return;
        }
      }


      setIsDataValid(true);



      handlePrint();
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);


  const fetchReportNames = async () => {
    try {
      const reportsData = [{ reportId: "attendance-report", reportName: "Attendance Report" },
      { reportId: "progresscard-report", reportName: "Progress Card" },
      { reportId: "questionpaper-report", reportName: "Exam Schedule" }];
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


      <Box 
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


                {/* { reportId: "progresscard-report", reportName: "Progress Card" },
      { reportId: "questionpaper-report", reportName: "Exam Question Paper" }]; */}

                {/* Class */}
                {selectedReport && (selectedReport.reportId === "attendance-report"
                  || selectedReport.reportId === "progresscard-report"
                  || selectedReport.reportId === "questionpaper-report"
                ) && (
                    <Box>

                      <Autocomplete
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
                {selectedReport && (selectedReport.reportId === "attendance-report"
                  || selectedReport.reportId === "progresscard-report"
                  || selectedReport.reportId === "questionpaper-report"
                ) && (
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




                {/* Students */}
                {selectedReport && (selectedReport.reportId === "attendance-report"
                  || selectedReport.reportId === "progresscard-report"
                  || selectedReport.reportId === "questionpaper-report"
                ) && (
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

                {/* Academic Year */}
                {selectedReport && (selectedReport.reportId === "other-report"
                  || selectedReport.reportId === "progresscard-report"
                ) && (
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
                {selectedReport && (selectedReport.reportId === "attendance-report"
                  || selectedReport.reportId === "questionpaper-report"
                ) && (
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
                {selectedReport && (selectedReport.reportId === "attendance-report"
                  || selectedReport.reportId === "questionpaper-report"
                ) && (
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
