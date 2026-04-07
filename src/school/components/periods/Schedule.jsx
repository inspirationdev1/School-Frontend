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

export default function Schedule() {



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


    // const data = {
    //   year: 2025,

    // };
    const data = {
                fromDate: fromDate,
                toDate: toDate,
                
            };
    window.open(
      `/school/ScheduleReportPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
      "_blank"
    );


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

      if (!values.class) {
        setDataError('Select the Class');
        setIsDataValid(false);
        return;
      }

      if (!values.section) {
        setDataError('Select the Section');
        setIsDataValid(false);
        return;
      }

      setIsDataValid(true);



      handlePrint();
    },
  });





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




  useEffect(() => {
    fetchClass();
    fetchSection();
    fetchTeacher();


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
          <Paper
            sx={{ padding: '20px', margin: "10px" }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: "800", textAlign: "center" }}
            >
              Schedule
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

                {/* From Date */}

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


                {/* To Date */}

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



                {/* Class */}

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


                {/* Section */}

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


                {/* Teacher */}

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
