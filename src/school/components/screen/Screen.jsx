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
  import { screenSchema } from "../../../yupSchema/screenSchema";
  
  export default function Screen() {
    const [screens, SetScreens] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
  
  
    const handleDelete = (id) => {
      if (confirm("Are you sure you want to delete?")) {
        axios
          .delete(`${baseUrl}/screen/delete/${id}`)
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
      axios.get(`${baseUrl}/screen/fetch-single/${id}`)
        .then((resp) => {
          Formik.setFieldValue("screen_name", resp.data.data.screen_name);
          Formik.setFieldValue("screen_code", resp.data.data.screen_code);
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
      screen_name: "",
      screen_code:""
    };
    const Formik = useFormik({
      initialValues: initialValues,
      validationSchema: screenSchema,
      onSubmit: (values) => {
        if (isEdit) {
          console.log("edit id", editId);
          axios
            .patch(`${baseUrl}/screen/update/${editId}`, {
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
              .post(`${baseUrl}/screen/create`,{...values})
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
   
  
    const fetchScreens = () => {
      axios
        .get(`${baseUrl}/screen/fetch-all`)
        .then((resp) => {
          console.log("Fetching data in  Casting Calls  admin.", resp);
          SetScreens(resp.data.data);
        })
        .catch((e) => {
          console.log("Error in fetching casting calls admin data", e);
        });
    };
    useEffect(() => {
      fetchScreens();
      
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
                  Edit screens
                </Typography>
              ) : (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "800", textAlign: "center" }}
                >
                  Add New  screens
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
                  label="Screen Name "
                  variant="outlined"
                  name="screen_name"
                  value={Formik.values.screen_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.screen_name && Formik.errors.screen_name && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.screen_name}
                  </p>
                )}
  
  
                <TextField
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  id="filled-basic"
                  label="Screen Code"
                  variant="outlined"
                  name="screen_code"
                  value={Formik.values.screen_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.screen_code && Formik.errors.screen_code && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.screen_code}
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
               <TableCell component="th" scope="row"> screens Name</TableCell>
                <TableCell align="right">Code</TableCell>
                <TableCell align="right">Details</TableCell>
                <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {screens.map((value,i) => (
              <TableRow
                key={i}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {value.screen_name}
                </TableCell>
                <TableCell align="right">{value.screen_code}</TableCell>
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
  