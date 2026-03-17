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


  const [examinations, setExaminations] = useState([]);
  const [submitted, setSubmitted] = useState("not submitted")



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
        examFormik.setFieldValue("name", resp.data.data.name);
        examFormik.setFieldValue("examCode", resp.data.data.examCode);
        examFormik.setFieldValue("examNo", resp.data.data.examNo);

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
    initialValues: { name: "", examCode: "", examNo: 0 },
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

        axios
          .post(`${baseUrl}/examination/new`, {
            ...values
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
      .get(`${baseUrl}/examination/all`)
      .then((resp) => {
        console.log("ALL Examination", resp);
        setExaminations(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  Examinstions.");
      });
  };
  useEffect(() => {

    fetchExaminations();

  }, [message]);







  return (
    <>
      {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}
      <Box><Typography className="hero-text" variant="h2" sx={{ textAlign: "center" }}>Examinations</Typography></Box>


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

            {/* Exam Name */}
            <TextField
              fullWidth
              sx={{ marginTop: "10px" }}
              id="filled-basic"
              label="Exam Name"
              variant="outlined"
              name="name"
              value={examFormik.values.name}
              onChange={examFormik.handleChange}
              onBlur={examFormik.handleBlur}
            />
            {examFormik.touched.name && examFormik.errors.name && (
              <p style={{ color: "red", textTransform: "capitalize" }}>
                {examFormik.errors.name}
              </p>
            )}

            {/* Exam Code */}
            <TextField
              fullWidth
              sx={{ marginTop: "10px" }}
              id="filled-basic"
              label="Exam Code"
              variant="outlined"
              name="examCode"
              value={examFormik.values.examCode}
              onChange={examFormik.handleChange}
              onBlur={examFormik.handleBlur}
            />
            {examFormik.touched.examCode && examFormik.errors.examCode && (
              <p style={{ color: "red", textTransform: "capitalize" }}>
                {examFormik.errors.examCode}
              </p>
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
                  Exam Name
                </TableCell>
                <TableCell sx={{ fontWeight: "700" }} align="left">
                  Exam Code
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
                      <TableCell align="left">
                        {examination.name ? examination.name : ""}
                      </TableCell>

                      <TableCell align="left">
                        {examination.examCode ? examination.examCode : ""}
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
