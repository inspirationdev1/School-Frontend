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
import { examSchema } from "../../../yupSchema/examinationSchema";
import { convertDate } from "../../../utilityFunctions";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

export default function Examinations() {
  const [isEditExam, setEditExam] = useState(false);
  const [examForm, setExamForm] = useState(false);
  const [examEditId, setExamEditId] = useState(null);

  const [allClasses, setAllClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [submitted, setSubmitted] = useState("not submitted")
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [allExamtypes, setAllExamtypes] = useState([]);
  const [selectedExamtype, setSelectedExamtype] = useState(null);

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


  const handleNewExam = () => {
    cancelEditExam()
    setExamForm(true);
  };

  const handleEdit = (id) => {
    setExamEditId(id);
    setEditExam(true);
    setExamForm(true);
    axios
      .get(`${baseUrl}/examination/single/${id}`)
      .then((resp) => {
        examFormik.setFieldValue("exam_date", dayjs(resp.data.data.examDate));
        examFormik.setFieldValue("subject", resp.data.data.subject);
        examFormik.setFieldValue("examtype", resp.data.data.examtype);

        const subjectId = resp.data.data?.subject || resp.data.subject;
        const matchedSubject = allSubjects.find(c => c._id === subjectId);
        setSelectedSubject(matchedSubject);

        const examtypeId = resp.data.data?.examtype || resp.data.examtype;
        const matchedExamtype = allExamtypes.find(c => c._id === examtypeId);
        setSelectedExamtype(matchedExamtype);


      })
      .catch((e) => {
        handleMessage("error", e.response.data.message);

      });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/examination/delete/${id}`)
        .then((resp) => {
          handleMessage("success", resp.data.message);
        })
        .catch((e) => {
          handleMessage("error", e.response.data.message);
        });
    }
  };

  const cancelEditExam = () => {
    setExamForm(false);
    setExamEditId(null);
    examFormik.resetForm();
  };

  const examFormik = useFormik({
    initialValues: { exam_date: "", subject: "", examtype: "" },
    validationSchema: examSchema,
    onSubmit: (values) => {
      if (isEditExam) {
        axios
          .patch(`${baseUrl}/examination/update/${examEditId}`, { ...values })
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
          .post(`${baseUrl}/examination/new`, {
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
      cancelEditExam();
      setSubmitted("Submitted")
    },
  });



  const fetchExaminations = () => {
    axios
      .get(`${baseUrl}/examination/fetch-class/${selectedClass?._id}`)
      .then((resp) => {
        console.log("ALL Examination", resp);
        setExaminations(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  Examinstions.");
      });
  };
  useEffect(() => {
    if (selectedClass) {
      fetchExaminations();
    }
  }, [selectedClass, message]);

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


  const fetchAllExamtypes = () => {
    axios
      .get(`${baseUrl}/examtype/fetch-all`, { params: {} })
      .then((resp) => {
        console.log("ALL examtypes", resp);
        setAllExamtypes(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  all  examtypes");
      });
  };

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
  useEffect(() => {
    fetchStudentClass();
    fetchAllSubjects();
    fetchAllExamtypes();
  }, []);

  return (
    <>
      {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}
      <Box><Typography className="hero-text" variant="h2" sx={{ textAlign: "center" }}>Examinations</Typography></Box>
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

                // Formik.setFieldValue(
                //   "class",
                //   newValue ? newValue._id : ""
                // );
              }}
              // onBlur={() => Formik.setFieldTouched("class", true)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Class"
                  placeholder="Search class..."
                  fullWidth
                // error={Formik.touched.class && Boolean(Formik.errors.class)}
                // helperText={Formik.touched.class && Formik.errors.class}
                />
              )}
            />


          </Box>
        )}
      </Paper>

      {examForm && (
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
            Assign Examination
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={examFormik.handleSubmit}
            display="flex"
            flexDirection="column"
            gap={3}   // ✅ controls spacing
          >

            {/* Exam Date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Exam Date"
                name="exam_date"
                value={dayjs(examFormik.values.exam_date)}
                onChange={(e) => {
                  examFormik.setFieldValue("exam_date", dayjs(e));
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
                  examFormik.setFieldValue(
                    "subject",
                    newValue ? newValue._id : ""
                  );
                }}
                onBlur={() => examFormik.setFieldTouched("subject", true)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Subject"
                    placeholder="Search subject..."
                    fullWidth
                    error={
                      examFormik.touched.subject &&
                      Boolean(examFormik.errors.subject)
                    }
                    helperText={
                      examFormik.touched.subject &&
                      examFormik.errors.subject
                    }
                  />
                )}
              />
            )}

            {/* Exam Type */}
            {allExamtypes.length > 0 && (
              <Autocomplete
                options={allExamtypes}
                getOptionLabel={(option) => option.examtype_name}
                value={selectedExamtype}
                onChange={(event, newValue) => {
                  setSelectedExamtype(newValue);
                  examFormik.setFieldValue(
                    "examtype",
                    newValue ? newValue._id : ""
                  );
                }}
                onBlur={() => examFormik.setFieldTouched("examtype", true)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Exam Type"
                    placeholder="Search exam type..."
                    fullWidth
                    error={
                      examFormik.touched.examtype &&
                      Boolean(examFormik.errors.examtype)
                    }
                    helperText={
                      examFormik.touched.examtype &&
                      examFormik.errors.examtype
                    }
                  />
                )}
              />
            )}

            {/* Buttons */}
            <Box display="flex" gap={2} mt={1}>
              <Button type="submit" variant="contained">
                Submit
              </Button>

              <Button
                variant="contained"
                sx={{ background: "tomato" }}
                onClick={cancelEditExam}
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
          Examinations
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 250 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Exam Date
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Subject
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="center">
                  Exam Type
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examinations &&
                examinations.map((examination, i) => {
                  return (
                    <TableRow key={i}>
                      <TableCell component="th" scope="row">
                        {convertDate(examination.examDate)}
                      </TableCell>
                      <TableCell align="left">
                        {examination.subject ? examination.subject.subject_name : "Add One"}
                      </TableCell>
                      <TableCell align="center">

                        {examination.examtype ? examination.examtype.examtype_name : "Add One"}
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
                            onClick={() => handleDelete(examination._id)}
                          >
                            Delete
                          </Button>

                          <Button
                            variant="contained"
                            sx={{ background: "gold", color: "#222222" }}
                            onClick={() => handleEdit(examination._id)}
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
          <Button variant="contained" onClick={handleNewExam}>
            Add Exam
          </Button>
        </Box>
      </Paper>
    </>
  );
}
