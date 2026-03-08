/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CardMedia,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  TextField,
  Typography,
  Autocomplete,

} from "@mui/material";
import Grid from "@mui/material/Grid2";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { baseUrl } from "../../../environment";
import { questionpaperSchema } from "../../../yupSchema/questionpaperSchema";
import { convertDate } from "../../../utilityFunctions";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

export default function Questionpapers() {
  const [isEditQuestionpaper, setEditQuestionpaper] = useState(false);
  const [questionpaperForm, setQuestionpaperForm] = useState(false);
  const [questionpaperEditId, setQuestionpaperEditId] = useState(null);

  const [allClasses, setAllClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [questionpapers, setQuestionpapers] = useState([]);
  const [submitted, setSubmitted] = useState("not submitted")
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [allExaminations, setAllExaminations] = useState([]);
  const [selectedExamination, setSelectedExamination] = useState(null);

  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const resetMessage = () => {
    setMessage("");
  };

  const handleMessage = (type, message) => {
    console.log("Called")
    setType(type);
    setMessage(message)
  }


  const handleNewQuestionpaper = () => {
    cancelEditQuestionpaper()
    setQuestionpaperForm(true);
  };

  const handleEdit = (id) => {
    setQuestionpaperEditId(id);
    setEditQuestionpaper(true);
    setQuestionpaperForm(true);
    axios
      .get(`${baseUrl}/questionpaper/single/${id}`)
      .then((resp) => {
        questionpaperFormik.setFieldValue("name", resp.data.data.name);
        questionpaperFormik.setFieldValue("description", resp.data.data.description);
        questionpaperFormik.setFieldValue("date", dayjs(resp.data.data.questionpaperDate));
        questionpaperFormik.setFieldValue("subject", resp.data.data.subject);
        questionpaperFormik.setFieldValue("teacher", resp.data.data.teacher);
        questionpaperFormik.setFieldValue("examination", resp.data.data.examination);


        const subjectId = resp.data.data?.subject || resp.data.subject;
        const matchedSubject = allSubjects.find(c => c._id === subjectId);
        setSelectedSubject(matchedSubject);

        const teacherId = resp.data.data?.teacher || resp.data.teacher;
        const matchedTeacher = allTeachers.find(c => c._id === teacherId);
        setSelectedTeacher(matchedTeacher);

        const examId = resp.data.data?.examination || resp.data.examination;
        const matchedExamination = allExaminations.find(c => c._id === examId);
        setSelectedExamination(matchedExamination);

        questionpaperFormik.setFieldValue("examtype", resp.data.data.examtype);

      })
      .catch((e) => {
        handleMessage("error", e.response.data.message);

      });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/questionpaper/delete/${id}`)
        .then((resp) => {
          handleMessage("success", resp.data.message);
        })
        .catch((e) => {
          handleMessage("error", e.response.data.message);
        });
    }
  };

  const cancelEditQuestionpaper = () => {
    setQuestionpaperForm(false);
    setQuestionpaperEditId(null);
    questionpaperFormik.resetForm();
  };

  const questionpaperFormik = useFormik({
    initialValues: { name:"",description:"", date: "", subject: "", teacher: "",examination:"",examtype:"",fileType:"",fileName:"" },
    validationSchema: questionpaperSchema,
    onSubmit: (values) => {
      if (isEditQuestionpaper) {
        axios
          .patch(`${baseUrl}/questionpaper/update/${questionpaperEditId}`, { ...values })
          .then((resp) => {
            handleMessage("success", resp.data.message);
          })
          .catch((e) => {
            handleMessage("error", e.response.data.message);
          });
      } else {
        console.log("Values", values)
        console.log("selected Class", selectedClass)
        axios
          .post(`${baseUrl}/questionpaper/new`, {
            ...values,
            class_id: selectedClass?._id,
          })
          .then((resp) => {
            handleMessage("success", resp.data.message);
            console.log("success", resp)
          })
          .catch((e) => {
            console.log(e, "error")
            handleMessage("error", e.response.data.message);
          });
      }
      cancelEditQuestionpaper();
      setSubmitted("Submitted")
    },
  });



  const fetchQuestionpapers = () => {
    axios
      .get(`${baseUrl}/questionpaper/fetch-class/${selectedClass?._id}`)
      .then((resp) => {
        console.log("ALL Questionpaper", resp);
        setQuestionpapers(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  Questionpaperinstions.");
      });
  };
  useEffect(() => {
    if (selectedClass) {
      fetchQuestionpapers();
    }
  }, [selectedClass, message]);

  const fetchStudentClass = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setAllClasses(resp.data.data);
        console.log("Class", resp.data);
        setSelectedClass(resp.data.data[0]);
      })
      .catch((e) => {
        console.log("Error in fetching student Class", e);
      });
  };

  const fetchAllSubjects = () => {
    axios
      .get(`${baseUrl}/subject/fetch-all`, { params: {} })
      .then((resp) => {
        console.log("ALL subjects", resp);
        setAllSubjects(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  all  Classes");
      });
  };


  const fetchAllTeachers = () => {
    axios
      .get(`${baseUrl}/teacher/fetch-with-query`, { params: {} })
      .then((resp) => {
        console.log("ALL Teachers", resp);
        setAllTeachers(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  all  Classes");
      });
  };

  const fetchAllExaminations = () => {
    axios
      .get(`${baseUrl}/examination/fetch-class/${selectedClass?._id}`)
      .then((resp) => {
        console.log("ALL Examination", resp);
        setAllExaminations(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  Examinstions.");
      });
  };


  useEffect(() => {
    fetchStudentClass();
    fetchAllSubjects();
    fetchAllTeachers();

  }, []);

  useEffect(() => {
    fetchAllExaminations();
  }, [selectedClass]);


  return (
    <>
      {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}
      <Box><Typography className="hero-text" variant="h2" sx={{ textAlign: "center" }}>Questionpapers</Typography></Box>
      <Paper sx={{ margin: "10px", padding: "10px" }}>


        {/* Class */}
        {allClasses.length > 0 && (
          <Box>

            <Autocomplete
              options={allClasses}
              getOptionLabel={(option) => option.class_text}
              value={selectedClass}
              onChange={(event, newValue) => {
                setSelectedClass(newValue);

                questionpaperFormik.setFieldValue(
                  "class",
                  newValue ? newValue._id : ""
                );
              }}
              onBlur={() => questionpaperFormik.setFieldTouched("class", true)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Class"
                  placeholder="Search class..."
                  fullWidth
                  error={questionpaperFormik.touched.class && Boolean(questionpaperFormik.errors.class)}
                  helperText={questionpaperFormik.touched.class && questionpaperFormik.errors.class}
                />
              )}
            />


          </Box>
        )}
      </Paper>

      {questionpaperForm && (
        <Paper sx={{ p: 4, mt: 3, maxWidth: 500, mx: "auto" }}>

          {/* Heading */}
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              mb: 3
            }}
          >
            Assign Questionpaper
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={questionpaperFormik.handleSubmit}
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} // 1 column mobile, 2 columns desktop
            gap={3}
          >

            {/* Paper Name */}
            <Box>
              <TextField
                fullWidth
                label="Paper Name"
                variant="outlined"
                name="name"
                value={questionpaperFormik.values.name}
                onChange={questionpaperFormik.handleChange}
                onBlur={questionpaperFormik.handleBlur}
              />
              {questionpaperFormik.touched.name && questionpaperFormik.errors.name && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {questionpaperFormik.errors.name}
                </p>
              )}
            </Box>

            {/* Description */}
            <Box>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                name="description"
                value={questionpaperFormik.values.description}
                onChange={questionpaperFormik.handleChange}
                onBlur={questionpaperFormik.handleBlur}
              />
              {/* {questionpaperFormik.touched.description &&
                questionpaperFormik.errors.description && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {questionpaperFormik.errors.description}
                  </p>
                )} */}
            </Box>

            {/* Date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={dayjs(questionpaperFormik.values.date)}
                onChange={(e) => {
                  questionpaperFormik.setFieldValue("date", dayjs(e));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>

            {/* Subject */}
            {allSubjects.length > 0 && (
              <Autocomplete
                options={allSubjects}
                getOptionLabel={(option) => option.subject_name}
                value={selectedSubject}
                onChange={(event, newValue) => {
                  setSelectedSubject(newValue);
                  questionpaperFormik.setFieldValue(
                    "subject",
                    newValue ? newValue._id : ""
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Subject" fullWidth />
                )}
              />
            )}

            {/* Teacher */}
            {allTeachers.length > 0 && (
              <Autocomplete
                options={allTeachers}
                getOptionLabel={(option) => option.name}
                value={selectedTeacher}
                onChange={(event, newValue) => {
                  setSelectedTeacher(newValue);
                  questionpaperFormik.setFieldValue(
                    "teacher",
                    newValue ? newValue._id : ""
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Teacher" fullWidth />
                )}
              />
            )}

            {/* Examination */}
            {allExaminations.length > 0 && (
              <Autocomplete
                options={allExaminations}
                getOptionLabel={(option) => option.name}
                value={selectedExamination}
                onChange={(event, newValue) => {
                  setSelectedExamination(newValue);
                  questionpaperFormik.setFieldValue(
                    "examination",
                    newValue ? newValue._id : ""
                  );
                  questionpaperFormik.setFieldValue(
                    "examtype",
                    newValue ? newValue.examtype._id : ""
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Examination" fullWidth />
                )}
              />
            )}

            {/* Buttons (Full Width Row) */}
            <Box gridColumn="1 / -1" display="flex" gap={2}>
              <Button type="submit" variant="contained">
                Submit
              </Button>

              <Button
                variant="contained"
                sx={{ background: "tomato" }}
                onClick={cancelEditQuestionpaper}
              >
                Cancel
              </Button>
            </Box>

          </Box>

        </Paper>
      )}


      <Paper sx={{ padding: "20px", margin: "10px" }}>
        <Typography
          sx={{ textAlign: "center" }}
          className="text-beautify2"
          variant="h5"
        >
          Questionpapers
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 250 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Paper Name
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Date
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Subject
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Teacher
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Examination
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questionpapers &&
                questionpapers.map((questionpaper, i) => {
                  return (
                    <TableRow key={i}>
                       <TableCell align="left">
                        {questionpaper.name ? questionpaper.name : ""}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {convertDate(questionpaper.date)}
                      </TableCell>
                      <TableCell align="left">
                        {questionpaper.subject ? questionpaper.subject.subject_name : "Add One"}
                      </TableCell>
                      <TableCell align="left">
                        {questionpaper.teacher ? questionpaper.teacher.name : "Add One"}
                      </TableCell>
                      <TableCell align="left">
                        {questionpaper.examination ? questionpaper.examination.name : "Add One"}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "700" }} align="center">
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
                            onClick={() => handleDelete(questionpaper._id)}
                          >
                            Delete
                          </Button>

                          <Button
                            variant="contained"
                            sx={{ background: "gold", color: "#222222" }}
                            onClick={() => handleEdit(questionpaper._id)}
                          >
                            Edit
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button variant="contained" onClick={handleNewQuestionpaper}>
            Add Questionpaper
          </Button>
        </Box>
      </Paper>
    </>
  );
}
