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

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { taxrateSchema } from "../../../yupSchema/taxrateSchema";

export default function Taxrates() {
  const [params, setParams] = useState({});
  const [taxrates, setTaxrates] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  const [taxtypes, setTaxtypes] = useState([]);
  const [selectedTaxtype, setSelectedTaxtype] = useState(null);

  // Dynamic search text
  const [searchText, setSearchText] = useState("");

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // Initial form values
  const initialValues = {
    tax_code: "",
    tax_name: "",
    tax_percent: 0,
    taxtype: "",
  };

  // Fetch all tax rates
  const fetchTaxrates = () => {
    axios
      .get(`${baseUrl}/taxrate/fetch-with-query`, { params })
      .then((resp) => {
        setTaxrates(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching taxrates data", e);
      });
  };

  // Fetch tax types
  const fetchTaxtypes = async () => {
    try {
      const taxtypesData = [
        {
          value: "inclusive",
          label: "Inclusive Tax",
          meaning: "Inclusive Tax",
        },
        {
          value: "exclusive",
          label: "Exclusive Tax",
          meaning: "Exclusive Tax",
        },
      ];

      setTaxtypes(taxtypesData);
    } catch (error) {
      console.error("Error fetching tax types:", error);
    }
  };

  // Formik
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: taxrateSchema,

    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/taxrate/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setParams({});
            setTab(1);
          })
          .catch((e) => {
            setMessage(e.response?.data?.message || "Error updating tax rate");
            setType("error");

            console.log("Error updating tax rate", e);
          });
      } else {
        axios
          .post(`${baseUrl}/taxrate/create`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting tax rate", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setParams({});
            setTab(1);
          })
          .catch((e) => {
            setMessage(e.response?.data?.message || "Error creating tax rate");
            setType("error");

            console.log("Error creating tax rate", e);
          });
      }
    },
  });

  // Delete tax rate
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/taxrate/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Error deleting tax rate");
          setType("error");

          console.log("Error deleting tax rate", e);
        });
    }
  };

  // Edit tax rate
  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/taxrate/fetch-single/${id}`)
      .then((resp) => {
        const taxrate = resp.data.data;

        Formik.setFieldValue("tax_code", taxrate?.tax_code || "");
        Formik.setFieldValue("tax_name", taxrate?.tax_name || "");
        Formik.setFieldValue("tax_percent", taxrate?.tax_percent ?? 0);
        Formik.setFieldValue("taxtype", taxrate?.taxtype || "");

        const matchedTaxtype = taxtypes.find(
          (item) => item.value === taxrate?.taxtype,
        );

        setSelectedTaxtype(matchedTaxtype || null);
        setEditId(taxrate?._id);
        setTab(0);
      })
      .catch((e) => {
        console.log("Error fetching tax rate for edit", e);
      });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    setSelectedTaxtype(null);
    Formik.resetForm();
  };

  // Fetch data
  useEffect(() => {
    fetchTaxtypes();
    fetchTaxrates();
  }, [message, params]);

  // Dynamic search handler
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  /*
    Dynamic filtering across:
    1. Tax Rate Code
    2. Tax Rate Name
    3. Percent
    4. Tax Type
  */
  const filteredTaxrates = taxrates.filter((taxrate) => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const taxCode = String(taxrate?.tax_code ?? "").toLowerCase();
    const taxName = String(taxrate?.tax_name ?? "").toLowerCase();
    const taxPercent = String(taxrate?.tax_percent ?? "").toLowerCase();
    const taxType = String(taxrate?.taxtype ?? "").toLowerCase();

    // Also allow searching using the tax type display label
    const taxTypeLabel =
      taxtypes
        .find((item) => item.value === taxrate?.taxtype)
        ?.label?.toLowerCase() || "";

    return (
      taxCode.includes(search) ||
      taxName.includes(search) ||
      taxPercent.includes(search) ||
      taxType.includes(search) ||
      taxTypeLabel.includes(search)
    );
  });

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
        {/* Tabs */}
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
            <Tab label={isEdit ? "Edit Tax Rate" : "Add New Tax Rate"} />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* TAB 0: ADD / EDIT TAX RATE */}
        {tab === 0 && (
          <Box>
            <Paper sx={{ p: 3, m: 1 }}>
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Tax Rate Code */}
                <Box>
                  <TextField
                    disabled={isEdit}
                    fullWidth
                    label="Tax Rate Code"
                    variant="outlined"
                    name="tax_code"
                    value={Formik.values.tax_code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.tax_code && Formik.errors.tax_code && (
                    <Typography
                      sx={{
                        color: "red",
                        textTransform: "capitalize",
                        mt: 0.5,
                      }}
                    >
                      {Formik.errors.tax_code}
                    </Typography>
                  )}
                </Box>

                {/* Tax Rate Name */}
                <Box>
                  <TextField
                    fullWidth
                    label="Tax Rate Name"
                    variant="outlined"
                    name="tax_name"
                    value={Formik.values.tax_name}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.tax_name && Formik.errors.tax_name && (
                    <Typography
                      sx={{
                        color: "red",
                        textTransform: "capitalize",
                        mt: 0.5,
                      }}
                    >
                      {Formik.errors.tax_name}
                    </Typography>
                  )}
                </Box>

                {/* Percentage */}
                <Box>
                  <TextField
                    type="number"
                    fullWidth
                    label="Percentage"
                    name="tax_percent"
                    value={Formik.values.tax_percent}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.tax_percent && Formik.errors.tax_percent && (
                    <Typography
                      sx={{
                        color: "red",
                        mt: 0.5,
                      }}
                    >
                      {Formik.errors.tax_percent}
                    </Typography>
                  )}
                </Box>

                {/* Tax Type */}
                <Box>
                  <Autocomplete
                    options={taxtypes}
                    getOptionLabel={(option) => option?.label || ""}
                    value={selectedTaxtype}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value?.value
                    }
                    onChange={(event, newValue) => {
                      setSelectedTaxtype(newValue);

                      Formik.setFieldValue(
                        "taxtype",
                        newValue ? newValue.value : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("taxtype", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Tax Type"
                        placeholder="Search taxtype..."
                        fullWidth
                        error={
                          Formik.touched.taxtype &&
                          Boolean(Formik.errors.taxtype)
                        }
                        helperText={
                          Formik.touched.taxtype && Formik.errors.taxtype
                        }
                      />
                    )}
                  />
                </Box>

                {/* Buttons */}
                <Box>
                  <Button type="submit" sx={{ mr: 1 }} variant="contained">
                    Submit
                  </Button>

                  {isEdit && (
                    <Button variant="outlined" onClick={cancelEdit}>
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* TAB 1: VIEW TAX RATE LIST */}
        {tab === 1 && (
          <Box>
            {/* Search and Dynamic Count */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: "center",
                mb: 2,
              }}
            >
              {/* Search Field */}
              <TextField
                label="Search Tax Rate"
                placeholder="Code, Name, Percent or Tax Type"
                size="small"
                value={searchText}
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

              {/* Dynamic Total Tax Rates */}
              <Box
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  whiteSpace: "nowrap",
                }}
              >
                Total Tax Rates: {filteredTaxrates.length}
              </Box>
            </Box>

            {/* Tax Rates Table */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="tax rates table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Tax Rate Code</TableCell>
                    <TableCell align="right">Tax Rate Name</TableCell>
                    <TableCell align="right">Percent</TableCell>
                    <TableCell align="right">Tax Type</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredTaxrates.length > 0 ? (
                    filteredTaxrates.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell align="right">{value?.tax_code}</TableCell>

                        <TableCell align="right">{value?.tax_name}</TableCell>

                        <TableCell align="right">
                          {value?.tax_percent}
                        </TableCell>

                        <TableCell align="right">
                          {taxtypes.find(
                            (item) => item.value === value?.taxtype,
                          )?.label || value?.taxtype}
                        </TableCell>

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1.5,
                              flexWrap: "wrap",
                            }}
                          >
                            <Button
                              variant="contained"
                              sx={{
                                background: "red",
                                color: "#fff",
                                "&:hover": {
                                  background: "#c00000",
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
                      <TableCell colSpan={5} align="center">
                        No tax rates found
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
