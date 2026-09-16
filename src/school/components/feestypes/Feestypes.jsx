/* eslint-disable react-hooks/exhaustive-deps */

import {
  Box,
  Button,
  Paper,
  TextField,
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

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { feestypeSchema } from "../../../yupSchema/feestypeSchema";

export default function Feestype() {
  const [studentFeestype, setStudentFeestype] = useState([]);
  const [filteredFeestype, setFilteredFeestype] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  const [taxrates, setTaxrates] = useState([]);
  const [selectedTaxrate, setSelectedTaxrate] = useState(null);

  // Dynamic Search
  const [searchText, setSearchText] = useState("");

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // ==============================
  // INITIAL VALUES
  // ==============================

  const initialValues = {
    feestype_name: "",
    feestype_code: "",
    taxrate: "",
    tax_percent: 0,
    taxtype: "",
  };

  // ==============================
  // FORMIK
  // ==============================

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: feestypeSchema,

    onSubmit: (values) => {
      values.tax_percent = selectedTaxrate?.tax_percent || 0;
      values.taxtype = selectedTaxrate?.taxtype || "inclusive";

      // ==============================
      // UPDATE
      // ==============================

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
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error while updating feestype",
            );

            setType("error");

            console.log("Error, edit feestype submit", e);
          });
      }

      // ==============================
      // CREATE
      // ==============================
      else {
        axios
          .post(`${baseUrl}/feestype/create`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting feestype", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error while creating feestype",
            );

            setType("error");

            console.log("Error, response feestype create", e);
          });
      }
    },
  });

  // ==============================
  // DELETE
  // ==============================

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/feestype/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e.response?.data?.message || "Error while deleting feestype",
          );

          setType("error");

          console.log("Error deleting feestype", e);
        });
    }
  };

  // ==============================
  // EDIT
  // ==============================

  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/feestype/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("feestype_name", data?.feestype_name || "");

        Formik.setFieldValue("feestype_code", data?.feestype_code || "");

        Formik.setFieldValue("taxrate", data?.taxrate?._id || "");

        Formik.setFieldValue("tax_percent", data?.tax_percent || 0);

        Formik.setFieldValue("taxtype", data?.taxtype || "");

        setSelectedTaxrate(data?.taxrate || null);

        setEditId(data?._id);

        // Open Edit tab
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);

        setMessage(
          e.response?.data?.message || "Error while fetching feestype",
        );

        setType("error");
      });
  };

  // ==============================
  // CANCEL EDIT
  // ==============================

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    setSelectedTaxrate(null);

    Formik.resetForm();
  };

  // ==============================
  // FETCH ALL FEESTYPES
  // ==============================

  const fetchstudentsfeestype = () => {
    axios
      .get(`${baseUrl}/feestype/fetch-all`)
      .then((resp) => {
        console.log("Fetching feestype data", resp);

        const data = resp.data.data || [];

        setStudentFeestype(data);
        setFilteredFeestype(data);
      })
      .catch((e) => {
        console.log("Error in fetching feestype data", e);
      });
  };

  // ==============================
  // FETCH TAX RATES
  // ==============================

  const fetchTaxrates = async () => {
    try {
      const taxratesResponse = await axios.get(
        `${baseUrl}/taxrate/fetch-with-query`,
      );

      setTaxrates(taxratesResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching taxrates:", error);
    }
  };

  // ==============================
  // DYNAMIC SEARCH
  // ==============================

  useEffect(() => {
    const searchValue = searchText.trim().toLowerCase();

    // If search box is empty,
    // show all records
    if (!searchValue) {
      setFilteredFeestype(studentFeestype);
      return;
    }

    const filtered = studentFeestype.filter((value) => {
      // Feestype Name
      const name = String(value?.feestype_name || "").toLowerCase();

      // Feestype Code
      const code = String(value?.feestype_code || "").toLowerCase();

      // Taxrate Name
      const taxrateName = String(value?.taxrate?.tax_name || "").toLowerCase();

      // Taxrate Percentage
      const taxPercent = String(
        value?.taxrate?.tax_percent ?? value?.tax_percent ?? "",
      ).toLowerCase();

      // Taxtype
      const taxtype = String(
        value?.taxrate?.taxtype ?? value?.taxtype ?? "",
      ).toLowerCase();

      return (
        name.includes(searchValue) ||
        code.includes(searchValue) ||
        taxrateName.includes(searchValue) ||
        taxPercent.includes(searchValue) ||
        taxtype.includes(searchValue)
      );
    });

    setFilteredFeestype(filtered);
  }, [searchText, studentFeestype]);

  // ==============================
  // FETCH DATA
  // ==============================

  useEffect(() => {
    fetchTaxrates();
    fetchstudentsfeestype();
  }, [message]);

  return (
    <>
      {/* ==============================
          SNACKBAR
      ============================== */}

      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* ==============================
            TABS
        ============================== */}

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={isEdit ? "Edit Feestype" : "Add New Feestype"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
            TAB 0 - ADD / EDIT FEESTYPE
        ===================================================== */}

        {tab === 0 && (
          <Box component="div">
            <Paper
              sx={{
                padding: "20px",
                margin: "10px",
              }}
            >
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* ==============================
                    FEESTYPE NAME
                ============================== */}

                <TextField
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Feestype Text"
                  variant="outlined"
                  name="feestype_name"
                  value={Formik.values.feestype_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.feestype_name &&
                  Formik.errors.feestype_name && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.feestype_name}
                    </p>
                  )}

                {/* ==============================
                    FEESTYPE CODE
                ============================== */}

                <TextField
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Feestype Code"
                  variant="outlined"
                  name="feestype_code"
                  value={Formik.values.feestype_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.feestype_code &&
                  Formik.errors.feestype_code && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.feestype_code}
                    </p>
                  )}

                {/* ==============================
                    TAXRATE
                ============================== */}

                <Box>
                  <Autocomplete
                    sx={{
                      marginTop: "10px",
                    }}
                    options={taxrates}
                    getOptionLabel={(option) => option?.tax_name || ""}
                    value={selectedTaxrate}
                    onChange={(event, newValue) => {
                      setSelectedTaxrate(newValue);

                      Formik.setFieldValue(
                        "taxrate",
                        newValue ? newValue._id : "",
                      );

                      Formik.setFieldValue(
                        "tax_percent",
                        newValue ? newValue.tax_percent : 0,
                      );

                      Formik.setFieldValue(
                        "taxtype",
                        newValue ? newValue?.taxtype : "inclusive",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("taxrate", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select taxrate"
                        placeholder="Search taxrate..."
                        fullWidth
                        error={
                          Formik.touched.taxrate &&
                          Boolean(Formik.errors.taxrate)
                        }
                        helperText={
                          Formik.touched.taxrate && Formik.errors.taxrate
                        }
                      />
                    )}
                  />
                </Box>

                {/* ==============================
                    BUTTONS
                ============================== */}

                <Box
                  sx={{
                    marginTop: "10px",
                  }}
                >
                  <Button
                    type="submit"
                    sx={{
                      marginRight: "10px",
                    }}
                    variant="contained"
                  >
                    Submit
                  </Button>

                  {isEdit && (
                    <Button
                      sx={{
                        marginRight: "10px",
                      }}
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

        {/* =====================================================
            TAB 1 - VIEW LIST
        ===================================================== */}

        {tab === 1 && (
          <Box>
            {/* ==============================
                DYNAMIC SEARCH
            ============================== */}

            <Paper
              sx={{
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  label="Search Feestype"
                  placeholder="Search by Name, Code, Taxrate, Taxtype..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{
                    flex: 1,
                    minWidth: {
                      xs: "100%",
                      sm: "400px",
                    },
                  }}
                />

                <Box
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Fee Types: {filteredFeestype.length}
                </Box>
              </Box>
            </Paper>

            {/* ==============================
                TABLE
            ============================== */}

            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="feestype table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Name
                    </TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Taxrate</TableCell>

                    <TableCell align="right">Taxtype</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredFeestype.length > 0 ? (
                    filteredFeestype.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* NAME */}

                        <TableCell component="th" scope="row">
                          {value.feestype_name}
                        </TableCell>

                        {/* CODE */}

                        <TableCell align="right">
                          {value.feestype_code}
                        </TableCell>

                        {/* TAXRATE */}

                        <TableCell align="right">
                          {value?.taxrate?.tax_percent ??
                            value?.tax_percent ??
                            "0"}{" "}
                          %
                        </TableCell>

                        {/* TAXTYPE */}

                        <TableCell align="right">
                          {value?.taxrate?.taxtype ||
                            value?.taxtype ||
                            "inclusive"}
                        </TableCell>

                        {/* ACTION */}

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1.5,
                            }}
                          >
                            {/* DELETE */}

                            <Button
                              variant="contained"
                              sx={{
                                background: "red",
                                color: "#fff",
                                "&:hover": {
                                  background: "#cc0000",
                                },
                              }}
                              onClick={() => handleDelete(value._id)}
                            >
                              Delete
                            </Button>

                            {/* EDIT */}

                            <Button
                              variant="contained"
                              sx={{
                                background: "gold",
                                color: "#222222",
                                "&:hover": {
                                  background: "#d4af00",
                                },
                              }}
                              onClick={() => handleEdit(value._id)}
                            >
                              Edit
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </>
  );
}
