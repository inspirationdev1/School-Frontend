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

import { useEffect, useState, useRef } from "react";
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


  const [classExaminations, setClassExaminations] = useState([]);


  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Independent state for image preview
  const [selectedYear, setSelectedYear] = useState(null);

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const resetMessage = () => {
    setMessage("");
  };

  const handleMessage = (type, message) => {
    console.log("Called")
    setType(type);
    setMessage(message)
  }

  // Handle image file selection
  const addImage = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);

      questionpaperFormik.setFieldValue(
        "fileName",
        selectedFile ? selectedFile.name : ""
      );

      if (selectedFile.type === "application/pdf") {
        setImageUrl("pdf");   // special indicator
      } else {
        setImageUrl(URL.createObjectURL(selectedFile));
      }
    }
  };
  // const addImage = (event) => {
  //   const selectedFile = event.target.files[0];
  //   if (selectedFile) {
  //     setFile(selectedFile);
  //     setImageUrl(URL.createObjectURL(selectedFile));
  //   }
  // };

  //   CLEARING IMAGE FILE REFENCE FROM INPUT
  const fileInputRef = useRef(null);
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setFile(null); // Reset the file state
    setImageUrl(null); // Clear the image preview
  };


  const handleNewQuestionpaper = () => {
    cancelEditQuestionpaper();
    setQuestionpaperForm(true);
  };

  const viewUploadFile = (fileName) => {
    
    const fileUrl = `${fileName}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");

    // const url = `${window.location.origin}/school/PdfViewer?fileUrl=${fileName}`;
    //     window.open(url, '_blank');
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
        questionpaperFormik.setFieldValue("class", resp.data.data.class._id);
        questionpaperFormik.setFieldValue("subject", resp.data.data.subject._id);
        questionpaperFormik.setFieldValue("teacher", resp.data.data.teacher._id);
        questionpaperFormik.setFieldValue("examination", resp.data.data.examination._id);
        questionpaperFormik.setFieldValue("marksLimit", resp.data.data.marksLimit);
        questionpaperFormik.setFieldValue("fileName", resp.data.data.fileName);

        questionpaperFormik.setFieldValue("year", resp.data.data.year);
        const matchedYear = years.find(s => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        // const classId = resp.data.data?.class || resp.data.class;
        // const matchedClass = allClasses.find(c => c._id === classId);
        setSelectedClass(resp.data.data.class);

        // const subjectId = resp.data.data?.subject || resp.data.subject;
        // const matchedSubject = allSubjects.find(c => c._id === subjectId);
        setSelectedSubject(resp.data.data.subject);

        // const teacherId = resp.data.data?.teacher || resp.data.teacher;
        // const matchedTeacher = allTeachers.find(c => c._id === teacherId);
        setSelectedTeacher(resp.data.data.teacher);

        // const examId = resp.data.data?.examination || resp.data.examination;
        // const matchedExamination = allExaminations.find(c => c._id === examId);
        setSelectedExamination(resp.data.data.examination);



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

    setSelectedClass(null);
    setSelectedExamination(null);

    setSelectedSubject(null);
    setSelectedTeacher(null);

    setClassExaminations([]);
    setEditQuestionpaper(false);

    setSelectedYear(null);
    questionpaperFormik.resetForm();
  };

  const questionpaperFormik = useFormik({
    initialValues: {
      name: "", description: "", date: "", class: "", subject: "", teacher: "", examination: ""
      , marksLimit: 0, fileType: "", fileName: "", year: ""
    },
    validationSchema: questionpaperSchema,
    onSubmit: (values) => {
      if (isEditQuestionpaper) {

        const fd = new FormData();
        Object.keys(values).forEach((key) => fd.append(key, values[key]));
        if (file) {
          fd.append("image", file, file.name);
        }

        axios
          .patch(`${baseUrl}/questionpaper/update/${questionpaperEditId}`, fd)
          .then((resp) => {
            handleMessage("success", resp.data.message);
            handleClearFile();
          })
          .catch((e) => {
            handleMessage("error", e.response.data.message);
          });

      } else {
        console.log("Values", values)
        console.log("selected Class", selectedClass)


        // values.class_id= selectedClass?._id;
        const fd = new FormData();
        Object.keys(values).forEach((key) => fd.append(key, values[key]));
        if (file) {
          fd.append("image", file, file.name);
          axios
            .post(`${baseUrl}/questionpaper/new`, fd)
            .then((resp) => {
              handleMessage("success", resp.data.message);
              console.log("success", resp);
              handleClearFile();
            })
            .catch((e) => {
              console.log(e, "error")
              handleMessage("error", e.response.data.message);
            });
        }


      }
      cancelEditQuestionpaper();
      setSubmitted("Submitted")
    },
  });


  const fetchAllQuestionpapers = () => {
    axios
      .get(`${baseUrl}/questionpaper/all`)
      .then((resp) => {
        console.log("ALL Questionpaper", resp);
        setQuestionpapers(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  Questionpaperinstions.");
      });
  };


  useEffect(() => {

    fetchAllQuestionpapers();

  }, [message]);

  const fetchStudentClass = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setAllClasses(resp.data.data);
        console.log("Class", resp.data);

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
      .get(`${baseUrl}/examination/all`)
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
    fetchAllExaminations();

  }, []);




  return (
    <>
      {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}
      <Box><Typography className="hero-text" variant="h2" sx={{ textAlign: "center" }}>Questionpapers</Typography></Box>
      {/* <Paper sx={{ margin: "10px", padding: "10px" }}> */}




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

            {/* Class */}

            <Box>

              <Autocomplete
                disabled={isEditQuestionpaper}
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


            <Box>
              <TextField
                fullWidth
                label="Name"
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


            {/* Academic Year */}
            <Box>
              <Autocomplete
                disabled={isEditQuestionpaper}
                options={years}
                getOptionLabel={(option) => option.label}
                value={selectedYear}
                onChange={(event, newValue) => {
                  setSelectedYear(newValue);

                  questionpaperFormik.setFieldValue(
                    "year",
                    newValue ? newValue.value : ""
                  );
                }}
                onBlur={() => questionpaperFormik.setFieldTouched("year", true)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Academic Year"
                    placeholder="Search year..."
                    fullWidth
                    error={questionpaperFormik.touched.year && Boolean(questionpaperFormik.errors.year)}
                    helperText={questionpaperFormik.touched.year && questionpaperFormik.errors.year}
                  />
                )}
              />
            </Box>

            {/* Subject */}

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
              onBlur={() => questionpaperFormik.setFieldTouched("subject", true)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Subject"
                  placeholder="Search subject..."
                  fullWidth
                  error={questionpaperFormik.touched.subject && Boolean(questionpaperFormik.errors.subject)}
                  helperText={questionpaperFormik.touched.subject && questionpaperFormik.errors.subject}
                />
              )}
            />


            {/* Teacher */}

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
              onBlur={() => questionpaperFormik.setFieldTouched("teacher", true)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Teacher"
                  placeholder="Search teacher..."
                  fullWidth
                  error={questionpaperFormik.touched.teacher && Boolean(questionpaperFormik.errors.teacher)}
                  helperText={questionpaperFormik.touched.teacher && questionpaperFormik.errors.teacher}
                />
              )}
            />

            {/* Examination */}

            <Autocomplete
              disabled={isEditQuestionpaper}
              options={allExaminations}
              getOptionLabel={(option) => option.name}
              value={selectedExamination}
              onChange={(event, newValue) => {
                setSelectedExamination(newValue);
                questionpaperFormik.setFieldValue(
                  "examination",
                  newValue ? newValue._id : ""
                );




              }}
              onBlur={() => questionpaperFormik.setFieldTouched("examination", true)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Examination"
                  placeholder="Search examination..."
                  fullWidth
                  error={questionpaperFormik.touched.examination && Boolean(questionpaperFormik.errors.examination)}
                  helperText={questionpaperFormik.touched.examination && questionpaperFormik.errors.examination}
                />
              )}
            />

            {/* marksLimit */}
            <Box>
              <TextField
                fullWidth
                label="marksLimit"
                variant="outlined"
                name="marksLimit"
                type="number"
                value={questionpaperFormik.values.marksLimit}
                onChange={questionpaperFormik.handleChange}
                onBlur={questionpaperFormik.handleBlur}

              />

              {questionpaperFormik.touched.marksLimit && questionpaperFormik.errors.marksLimit && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {questionpaperFormik.errors.marksLimit}
                </p>
              )}

            </Box>






            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography sx={{ marginRight: "10px" }} variant="h10">
                File
              </Typography>
              <TextField
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                variant="outlined"
                name="fileName"
                type="file"
                inputProps={{ accept: ".pdf,image/*" }}
                onChange={addImage}
                inputRef={fileInputRef}
              />

              {imageUrl && (
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    height="240px"
                  />
                </Box>
              )}
              {questionpaperFormik.touched.fileName &&
                questionpaperFormik.errors.fileName && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {questionpaperFormik.errors.fileName}
                  </p>
                )}
            </Box>



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
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Marks Limit
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  File
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

                      <TableCell align="right">
                        {questionpaper.marksLimit ? questionpaper.marksLimit : 0}
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

                          <Button
                            variant="contained"
                            sx={{ background: "skyblue", color: "#000" }}
                            onClick={() => viewUploadFile(questionpaper.fileName)}
                          >
                            View Upload File
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
