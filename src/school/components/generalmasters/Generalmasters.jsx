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
  Stack,
  Tabs,
  Tab
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { generalmasterSchema } from "../../../yupSchema/generalmasterSchema";

export default function Generalmasters() {
  const [studentGeneralmaster, setStudentGeneralmaster] = useState([]);
  const [generalmastertypes, setGeneralmastertypes] = useState([]);
  const [selectedgeneralmaster_type, setSelectedgeneralmaster_type] = useState(null);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  const [params, setParams] = useState({});
    
      const handleSearch = (e) => {
        let newParam;
        if (e.target.value !== "") {
          newParam = { ...params, search: e.target.value };
        } else {
          newParam = { ...params };
          delete newParam["search"];
        }
    
        setParams(newParam);
      };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/generalmaster/delete/${id}`)
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
    axios.get(`${baseUrl}/generalmaster/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("generalmaster_name", resp.data.data.generalmaster_name);
        Formik.setFieldValue("generalmaster_code", resp.data.data.generalmaster_code);
        Formik.setFieldValue("generalmaster_type", resp.data.data.generalmaster_type);

        const matchedType = generalmastertypes.find(s => s.generalmaster_type === resp.data.data.generalmaster_type);
        setSelectedgeneralmaster_type(matchedType || null);

        setEditId(resp.data.data._id);
        setTab(0); // open Create  tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    setSelectedgeneralmaster_type(null);
    Formik.resetForm()
  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    generalmaster_name: "",
    generalmaster_code: "",
    generalmaster_type: "",
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: generalmasterSchema,
    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);
        axios
          .patch(`${baseUrl}/generalmaster/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
            setParams({});
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, edit casting submit", e);
          });
      } else {

        axios
          .post(`${baseUrl}/generalmaster/create`, { ...values })
          .then((resp) => {
            console.log("Response after submitting admin casting", resp);
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
            setParams({});
            setTab(1); // go to View List
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


  const fetchGeneralmastertypes = async () => {
    try {
      const generalmastertypesData = [
        { generalmaster_type: "castecategory", generalmaster_name: "Caste Categoary" },
        { generalmaster_type: "bloodgroup", generalmaster_name: "Blood Group" },
        { generalmaster_type: "nationality", generalmaster_name: "Nationality" },
        { generalmaster_type: "religion", generalmaster_name: "Religion" },
        { generalmaster_type: "language", generalmaster_name: "Language" },
        { generalmaster_type: "modeoftransport", generalmaster_name: "mode of transport" },
        { generalmaster_type: "board", generalmaster_name: "Board" },
        { generalmaster_type: "previousschool", generalmaster_name: "Previous School" },
        
        

      ];
      setGeneralmastertypes(generalmastertypesData);

    } catch (error) {
      console.error('Error fetching Generalmaster types:', error);
    }
  };
  const fetchgeneralmaster = () => {
    // axios
    //   .get(`${baseUrl}/generalmaster/fetch-all`)
    //   .then((resp) => {
    //     console.log("Fetching data in  Casting Calls  admin.", resp);
    //     setStudentGeneralmaster(resp.data.data);
    //   })
    //   .catch((e) => {
    //     console.log("Error in fetching casting calls admin data", e);
    //   });
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params })
      .then((resp) => {
        setStudentGeneralmaster(resp.data.data);
        
      })
      .catch(() => console.log("Error in fetching students data"));
  };
  useEffect(() => {
    fetchGeneralmastertypes();
    fetchgeneralmaster();

  }, [message, params]);
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

            <Tab label={isEdit ? "Edit generalmaster" : "Add New  generalmaster"} />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box component={"div"} sx={{}}>
            <Paper
            // sx={{ padding: '20px', margin: "10px" }}
            >

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                <Stack spacing={2}> {/* 👈 controls all vertical gaps */}

                  <TextField
                    fullWidth
                    label="Generalmaster Text"
                    name="generalmaster_name"
                    value={Formik.values.generalmaster_name}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    error={Formik.touched.generalmaster_name && Boolean(Formik.errors.generalmaster_name)}
                    helperText={Formik.touched.generalmaster_name && Formik.errors.generalmaster_name}
                  />

                  <TextField
                    fullWidth
                    label="Generalmaster Code"
                    name="generalmaster_code"
                    value={Formik.values.generalmaster_code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    error={Formik.touched.generalmaster_code && Boolean(Formik.errors.generalmaster_code)}
                    helperText={Formik.touched.generalmaster_code && Formik.errors.generalmaster_code}
                  />

                  <Autocomplete
                    options={generalmastertypes}
                    getOptionLabel={(option) => option.generalmaster_name}
                    value={selectedgeneralmaster_type}
                    onChange={(event, newValue) => {
                      setSelectedgeneralmaster_type(newValue);
                      Formik.setFieldValue(
                        "generalmaster_type",
                        newValue ? newValue.generalmaster_type : ""
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("generalmaster_type", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select General Master type"
                        error={Formik.touched.generalmaster_type && Boolean(Formik.errors.generalmaster_type)}
                        helperText={Formik.touched.generalmaster_type && Formik.errors.generalmaster_type}
                      />
                    )}
                  />

                  <Box>
                    <Stack direction="row" spacing={2}>
                      <Button type="submit" variant="contained">
                        Submit
                      </Button>

                      {isEdit && (
                        <Button variant="outlined" onClick={cancelEdit}>
                          Cancel Edit
                        </Button>
                      )}
                    </Stack>
                  </Box>

                </Stack>
              </Box>
            </Paper>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          {/* Search */}
                          <TextField
                            label="Search .."
                            size="small"
                            onChange={handleSearch}
                            fullWidth
                            sx={{
                              flex: 2,
                              "& .MuiInputBase-root": {
                                height: 42,
                                fontSize: "14px",
                              },
                            }}
                          />
            
                          {/* No of Students Card */}
                          {/* <Box
                            sx={{
                              flex: 1,
                              minWidth: { xs: "100%", sm: 160 },
                              height: 42,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 2,
                              bgcolor: "primary.main",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "14px",
                              boxShadow: 2,
                            }}
                          >
                            Students Count : {noofstudents}
                          </Box> */}
                        </Box>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row"> generalmaster Name</TableCell>
                    <TableCell align="right">Code</TableCell>
                    <TableCell align="right">Type</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentGeneralmaster.map((value, i) => (
                    <TableRow
                      key={i}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.generalmaster_name}
                      </TableCell>
                      <TableCell align="right">{value.generalmaster_code}</TableCell>
                      <TableCell align="right">{value.generalmaster_type}</TableCell>
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
