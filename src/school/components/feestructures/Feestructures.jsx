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

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { feestructureSchema } from "../../../yupSchema/feestructureSchema";

export default function Feestructures() {
  // =========================
  // STATE
  // =========================

  const [studentFeestructure, setStudentFeestructure] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  const [attendeeClass, setAttendeeClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [feestype, setFeestype] = useState([]);
  const [selectedFeestype, setSelectedFeestype] = useState(null);

  const [tab, setTab] = useState(0);

  // Snackbar
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  // =========================
  // INITIAL VALUES
  // =========================

  const initialValues = {
    name: "",
    code: "",
    class: "",
    feestype: "",
    taxrate: "",
    tax_percent: 0,
    taxtype: "",
    amount: 0,
  };

  // =========================
  // SNACKBAR
  // =========================

  const resetMessage = () => {
    setMessage("");
  };

  // =========================
  // FETCH FEE STRUCTURES
  // =========================

  const fetchstudentsfeestructure = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/feestructure/fetch-all`);

      console.log("Fee Structure Data:", resp.data);

      setStudentFeestructure(resp.data?.data || []);
    } catch (error) {
      console.error("Error fetching fee structures:", error);

      setMessage(
        error?.response?.data?.message || "Error fetching fee structures",
      );
      setType("error");
    }
  };

  // =========================
  // FETCH CLASS
  // =========================

  const fetchClass = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/class/fetch-all`);

      console.log("Class Data:", resp.data);

      setAttendeeClass(resp.data?.data || []);
    } catch (error) {
      console.error("Error fetching Class:", error);

      setMessage(error?.response?.data?.message || "Error fetching classes");
      setType("error");
    }
  };

  // =========================
  // FETCH FEE TYPES
  // =========================

  const fetchFeestype = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/feestype/fetch-all`);

      console.log("Fee Type Data:", resp.data);

      setFeestype(resp.data?.data || []);
    } catch (error) {
      console.error("Error fetching Fee Types:", error);

      setMessage(error?.response?.data?.message || "Error fetching fee types");
      setType("error");
    }
  };

  // =========================
  // INITIAL API CALLS
  // =========================

  useEffect(() => {
    fetchClass();
    fetchFeestype();
    fetchstudentsfeestructure();
  }, []);

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setEdit(false);
    setEditId(null);

    Formik.resetForm();

    setSelectedClass(null);
    setSelectedFeestype(null);
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    clearForm();
    setTab(0);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fee structure?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const resp = await axios.delete(`${baseUrl}/feestructure/delete/${id}`);

      setMessage(resp?.data?.message || "Fee structure deleted successfully");
      setType("success");

      await fetchstudentsfeestructure();

      clearForm();
    } catch (error) {
      console.error("Error deleting fee structure:", error);

      setMessage(
        error?.response?.data?.message || "Error deleting fee structure",
      );
      setType("error");
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = async (id) => {
    try {
      console.log("Handle Edit:", id);

      const resp = await axios.get(
        `${baseUrl}/feestructure/fetch-single/${id}`,
      );

      const data = resp?.data?.data;

      if (!data) {
        setMessage("Fee structure data not found");
        setType("error");
        return;
      }

      console.log("Edit Fee Structure Data:", data);

      // Enable edit mode
      setEdit(true);
      setEditId(data._id);

      // Form values
      Formik.setFieldValue("name", data.name || "");
      Formik.setFieldValue("code", data.code || "");

      Formik.setFieldValue("class", data?.class?._id || "");

      Formik.setFieldValue("feestype", data?.feestype?._id || "");

      Formik.setFieldValue("taxrate", data?.taxrate?._id || "");

      Formik.setFieldValue(
        "tax_percent",
        data?.taxrate?.tax_percent ?? data?.feestype?.tax_percent ?? 0,
      );

      Formik.setFieldValue(
        "taxtype",
        data?.taxrate?.taxtype ?? data?.feestype?.taxtype ?? "inclusive",
      );

      Formik.setFieldValue("amount", data.amount ?? 0);

      // Autocomplete values
      setSelectedClass(data?.class || null);
      setSelectedFeestype(data?.feestype || null);

      // Open Add/Edit tab
      setTab(0);
    } catch (error) {
      console.error("Error fetching fee structure for edit:", error);

      setMessage(
        error?.response?.data?.message || "Error fetching fee structure",
      );
      setType("error");
    }
  };

  // =========================
  // SEARCH
  // =========================

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredFeestructures = studentFeestructure.filter((value) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      value?.name?.toLowerCase().includes(searchText) ||
      value?.code?.toLowerCase().includes(searchText) ||
      value?.class?.class_name?.toLowerCase().includes(searchText) ||
      value?.class?.name?.toLowerCase().includes(searchText) ||
      value?.feestype?.feestype_name?.toLowerCase().includes(searchText) ||
      String(value?.amount ?? "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  // =========================
  // FORMIK
  // =========================

  const Formik = useFormik({
    initialValues,

    validationSchema: feestructureSchema,

    onSubmit: async (values) => {
      try {
        // --------------------------------
        // Prepare payload
        // --------------------------------

        const payload = {
          ...values,

          // Send taxrate ID instead of complete object
          taxrate: selectedFeestype?.taxrate?._id || values.taxrate || "",

          tax_percent: selectedFeestype?.tax_percent ?? values.tax_percent ?? 0,

          taxtype: selectedFeestype?.taxtype || values.taxtype || "inclusive",

          amount: Number(values.amount),
        };

        console.log("Submitting Fee Structure:", payload);

        // ================================
        // UPDATE
        // ================================

        if (isEdit) {
          console.log("Updating ID:", editId);

          const resp = await axios.patch(
            `${baseUrl}/feestructure/update/${editId}`,
            payload,
          );

          console.log("Update Response:", resp.data);

          setMessage(
            resp?.data?.message || "Fee structure updated successfully",
          );

          setType("success");

          await fetchstudentsfeestructure();

          clearForm();

          setTab(1);

          return;
        }

        // ================================
        // CREATE
        // ================================

        const resp = await axios.post(
          `${baseUrl}/feestructure/create`,
          payload,
        );

        console.log("Create Response:", resp.data);

        setMessage(resp?.data?.message || "Fee structure created successfully");

        setType("success");

        await fetchstudentsfeestructure();

        clearForm();

        setTab(1);
      } catch (error) {
        console.error("Error submitting fee structure:", error);

        setMessage(
          error?.response?.data?.message || "Error submitting fee structure",
        );

        setType("error");
      }
    },
  });

  // =========================
  // RENDER
  // =========================

  return (
    <>
      {/* =========================
          SNACKBAR
      ========================= */}

      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* =========================
            TABS
        ========================= */}

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
          }}
        >
          <Tabs
            value={tab}
            onChange={(event, newValue) => {
              setTab(newValue);
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label={isEdit ? "Edit Feestructure" : "Add New Feestructure"}
            />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* ==================================================
            TAB 0 - CREATE / EDIT
        ================================================== */}

        {tab === 0 && (
          <Box>
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
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr",
                    },
                    gap: 2.5,
                    mt: 3,
                  }}
                >
                  {/* =========================
                      NAME
                  ========================= */}

                  <Box>
                    <TextField
                      fullWidth
                      sx={{
                        marginTop: "10px",
                      }}
                      label="Name"
                      variant="outlined"
                      name="name"
                      value={Formik.values.name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={Formik.touched.name && Boolean(Formik.errors.name)}
                      helperText={Formik.touched.name && Formik.errors.name}
                    />
                  </Box>

                  {/* =========================
                      CODE
                  ========================= */}

                  <Box>
                    <TextField
                      disabled={isEdit}
                      fullWidth
                      sx={{
                        marginTop: "10px",
                      }}
                      label="Code"
                      variant="outlined"
                      name="code"
                      value={Formik.values.code}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={Formik.touched.code && Boolean(Formik.errors.code)}
                      helperText={Formik.touched.code && Formik.errors.code}
                    />
                  </Box>

                  {/* =========================
                      CLASS
                  ========================= */}

                  <Box>
                    <Autocomplete
                      disabled={isEdit}
                      options={attendeeClass}
                      value={selectedClass}
                      isOptionEqualToValue={(option, value) =>
                        option?._id === value?._id
                      }
                      getOptionLabel={(option) =>
                        option?.class_name || option?.name || ""
                      }
                      onChange={(event, newValue) => {
                        setSelectedClass(newValue);

                        Formik.setFieldValue("class", newValue?._id || "");
                      }}
                      onBlur={() => Formik.setFieldTouched("class", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Class"
                          placeholder="Search class..."
                          fullWidth
                          error={
                            Formik.touched.class && Boolean(Formik.errors.class)
                          }
                          helperText={
                            Formik.touched.class && Formik.errors.class
                          }
                        />
                      )}
                    />
                  </Box>

                  {/* =========================
                      FEE TYPE
                  ========================= */}

                  <Box>
                    <Autocomplete
                      options={feestype}
                      value={selectedFeestype}
                      isOptionEqualToValue={(option, value) =>
                        option?._id === value?._id
                      }
                      getOptionLabel={(option) => option?.feestype_name || ""}
                      onChange={(event, newValue) => {
                        setSelectedFeestype(newValue);

                        Formik.setFieldValue("feestype", newValue?._id || "");

                        Formik.setFieldValue(
                          "taxrate",
                          newValue?.taxrate?._id || "",
                        );

                        Formik.setFieldValue(
                          "tax_percent",
                          newValue?.tax_percent ?? 0,
                        );

                        Formik.setFieldValue(
                          "taxtype",
                          newValue?.taxtype || "inclusive",
                        );
                      }}
                      onBlur={() => Formik.setFieldTouched("feestype", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Feestype"
                          placeholder="Search feestype..."
                          fullWidth
                          error={
                            Formik.touched.feestype &&
                            Boolean(Formik.errors.feestype)
                          }
                          helperText={
                            Formik.touched.feestype && Formik.errors.feestype
                          }
                        />
                      )}
                    />
                  </Box>

                  {/* =========================
                      AMOUNT
                  ========================= */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Amount"
                      variant="outlined"
                      name="amount"
                      type="number"
                      value={Formik.values.amount}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                      error={
                        Formik.touched.amount && Boolean(Formik.errors.amount)
                      }
                      helperText={Formik.touched.amount && Formik.errors.amount}
                      inputProps={{
                        min: 0,
                      }}
                    />
                  </Box>
                </Box>

                {/* =========================
                    BUTTONS
                ========================= */}

                <Box
                  sx={{
                    marginTop: "20px",
                  }}
                >
                  <Button
                    type="submit"
                    sx={{
                      marginRight: "10px",
                    }}
                    variant="contained"
                  >
                    {isEdit ? "Update" : "Submit"}
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

        {/* ==================================================
            TAB 1 - VIEW LIST
        ================================================== */}

        {tab === 1 && (
          <Box>
            {/* =========================
                SEARCH
            ========================= */}

            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <TextField
                label="Search"
                size="small"
                value={search}
                onChange={handleSearch}
                placeholder="Search name, code, class, feestype, amount..."
                sx={{
                  "& .MuiInputBase-root": {
                    height: 42,
                    width: {
                      xs: "100%",
                      sm: 500,
                    },
                    fontSize: "14px",
                  },

                  "& .MuiInputLabel-root": {
                    fontSize: "13px",
                  },
                }}
              />

              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Total Fee Structures: {filteredFeestructures.length}
              </Typography>
            </Box>

            {/* =========================
                TABLE
            ========================= */}

            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="fee structure table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Code</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Class</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Feestype</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Amount</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Action</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredFeestructures.length > 0 ? (
                    filteredFeestructures.map((value, i) => (
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
                          {value?.name || ""}
                        </TableCell>

                        {/* CODE */}

                        <TableCell align="right">{value?.code || ""}</TableCell>

                        {/* CLASS */}

                        <TableCell align="right">
                          {value?.class?.class_name || value?.class?.name || ""}
                        </TableCell>

                        {/* FEE TYPE */}

                        <TableCell align="right">
                          {value?.feestype?.feestype_name || ""}
                        </TableCell>

                        {/* AMOUNT */}

                        <TableCell align="right">
                          {value?.amount ?? 0}
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
                      <TableCell colSpan={6} align="center">
                        <Typography
                          sx={{
                            py: 3,
                          }}
                        >
                          {search
                            ? "No fee structures found for your search."
                            : "No fee structures found."}
                        </Typography>
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
