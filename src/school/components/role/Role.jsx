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
  import { roleSchema } from "../../../yupSchema/roleSchema";
  
  export default function Role() {
    const [role, setRole] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
  
  
   
  
    
  
    const handleDelete = (id) => {
      if (confirm("Are you sure you want to delete?")) {
        axios
          .delete(`${baseUrl}/role/delete/${id}`)
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
      axios.get(`${baseUrl}/role/fetch-single/${id}`)
        .then((resp) => {
          Formik.setFieldValue("role_name", resp.data.data.role_name);
          Formik.setFieldValue("role_code", resp.data.data.role_code);
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
      role_name: "",
      role_code:""
    };
    const Formik = useFormik({
      initialValues: initialValues,
      validationSchema: roleSchema,
      onSubmit: (values) => {
        if (isEdit) {
          console.log("edit id", editId);
          axios
            .patch(`${baseUrl}/role/update/${editId}`, {
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
              .post(`${baseUrl}/role/create`,{...values})
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
   
  
    const fetchrole = () => {
      axios
        .get(`${baseUrl}/role/fetch-all`)
        .then((resp) => {
          console.log("Fetching data in  Casting Calls  admin.", resp);
          setRole(resp.data.data);
        })
        .catch((e) => {
          console.log("Error in fetching casting calls admin data", e);
        });
    };
    useEffect(() => {
      fetchrole();
      
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
                  Edit role
                </Typography>
              ) : (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "800", textAlign: "center" }}
                >
                  Add New  role
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
                  label="Role Text "
                  variant="outlined"
                  name="role_name"
                  value={Formik.values.role_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.role_name && Formik.errors.role_name && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.role_name}
                  </p>
                )}
  
  
                <TextField
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  id="filled-basic"
                  label="Role Code"
                  variant="outlined"
                  name="role_code"
                  value={Formik.values.role_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.role_code && Formik.errors.role_code && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.role_code}
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
               <TableCell component="th" scope="row"> role Name</TableCell>
                <TableCell align="right">Code</TableCell>
                <TableCell align="right">Details</TableCell>
                <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {role.map((value,i) => (
              <TableRow
                key={i}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {value.role_name}
                </TableCell>
                <TableCell align="right">{value.role_code}</TableCell>
                <TableCell align="right">{"Details"}</TableCell>
                <TableCell align="right">  <Box component={'div'} sx={{bottom:0, display:'flex',justifyContent:"end"}} >
                                  <Button variant='contained' sx={{background:"red",color:"#fff"}} onClick={()=>{handleDelete(value._id)}}>Delete</Button>
                                  <Button variant='contained' sx={{background:"gold", color:"#222222"}} onClick={()=>{handleEdit(value._id)}}>Edit</Button>
                              </Box></TableCell>
             
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
  