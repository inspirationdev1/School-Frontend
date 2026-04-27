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
import { AuthContext } from '../../../context/AuthContext';

export default function Uploaddata() {


  const { authenticated, user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  //   CLEARING IMAGE FILE REFENCE FROM INPUT
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);


  const [screenNames, setReportNames] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);
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


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setFile(null); // Reset the file state

  };

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);
    // .post(`${baseUrl}/section/create`, { ...values })
    try {

      if (selectedScreen?.screenId == "accountlevel") {
        
        await axios
          .post(`${baseUrl}/upload/upload_accountlevel`, formData)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin accountlevel calls", e);
          });


      } else if (selectedScreen?.screenId == "accountledger") {
        
        await axios
          .post(`${baseUrl}/upload/upload_accountledger`, formData)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin accountledger calls", e);
          });


      }else if (selectedScreen?.screenId == "teacher") {


        await axios
          .post(`${baseUrl}/upload/upload_teacher`, formData)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin teacher calls", e);
          });
      } else if (selectedScreen?.screenId == "parent") {
        await axios
          .post(`${baseUrl}/upload/upload_parent`, formData)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin parent calls", e);
          });
      } else if (selectedScreen?.screenId == "student") {
        await axios
          .post(`${baseUrl}/upload/upload_student`, formData)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin student calls", e);
          });
      } else if (selectedScreen?.screenId == "class") {
        await axios
          .post(`${baseUrl}/upload/upload_class`, formData)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin class calls", e);
          });
      } else if (selectedScreen?.screenId == "section") {
        await axios
          .post(`${baseUrl}/upload/upload_section`, formData)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin section calls", e);
          });
      }





      // alert("Upload success");
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
      setType("error");

    }
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
    screenId: "",
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


      if (!values.screenId) {
        setDataError('Select the Screen Name');
        setIsDataValid(false);
        return;
      }

      if (!file) {
        setDataError('Select the file');
        setIsDataValid(false);
        return;
      }


      //   if (values.screenId == "accountlevel") {        
      //   }

      setIsDataValid(true);
      handleUpload();
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);


  const fetchScreenNames = async () => {
    try {
      const reportsData = [
        { screenId: "accountlevel", screenName: "Account Level" },
        { screenId: "accountledger", screenName: "Account Ledger" },
        { screenId: "teacher", screenName: "Teacher" },
        { screenId: "parent", screenName: "Parent" },
        { screenId: "class", screenName: "Class" },
        { screenId: "section", screenName: "Section" },
        { screenId: "student", screenName: "Student" },
      ];
      console.log("Report Names", reportsData)
      setReportNames(reportsData);

    } catch (error) {
      console.error('Error fetching Screen Names:', error);
    }
  };





  useEffect(() => {
    fetchScreenNames();



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


        <Box component={"div"} sx={{}}>
          <Paper
            sx={{ padding: '20px', margin: "10px" }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: "800", textAlign: "center" }}
            >
              Uploads
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


                {/* ScreenNames */}
                <Box>

                  <Autocomplete
                    options={screenNames}
                    getOptionLabel={(option) => option.screenName}
                    value={selectedScreen}
                    onChange={(event, newValue) => {
                      setSelectedScreen(newValue);

                      Formik.setFieldValue(
                        "screenId",
                        newValue ? newValue.screenId : ""
                      );


                    }}
                    onBlur={() => Formik.setFieldTouched("screenId", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Screen Name"
                        placeholder="Search screen name..."
                        fullWidth
                        error={Formik.touched.screenId && Boolean(Formik.errors.screenId)}
                        helperText={Formik.touched.screenId && Formik.errors.screenId}
                      />
                    )}
                  />


                </Box>


                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} inputRef={fileInputRef} />



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
