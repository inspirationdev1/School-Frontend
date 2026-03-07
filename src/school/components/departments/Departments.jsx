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
  import { departmentSchema } from "../../../yupSchema/departmentSchema";
  
  export default function Department() {
    const [studentDepartment, setStudentDepartment] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
  
  
   
  
    
  
    const handleDelete = (id) => {
      if (confirm("Are you sure you want to delete?")) {
        axios
          .delete(`${baseUrl}/department/delete/${id}`)
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
      axios.get(`${baseUrl}/department/fetch-single/${id}`)
        .then((resp) => {
          Formik.setFieldValue("department_name", resp.data.data.department_name);
          Formik.setFieldValue("department_code", resp.data.data.department_code);
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
      department_name: "",
      department_code:""
    };
    const Formik = useFormik({
      initialValues: initialValues,
      validationSchema: departmentSchema,
      onSubmit: (values) => {
        if (isEdit) {
          console.log("edit id", editId);
          axios
            .patch(`${baseUrl}/department/update/${editId}`, {
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
              .post(`${baseUrl}/department/create`,{...values})
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
    const fetchStudentDepartment = () => {
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
  
    const fetchstudentsdepartment = () => {
      axios
        .get(`${baseUrl}/department/fetch-all`)
        .then((resp) => {
          console.log("Fetching data in  Casting Calls  admin.", resp);
          setStudentDepartment(resp.data.data);
        })
        .catch((e) => {
          console.log("Error in fetching casting calls admin data", e);
        });
    };
    useEffect(() => {
      fetchstudentsdepartment();
      fetchStudentDepartment();
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
                  Edit department
                </Typography>
              ) : (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "800", textAlign: "center" }}
                >
                  Add New  department
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
                  label="Department Name"
                  variant="outlined"
                  name="department_name"
                  value={Formik.values.department_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.department_name && Formik.errors.department_name && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.department_name}
                  </p>
                )}
  
  
                <TextField
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  id="filled-basic"
                  label="Department Code"
                  variant="outlined"
                  name="department_code"
                  value={Formik.values.department_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.department_code && Formik.errors.department_code && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.department_code}
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
               <TableCell component="th" scope="row"> department Name</TableCell>
                <TableCell align="right">Code</TableCell>
                <TableCell align="right">Details</TableCell>
                <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentDepartment.map((value,i) => (
              <TableRow
                key={i}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {value.department_name}
                </TableCell>
                <TableCell align="right">{value.department_code}</TableCell>
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
  