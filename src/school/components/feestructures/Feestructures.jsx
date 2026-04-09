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
  Tabs,
  Tab,
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { feestructureSchema } from "../../../yupSchema/feestructureSchema";

export default function Feestructures() {
  const [studentFeestructure, setStudentFeestructure] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [attendeeClass, setAttendeeClass] = useState([])
  const [selectedClass, setSelectedClass] = useState(null);

  const [feestype, setFeestype] = useState([])
  const [selectedFeestype, setSelectedFeestype] = useState(null);
  const [tab, setTab] = useState(0);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/feestructure/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
          clearForm();
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
    axios.get(`${baseUrl}/feestructure/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("name", resp.data.data.name);
        Formik.setFieldValue("code", resp.data.data.code);
        Formik.setFieldValue("class", resp.data.data.class._id);
        Formik.setFieldValue("feestype", resp?.data?.data?.feestype?._id);
        Formik.setFieldValue("amount", resp.data.data.amount);
        const classId = resp.data.data?.class._id || resp.data.class._id;
        const matchedClass = attendeeClass.find(c => c._id === classId);
        setSelectedClass(matchedClass || null);

        const feestypeId = resp.data?.data?.feestype?._id || "";
        const matchedFeestype = feestype.find(c => c._id === feestypeId);
        setSelectedFeestype(matchedFeestype || null);

        setEditId(resp.data.data._id);
        setTab(0); // open Create Class tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    // Formik.resetForm()
    clearForm();
  };

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm()
    // 🔥 reset Autocomplete values
    setSelectedClass(null);
    setSelectedFeestype(null);

  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    name: "",
    code: "",
    class: "",
    feestype: "",
    amount: 0
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: feestructureSchema,
    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);
        axios
          .patch(`${baseUrl}/feestructure/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, edit casting submit", e);
          });
      } else {

        axios
          .post(`${baseUrl}/feestructure/create`, { ...values })
          .then((resp) => {
            console.log("Response after submitting admin casting", resp);
            setMessage(resp.data.message);
            setType("success");
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin casting calls", e);
          });
        // Formik.resetForm();
        clearForm();

      }
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);


  const fetchstudentsfeestructure = () => {
    axios
      .get(`${baseUrl}/feestructure/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setStudentFeestructure(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };

  const fetchClass = async () => {
    try {
      const attendee = await axios.get(`${baseUrl}/class/fetch-all`);
      console.log("attendee", attendee)
      setAttendeeClass(attendee.data.data);

    } catch (error) {
      console.error('Error fetching Class:', error);
    }
  };

  const fetchFeestype = async () => {
    try {
      const feestypes = await axios.get(`${baseUrl}/feestype/fetch-all`);
      console.log("feestypes", feestypes)
      setFeestype(feestypes.data.data);

    } catch (error) {
      console.error('Error fetching Class:', error);
    }
  };

  useEffect(() => {
    fetchClass();
    fetchFeestype();
    fetchstudentsfeestructure();

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
      <Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            {/* <Tab label="Create Receipt" /> */}
            <Tab label={isEdit ? "Edit Feesstructure" : "Add New Feesstructure"} />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box component={"div"} sx={{}}>
            <Paper
              sx={{ padding: '20px', margin: "10px" }}
            >

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >


                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",        // mobile
                      md: "1fr 1fr",    // desktop
                    },
                    gap: 2.5,
                    mt: 3,
                  }}
                >

                  <TextField
                    fullWidth
                    sx={{ marginTop: "10px" }}
                    id="filled-basic"
                    label="name "
                    variant="outlined"
                    name="name"
                    value={Formik.values.name}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />
                  {Formik.touched.name && Formik.errors.name && (
                    <p style={{ color: "red", textTransform: "capitalize" }}>
                      {Formik.errors.name}
                    </p>
                  )}


                  <TextField
                    disabled={isEdit}
                    fullWidth
                    sx={{ marginTop: "10px" }}
                    id="filled-basic"
                    label="code "
                    variant="outlined"
                    name="code"
                    value={Formik.values.code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />
                  {Formik.touched.code && Formik.errors.code && (
                    <p style={{ color: "red", textTransform: "capitalize" }}>
                      {Formik.errors.code}
                    </p>
                  )}

                  {/* Class */}
                  {attendeeClass.length > 0 && (
                    <Box>

                      <Autocomplete
                        disabled={isEdit}
                        options={attendeeClass}
                        getOptionLabel={(option) => option.class_name}
                        value={selectedClass}
                        onChange={(event, newValue) => {
                          setSelectedClass(newValue);

                          Formik.setFieldValue(
                            "class",
                            newValue ? newValue._id : ""
                          );
                        }}
                        onBlur={() => Formik.setFieldTouched("class", true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Class"
                            placeholder="Search class..."
                            fullWidth
                            error={Formik.touched.class && Boolean(Formik.errors.class)}
                            helperText={Formik.touched.class && Formik.errors.class}
                          />
                        )}
                      />


                    </Box>
                  )}

                  {/* Feestype */}
                  
                    <Box>

                      <Autocomplete
                        // disabled={isEdit}
                        options={feestype}
                        getOptionLabel={(option) => option.feestype_name}
                        value={selectedFeestype}
                        onChange={(event, newValue) => {
                          setSelectedFeestype(newValue);

                          Formik.setFieldValue(
                            "feestype",
                            newValue ? newValue._id : ""
                          );
                          
                        }}
                        onBlur={() => Formik.setFieldTouched("feestype", true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Feestype"
                            placeholder="Search feestype..."
                            fullWidth
                            error={Formik.touched.feestype && Boolean(Formik.errors.feestype)}
                            helperText={Formik.touched.feestype && Formik.errors.feestype}
                          />
                        )}
                      />


                    </Box>
                  

                  {/* amount */}
                  <Box>
                    <TextField
                      fullWidth
                      label="amount"
                      variant="outlined"
                      name="amount"
                      type="number"
                      value={Formik.values.amount}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                    />
                    {Formik.touched.amount && Formik.errors.amount && (
                      <Typography color="error" variant="caption">
                        {Formik.errors.amount}
                      </Typography>
                    )}
                  </Box>


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
        )}

        {tab === 1 && (
          <Box>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">  Name</TableCell>
                    <TableCell align="right">Code</TableCell>
                    <TableCell align="right">Class</TableCell>
                    <TableCell align="right">Feestype</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentFeestructure.map((value, i) => (
                    <TableRow
                      key={i}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.name}
                      </TableCell>
                      <TableCell align="right">{value.code}</TableCell>
                      <TableCell align="right">{value.class.class_name}</TableCell>
                      <TableCell align="right">{value?.feestype?.feestype_name||""}</TableCell>
                      <TableCell align="right">{value.amount}</TableCell>
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
        )}

      </Box>
    </>
  );
}
