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
  import { examtypeSchema } from "../../../yupSchema/examtypeSchema";
  
  export default function Examtype() {
    const [studentExamtype, setStudentExamtype] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
  
    const handleDelete = (id) => {
      if (confirm("Are you sure you want to delete?")) {
        axios
          .delete(`${baseUrl}/examtype/delete/${id}`)
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
      axios.get(`${baseUrl}/examtype/fetch-single/${id}`)
        .then((resp) => {
          Formik.setFieldValue("examtype_name", resp.data.data.examtype_name);
          Formik.setFieldValue("examtype_code", resp.data.data.examtype_code);
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
      examtype_name: "",
      examtype_code:""
    };
    const Formik = useFormik({
      initialValues: initialValues,
      validationSchema: examtypeSchema,
      onSubmit: (values) => {
        if (isEdit) {
          console.log("edit id", editId);
          axios
            .patch(`${baseUrl}/examtype/update/${editId}`, {
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
              .post(`${baseUrl}/examtype/create`,{...values})
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
    
  
    const fetchstudentsexamtype = () => {
      axios
        .get(`${baseUrl}/examtype/fetch-all`)
        .then((resp) => {
          console.log("Fetching data in  Casting Calls  admin.", resp);
          setStudentExamtype(resp.data.data);
        })
        .catch((e) => {
          console.log("Error in fetching casting calls admin data", e);
        });
    };
    useEffect(() => {
      fetchstudentsexamtype();
      
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
          
  
          <Box component={"div"} sx={{ }}>
            <Paper
              sx={{ padding:'20px', margin: "10px" }}
            >
              {isEdit ? (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "800", textAlign: "center" }}
                >
                  Edit examtype
                </Typography>
              ) : (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "800", textAlign: "center" }}
                >
                  Add New  examtype
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
                  label="Examtype Text "
                  variant="outlined"
                  name="examtype_name"
                  value={Formik.values.examtype_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.examtype_name && Formik.errors.examtype_name && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.examtype_name}
                  </p>
                )}
  
  
                <TextField
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  id="filled-basic"
                  label="Examtype Code "
                  variant="outlined"
                  name="examtype_code"
                  value={Formik.values.examtype_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.examtype_code && Formik.errors.examtype_code && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.examtype_code}
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
               <TableCell component="th" scope="row"> examtype Name</TableCell>
                <TableCell align="right">Code</TableCell>
                <TableCell align="right">Details</TableCell>
                <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentExamtype.map((value,i) => (
              <TableRow
                key={i}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {value.examtype_name}
                </TableCell>
                <TableCell align="right">{value.examtype_code}</TableCell>
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
  