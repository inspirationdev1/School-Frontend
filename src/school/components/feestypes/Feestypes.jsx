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
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { feestypeSchema } from "../../../yupSchema/feestypeSchema";

export default function Feestype() {
  const [studentFeestype, setStudentFeestype] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);






  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/feestype/delete/${id}`)
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
  const handleEdit = (id) => {
    console.log("Handle  Edit is called", id);
    setEdit(true);
    axios.get(`${baseUrl}/feestype/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("feestype_name", resp.data.data.feestype_name);
        Formik.setFieldValue("feestype_codename", resp.data.data.feestype_codename);
        setEditId(resp.data.data._id);
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
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
    feestype_name: "",
    feestype_codename: ""
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: feestypeSchema,
    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);
        axios
          .patch(`${baseUrl}/feestype/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, edit casting submit", e);
          });
      } else {

        axios
          .post(`${baseUrl}/feestype/create`, { ...values })
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
        Formik.resetForm();

      }
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);
  const fetchStudentFeestype = () => {
    // axios
    //   .get(`${baseUrl}/casting/get-month-year`)
    //   .then((resp) => {
    //     console.log("Fetching month and year.", resp);
    //     setMonth(resp.data.month);
    //     setYear(resp.data.year);
    //   })
    //   .catch((e) => {
    //     console.log("Error in fetching month and year", e);
    //   });
  };

  const fetchstudentsfeestype = () => {
    axios
      .get(`${baseUrl}/feestype/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setStudentFeestype(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };
  useEffect(() => {
    fetchstudentsfeestype();
    fetchStudentFeestype();
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


      <Box sx={{ padding: "40px 10px 20px 10px" }}
      >


        <Box component={"div"} sx={{}}>
          <Paper
            sx={{ padding: '20px', margin: "10px" }}
          >
            {isEdit ? (
              <Typography
                variant="h4"
                sx={{ fontWeight: "800", textAlign: "center" }}
              >
                Edit feestype
              </Typography>
            ) : (
              <Typography
                variant="h4"
                sx={{ fontWeight: "800", textAlign: "center" }}
              >
                Add New  feestype
              </Typography>
            )}{" "}
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={Formik.handleSubmit}
            >


              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Feestype Text "
                variant="outlined"
                name="feestype_name"
                value={Formik.values.feestype_name}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.feestype_name && Formik.errors.feestype_name && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.feestype_name}
                </p>
              )}


              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Feestype Codename "
                variant="outlined"
                name="feestype_codename"
                value={Formik.values.feestype_codename}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.feestype_codename && Formik.errors.feestype_codename && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.feestype_codename}
                </p>
              )}








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



        <Box>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell component="th" scope="row"> feestype Name</TableCell>
                  <TableCell align="right">Code</TableCell>
                  <TableCell align="right">Details</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentFeestype.map((value, i) => (
                  <TableRow
                    key={i}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {value.feestype_name}
                    </TableCell>
                    <TableCell align="right">{value.feestype_codename}</TableCell>
                    <TableCell align="right">{"Details"}</TableCell>
                    <TableCell align="right">
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
                      </Box>

                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </Box>
      </Box>
    </>
  );
}
