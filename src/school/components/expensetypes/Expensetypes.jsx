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
import { expensetypeSchema } from "../../../yupSchema/expensetypeSchema";

export default function Expensetypes() {
  const [studentExpensetype, setStudentExpensetype] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  const [taxrates, setTaxrates] = useState([]);
  const [selectedTaxrate, setSelectedTaxrate] = useState(null);

  const [accountledgers, setAccountledgers] = useState([]);
  const [selectedAccountledger, setSelectedAccountledger] = useState(null);

  // Dynamic search
  const [searchText, setSearchText] = useState("");

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // DELETE EXPENSETYPE
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/expensetype/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Error deleting expensetype");
          setType("error");
          console.log("Error, deleting", e);
        });
    }
  };

  // EDIT EXPENSETYPE
  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/expensetype/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("expensetype_name", data?.expensetype_name || "");

        Formik.setFieldValue("expensetype_code", data?.expensetype_code || "");

        Formik.setFieldValue("taxrate", data?.taxrate?._id || "");

        Formik.setFieldValue("tax_percent", data?.tax_percent || "");

        Formik.setFieldValue("taxtype", data?.taxtype || "");

        setSelectedTaxrate(data?.taxrate || null);

        setEditId(data?._id);
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  // CANCEL EDIT
  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    setSelectedTaxrate(null);
    setSelectedAccountledger(null);
    Formik.resetForm();
  };

  // INITIAL VALUES
  const initialValues = {
    expensetype_name: "",
    expensetype_code: "",
    taxrate: "",
  };

  // FORMIK
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: expensetypeSchema,

    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/expensetype/update/${editId}`, {
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
              e.response?.data?.message || "Error updating expensetype",
            );
            setType("error");

            console.log("Error, edit expensetype submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/expensetype/create`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting expensetype", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error creating expensetype",
            );
            setType("error");

            console.log("Error, response expensetype create", e);
          });
      }
    },
  });

  // FETCH ALL EXPENSETYPES
  const fetchstudentsexpensetype = () => {
    axios
      .get(`${baseUrl}/expensetype/fetch-all`)
      .then((resp) => {
        console.log("Fetching expensetype data", resp);

        setStudentExpensetype(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching expensetype data", e);
      });
  };

  // FETCH TAX RATES
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

  // FETCH DATA
  useEffect(() => {
    fetchTaxrates();
    fetchstudentsexpensetype();
  }, [message]);

  // SEARCH HANDLER
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  /*
    DYNAMIC SEARCH

    Searches across:
    1. Expensetype Name
    2. Expensetype Code
    3. Taxrate

    Taxrate search supports:
    - Tax rate name
    - Tax rate code
    - Tax percentage
    - Tax type
  */
  const filteredExpensetypes = studentExpensetype.filter((expenseType) => {
    const search = searchText.trim().toLowerCase();

    // If search field is empty, show everything
    if (!search) {
      return true;
    }

    const expenseName = String(
      expenseType?.expensetype_name ?? "",
    ).toLowerCase();

    const expenseCode = String(
      expenseType?.expensetype_code ?? "",
    ).toLowerCase();

    const taxRateName = String(
      expenseType?.taxrate?.tax_name ?? "",
    ).toLowerCase();

    const taxRateCode = String(
      expenseType?.taxrate?.tax_code ?? "",
    ).toLowerCase();

    const taxRatePercent = String(
      expenseType?.taxrate?.tax_percent ?? "",
    ).toLowerCase();

    const taxRateType = String(
      expenseType?.taxrate?.taxtype ?? "",
    ).toLowerCase();

    return (
      expenseName.includes(search) ||
      expenseCode.includes(search) ||
      taxRateName.includes(search) ||
      taxRateCode.includes(search) ||
      taxRatePercent.includes(search) ||
      taxRateType.includes(search)
    );
  });

  return (
    <>
      {/* MESSAGE */}
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* TABS */}
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
            <Tab label={isEdit ? "Edit Expensetype" : "Add New Expensetype"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* TAB 0 - CREATE / EDIT */}
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
                {/* EXPENSETYPE NAME */}
                <TextField
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Expensetype Name"
                  variant="outlined"
                  name="expensetype_name"
                  value={Formik.values.expensetype_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.expensetype_name &&
                  Formik.errors.expensetype_name && (
                    <Typography
                      sx={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.expensetype_name}
                    </Typography>
                  )}

                {/* EXPENSETYPE CODE */}
                <TextField
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Expensetype Code"
                  variant="outlined"
                  name="expensetype_code"
                  value={Formik.values.expensetype_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.expensetype_code &&
                  Formik.errors.expensetype_code && (
                    <Typography
                      sx={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.expensetype_code}
                    </Typography>
                  )}

                {/* TAXRATE */}
                <Box>
                  <Autocomplete
                    sx={{
                      marginTop: "10px",
                    }}
                    options={taxrates}
                    getOptionLabel={(option) => option?.tax_name || ""}
                    value={selectedTaxrate}
                    isOptionEqualToValue={(option, value) =>
                      option?._id === value?._id
                    }
                    onChange={(event, newValue) => {
                      setSelectedTaxrate(newValue);

                      Formik.setFieldValue(
                        "taxrate",
                        newValue ? newValue._id : "",
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

                {/* BUTTONS */}
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

        {/* TAB 1 - VIEW LIST */}
        {tab === 1 && (
          <Box>
            {/* SEARCH + TOTAL */}
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
              {/* SEARCH FIELD */}
              <TextField
                label="Search Expensetype"
                placeholder="Name, Code or Taxrate"
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

              {/* TOTAL COUNT */}
              <Box
              sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
              >Total Expense Types: {filteredExpensetypes.length}</Box>
            </Box>

            {/* TABLE */}
            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="expensetype table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Expensetype Name
                    </TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Taxrate</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredExpensetypes.length > 0 ? (
                    filteredExpensetypes.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* EXPENSETYPE NAME */}
                        <TableCell component="th" scope="row">
                          {value?.expensetype_name}
                        </TableCell>

                        {/* CODE */}
                        <TableCell align="right">
                          {value?.expensetype_code}
                        </TableCell>

                        {/* TAXRATE */}
                        <TableCell align="right">
                          {value?.taxrate?.tax_name
                            ? `${value.taxrate.tax_name} - ${
                                value?.taxrate?.tax_percent ?? 0
                              } %`
                            : "0 %"}
                        </TableCell>

                        {/* ACTION */}
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
                      <TableCell colSpan={4} align="center">
                        No expensetypes found
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
