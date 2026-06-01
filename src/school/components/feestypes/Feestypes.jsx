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
  Tabs,
  Tab,
  Autocomplete,
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
  const [tab, setTab] = useState(0);

  const [taxrates, setTaxrates] = useState([]);
  const [selectedTaxrate, setSelectedTaxrate] = useState(null);


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
        Formik.setFieldValue("feestype_code", resp.data.data.feestype_code);
        Formik.setFieldValue("taxrate", resp.data.data?.taxrate?._id);
        Formik.setFieldValue("tax_percent", resp.data.data?.tax_percent);
        Formik.setFieldValue("taxtype", resp.data.data?.taxtype);
        setSelectedTaxrate(resp.data.data?.taxrate);
        setEditId(resp.data.data._id);
        setTab(0); // open Create Class tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    setSelectedTaxrate(null);
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
    feestype_code: "",
    taxrate: "",
    tax_percent: 0,
    taxtype:"",
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: feestypeSchema,
    onSubmit: (values) => {

      values.tax_percent = selectedTaxrate?.tax_percent;
      values.taxtype = selectedTaxrate?.taxtype;
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
            setTab(1); // go to View List
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
            cancelEdit();
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

  const fetchTaxrates = async () => {
    try {
      const taxratesResponse = await axios.get(`${baseUrl}/taxrate/fetch-with-query`); // Fetch based on class
      setTaxrates(taxratesResponse.data.data);

    } catch (error) {
      console.error('Error fetching taxrates:', error);
    }
  };
  useEffect(() => {
    fetchTaxrates();
    fetchstudentsfeestype();

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
            <Tab label={isEdit ? "Edit Feestype" : "Add New Feestype"} />
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
                  // disabled={isEdit}
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  id="filled-basic"
                  label="Feestype Code "
                  variant="outlined"
                  name="feestype_code"
                  value={Formik.values.feestype_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.feestype_code && Formik.errors.feestype_code && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.feestype_code}
                  </p>
                )}

                <Box>

                  <Autocomplete
                    sx={{ marginTop: "10px" }}
                    // disabled={isEdit}
                    options={taxrates}
                    getOptionLabel={(option) => option?.tax_name}
                    value={selectedTaxrate}
                    onChange={(event, newValue) => {
                      setSelectedTaxrate(newValue);

                      Formik.setFieldValue(
                        "taxrate",
                        newValue ? newValue._id : ""
                      );
                      Formik.setFieldValue(
                        "tax_percent",
                        newValue ? newValue.tax_percent : 0
                      );
                      Formik.setFieldValue(
                        "taxtype",
                        newValue ? newValue?.taxtype : "inclusive"
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("taxrate", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select taxrate"
                        placeholder="Search taxrate..."
                        fullWidth
                        error={Formik.touched.taxrate && Boolean(Formik.errors.taxrate)}
                        helperText={Formik.touched.taxrate && Formik.errors.taxrate}
                      />
                    )}
                  />


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
                    <TableCell align="right">Taxrate</TableCell>
                    <TableCell align="right">Taxtype</TableCell>
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
                      <TableCell align="right">{value.feestype_code}</TableCell>
                      <TableCell align="right">{(value?.taxrate?.tax_percent || "0") + " %"}</TableCell>
                      <TableCell align="right">{(value?.taxrate?.taxtype || "inclusive") + " %"}</TableCell>
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
