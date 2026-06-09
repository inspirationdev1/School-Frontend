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
  Select,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";
// import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete, TextField, Box } from '@mui/material';
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { journalvoucherSchema } from "../../../yupSchema/journalvoucherSchema";
import JournalvoucherPrint from "./JournalvoucherPrint";

export default function Journalvouchers() {
  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");
  const [journalvouchers, setJournalvouchers] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [date, setDate] = useState(new Date());

  const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [attendeeClass, setAttendeeClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [section, setSection] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  const [journalvouchertypes, setJournalvouchertypes] = useState([]);
  const [selectedJournalvouchertype, setSelectedJournalvouchertype] =
    useState(null);

  const [accountledgers, setAccountledgers] = useState([]);
  const [selectedAccountledger, setSelectedAccountledger] = useState(null);

  const [amounttypes, setAmounttypes] = useState([]);
  const [selectedAmounttype, setSelectedAmounttype] = useState(null);

  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);

  const [journalvoucherAmountTotal, setJournalvoucherAmountTotal] = useState(0);

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const [journalvoucherDetails, setJournalvoucherDetails] = useState([
    {
      amount_type: "",
      accountledger: null,
      jv_amount: 0,
      remarks: "",
      isEdit: false,
    },
  ]);

  const clearJournalvoucherDetails = () => {
    setJournalvoucherDetails([
      {
        amount_type: "",
        accountledger: null,
        jv_amount: 0,
        remarks: "",
        isEdit: false,
      },
    ]);
    console.log("journalvoucherDetails", journalvoucherDetails);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/journalvoucher/delete/${id}`)
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
  const handleEdit = async (id) => {
    console.log("Handle  Edit is called", id);
    setEdit(true);
    axios
      .get(`${baseUrl}/journalvoucher/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue(
          "journalvoucherCode",
          resp.data.data.journalvoucherCode,
        );
        Formik.setFieldValue(
          "jv_date",
          resp.data.data.jv_date
            ? dayjs(resp.data.data.jv_date).format("YYYY-MM-DD")
            : "",
        );
        Formik.setFieldValue("jv_time", dayjs().format("YYYY-MM-DD HH:mm:ss"));
        Formik.setFieldValue(
          "journalvoucherCode",
          resp.data.data.journalvoucherCode,
        );
        Formik.setFieldValue("status", resp.data.data.status);

        Formik.setFieldValue("remarks", resp.data.data.remarks);
        Formik.setFieldValue("year", resp.data.data.year);
        const matchedYear = years.find((s) => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("dr_amount", resp.data.data?.dr_amount || 0);
        Formik.setFieldValue("cr_amount", resp.data.data?.dr_amount || 0);

        setEditId(resp.data.data._id);

        const editJournalvoucherDetails =
          resp.data.data.journalvoucherDetails.map((row) => ({
            ...row,
            isEdit: true,
          }));

        setJournalvoucherDetails(editJournalvoucherDetails);
        setTab(0); // open Create Journalvoucher tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const handlePrint = async (id) => {
    console.log("Handle  Print is called", id);
    setPrint(true);

    const data = {
      id: id,
    };

    window.open(
      `/school/JournalvoucherPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
      "_blank",
    );

    // window.open(`/school/JournalvoucherPrint?id=${id}`,
    //     '_blank');
    setPrint(false);
  };

  const handleJournalvoucher = async (id) => {
    console.log("Handle  Print is called", id);
    setPrint(true);

    window.open(`/school/JournalvoucherPrint?id=${id}`, "_blank");
    setPrint(false);
  };
  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    // 🔥 reset Autocomplete values
    setSelectedAccountledger(null);
    setSelectedAmounttype(null);
    setIsDataValid(true);
    // 🔥 reset Autocomplete values
    clearJournalvoucherDetails();
  };

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    // 🔥 reset Autocomplete values
    clearJournalvoucherDetails();
  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    journalvoucherCode: "",
    jv_date: "",
    jv_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    status: "valid",
    remarks: "",
    year: "",
    dr_amount: 0,
    cr_amount: 0,
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: journalvoucherSchema,
    onSubmit: (values) => {
      if (journalvoucherDetails.length == 0) {
        setDataError("Journalvoucher Details is missing");
        setIsDataValid(false);
        return;
      }

      if (values.dr_amount == 0 || values.cr_amount == 0) {
        setDataError("Enter the Debit/Credit Amounts");
        setIsDataValid(false);
        return;
      }

      if (values.dr_amount !== values.cr_amount) {
        setDataError("Total Debit & Total Credit must be equal");
        setIsDataValid(false);
        return;
      }

      let hasInvalidRow = false;

      for (const item of journalvoucherDetails) {
        if (item.jv_amount === 0) {
          setDataError("jv_amount must be greater than 0");
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        console.log(item);
      }
      if (hasInvalidRow) {
        setIsDataValid(false);
        return;
      }

      setIsDataValid(true);

      const payload = {
        ...values,
        journalvoucherDetails: journalvoucherDetails.map((row) => ({
          accountledger: row.accountledger._id,
          amount_type: row?.amount_type?.value,
          jv_amount: row?.jv_amount || 0,
          remarks: "",
          // employee: values.employee,
          year: values.year,
        })),
      };
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/journalvoucher/update/${editId}`, payload)
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
          .post(`${baseUrl}/journalvoucher/create`, payload)
          .then((resp) => {
            console.log("Response after submitting admin casting", resp);
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin casting calls", e);
          });
        // Formik.resetForm();
        clearForm();
        setTab(1); // go to View List
      }
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);

  const fetchjournalvouchers = () => {
    axios
      .get(`${baseUrl}/journalvoucher/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setJournalvouchers(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };

  const fetchEmployees = async () => {
    try {
      const employeesResponse = await axios.get(
        `${baseUrl}/employee/fetch-with-query`,
      ); // Fetch based on class
      setEmployees(employeesResponse.data.data);
    } catch (error) {
      console.error("Error fetching employees or checking attendance:", error);
    }
  };

  const fetchAccountledgers = async () => {
    try {
      const accountledgersResponse = await axios.get(
        `${baseUrl}/accountledger/fetch-with-query`,
      ); // Fetch based on class
      setAccountledgers(accountledgersResponse.data.data);
    } catch (error) {
      console.error("Error fetching accountledgers:", error);
    }
  };

  const fetchJournalvouchertypes = async () => {
    try {
      const journalvouchertypesResponse = await axios.get(
        `${baseUrl}/journalvouchertype/fetch-all`,
      ); // Fetch based on Student
      setJournalvouchertypes(journalvouchertypesResponse.data.data);
    } catch (error) {
      setJournalvouchertypes([]);
      console.error("Error fetching employees or checking attendance:", error);
    }
  };

  const fetchAmountTypes = async () => {
    try {
      const amountTypesData = [
        {
          value: "dr",
          label: "Dr",
          meaning: "Debit",
        },
        {
          value: "cr",
          label: "Cr",
          meaning: "Credit",
        },
      ];

      setAmounttypes(amountTypesData);
    } catch (error) {
      console.error("Error fetching amount types:", error);
    }
  };

  useEffect(() => {
    fetchjournalvouchers();
    fetchEmployees();
    fetchAccountledgers();
    fetchAmountTypes();
    fetchJournalvouchertypes();
  }, [message]);

  useEffect(() => {
    console.log("journalvoucherDetails:", journalvoucherDetails);
  }, [journalvoucherDetails]);

  useEffect(() => {
    console.log("isDataValid:", isDataValid);
  }, [isDataValid]);

  const calculateTotals = () => {
    // for (const item of journalvoucherDetails) {

    //     expAmountTotal += item?.jv_amount || 0;
    // }

    const jv_totals = journalvoucherDetails.reduce(
      (acc, item) => {
        if (item?.amount_type?.value === "dr")
          acc.dr_amount += Number(item.jv_amount || 0);
        if (item?.amount_type?.value === "cr")
          acc.cr_amount += Number(item.jv_amount || 0);

        return acc;
      },
      { dr_amount: 0, cr_amount: 0 },
    );

    console.log(jv_totals);
    return jv_totals;
  };

  const handleChange = (index, field, value) => {
    const updated = [...journalvoucherDetails];
    updated[index][field] = value;

    if (field === "accountledger") {
      // updated[index].taxrate = updated[index]?.journalvouchertype?.taxrate;
      // updated[index].taxtype = updated[index]?.journalvouchertype?.taxrate?.taxtype;
      // updated[index].tax_percent = updated[index]?.journalvouchertype?.taxrate?.tax_percent;
    }

    // if (field === "jv_amount") {

    // }

    // const netAmount = updated[index]?.journalvoucherAmount || 0;
    // const tax_percent = updated[index]?.tax_percent || 0;
    // const taxtype = updated[index]?.taxtype || "inclusive";
    // let taxable_amount = netAmount;
    // let tax_amount = 0;
    // if (taxtype === "inclusive") {
    //     taxable_amount = Number((netAmount / (1 + tax_percent / 100)).toFixed(0));
    //     tax_amount = Number((netAmount - taxable_amount).toFixed(0));
    // } else if (taxtype === "exlusive") {
    //     taxable_amount = netAmount;
    //     tax_amount = Number(((taxable_amount * tax_percent) / 100).toFixed(0));
    //     updated[index].journalvoucherAmount = taxable_amount + tax_amount;
    // }

    // updated[index].tax_amount = tax_amount;
    // updated[index].taxable_amount = taxable_amount;

    setJournalvoucherDetails(updated);
  };

  const addRow = () => {
    setJournalvoucherDetails([
      ...journalvoucherDetails,
      {
        amount_type: "",
        accountledger: null,
        jv_amount: 0,
        remarks: "",
        isEdit: false,
      },
    ]);
  };

  const removeRow = (index) => {
    setJournalvoucherDetails(
      journalvoucherDetails.filter((_, i) => i !== index),
    );
    console.log(journalvoucherDetails);
  };

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
            <Tab
              label={isEdit ? "Edit Journalvoucher" : "Create Journalvoucher"}
            />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box>
            {/* Create Journalvoucher */}

            <Box component={"div"} sx={{}}>
              <Paper sx={{ padding: "20px", margin: "10px" }}>
                {isEdit ? (
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "800", textAlign: "center" }}
                  >
                    Edit journalvoucher
                  </Typography>
                ) : (
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "800", textAlign: "center" }}
                  >
                    Add New journalvoucher
                  </Typography>
                )}{" "}
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
                        xs: "1fr", // mobile
                        md: "1fr 1fr", // desktop → 2 columns
                      },
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {/* Journalvoucher Code */}
                    <Box>
                      <TextField
                        disabled
                        fullWidth
                        label="Journalvoucher Code"
                        variant="outlined"
                        name="journalvoucherCode"
                        value={Formik.values.journalvoucherCode}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                      />
                      {Formik.touched.journalvoucherCode &&
                        Formik.errors.journalvoucherCode && (
                          <Typography color="error" variant="caption">
                            {Formik.errors.journalvoucherCode}
                          </Typography>
                        )}
                    </Box>

                    {/* Journalvoucher Date */}
                    <Box>
                      <TextField
                        name="jv_date"
                        label="Date"
                        type="date"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={Formik.values.jv_date}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        disabled={isEdit}
                      />
                      {Formik.touched.jv_date && Formik.errors.jv_date && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.jv_date}
                        </Typography>
                      )}
                    </Box>

                    {/* Academic Year */}
                    <Box>
                      <Autocomplete
                        // disabled={isEdit}
                        options={years}
                        getOptionLabel={(option) => option.label}
                        value={selectedYear}
                        onChange={(event, newValue) => {
                          setSelectedYear(newValue);

                          Formik.setFieldValue(
                            "year",
                            newValue ? newValue.value : "",
                          );
                        }}
                        onBlur={() => Formik.setFieldTouched("year", true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Academic Year"
                            placeholder="Search year..."
                            fullWidth
                            error={
                              Formik.touched.year && Boolean(Formik.errors.year)
                            }
                            helperText={
                              Formik.touched.year && Formik.errors.year
                            }
                          />
                        )}
                      />
                    </Box>

                    {/* Employees */}

                    {/* <Box>
                                            <Autocomplete
                                                disabled={isEdit}
                                                options={employees}
                                                getOptionLabel={(option) => option.employee_name}
                                                value={selectedEmployee}
                                                onChange={(event, newValue) => {
                                                    setSelectedEmployee(newValue);
                                                    Formik.setFieldValue(
                                                        "employee",
                                                        newValue ? newValue._id : ""
                                                    );

                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Employee"
                                                        placeholder="Search employee..."
                                                        fullWidth

                                                    />
                                                )}
                                            />

                                        </Box> */}

                    <Box>
                      <TextField
                        select
                        fullWidth
                        required
                        label="Status"
                        name="status"
                        value={Formik.values.status}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        disabled
                      >
                        <MenuItem value="">Select Status</MenuItem>
                        <MenuItem value="valid">Valid</MenuItem>
                        <MenuItem value="cancel">Cancel</MenuItem>
                      </TextField>
                      {Formik.touched.status && Formik.errors.status && (
                        <p
                          style={{ color: "red", textTransform: "capitalize" }}
                        >
                          {Formik.errors.status}
                        </p>
                      )}
                    </Box>

                    {/* dr_amount */}
                    <Box>
                      <TextField
                        disabled
                        fullWidth
                        label="dr_amount"
                        variant="outlined"
                        name="dr_amount"
                        type="number"
                        value={Formik.values.dr_amount}
                        inputProps={{ min: 0 }} // 👈 prevents negative via arrows
                      />
                    </Box>

                    {/* cr_amount */}
                    <Box>
                      <TextField
                        disabled
                        fullWidth
                        label="cr_amount"
                        variant="outlined"
                        name="cr_amount"
                        type="number"
                        value={Formik.values.cr_amount}
                        inputProps={{ min: 0 }} // 👈 prevents negative via arrows
                      />
                    </Box>

                    {/* Remarks → full width */}
                    <Box sx={{ gridColumn: "1 / -1" }}>
                      <TextField
                        fullWidth
                        label="Remarks"
                        variant="outlined"
                        name="remarks"
                        value={Formik.values.remarks}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        multiline
                        rows={3}
                      />
                      {Formik.touched.remarks && Formik.errors.remarks && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.remarks}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* JournalvoucherDetail */}
                  <Box sx={{ mt: 3 }}>
                    {!isDataValid && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {dataError}
                      </Alert>
                    )}

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                        gap: 1,
                        fontWeight: "bold",
                        mb: 1,
                      }}
                    ></Box>

                    {/* Rows */}
                    {journalvoucherDetails.map((row, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        {/* Amounttype */}
                        <Autocomplete
                          disabled={row.isEdit}
                          options={
                            Array.isArray(amounttypes) ? amounttypes : []
                          }
                          getOptionLabel={(option) => option?.label || ""}
                          value={row.amountype}
                          isOptionEqualToValue={(option, value) =>
                            option?._id === value?._id
                          }
                          onChange={(event, newValue) => {
                            setSelectedAmounttype(newValue);
                            handleChange(index, "amount_type", newValue);
                            const jv_totals = calculateTotals();
                            Formik.setFieldValue(
                              "dr_amount",
                              jv_totals?.dr_amount,
                            );
                            Formik.setFieldValue(
                              "cr_amount",
                              jv_totals?.cr_amount,
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Amountype"
                              placeholder="Search Amounttype..."
                              fullWidth
                            />
                          )}
                        />

                        {/* Accountledgers */}

                        <Autocomplete
                          disabled={row.isEdit}
                          options={
                            Array.isArray(accountledgers) ? accountledgers : []
                          }
                          getOptionLabel={(option) =>
                            option?.accountledger_name || ""
                          }
                          value={row.accountledger}
                          isOptionEqualToValue={(option, value) =>
                            option?._id === value?._id
                          }
                          onChange={(event, newValue) => {
                            setSelectedAccountledger(newValue);
                            handleChange(index, "accountledger", newValue);
                            const jv_totals = calculateTotals();
                            Formik.setFieldValue(
                              "dr_amount",
                              jv_totals?.dr_amount,
                            );
                            Formik.setFieldValue(
                              "cr_amount",
                              jv_totals?.cr_amount,
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Accountledger"
                              placeholder="Search Accountledger..."
                              fullWidth
                            />
                          )}
                        />

                        {/* jv_amount */}
                        <TextField
                          fullWidth
                          label="amount"
                          variant="outlined"
                          name="jv_amount"
                          type="number"
                          value={row.jv_amount}
                          inputProps={{ min: 0 }} // 👈 prevents negative via arrows
                          onChange={(e) => {
                            const value = Math.max(
                              0,
                              Number(e.target.value || 0),
                            );
                            handleChange(index, "jv_amount", value);
                            const jv_totals = calculateTotals();
                            Formik.setFieldValue(
                              "dr_amount",
                              jv_totals?.dr_amount,
                            );
                            Formik.setFieldValue(
                              "cr_amount",
                              jv_totals?.cr_amount,
                            );
                          }}
                        />

                        <Box>
                          <Button
                            color="error"
                            onClick={() => removeRow(index)}
                          >
                            ✕
                          </Button>
                        </Box>
                      </Box>
                    ))}

                    {/* Add Row */}
                    <Button variant="outlined" onClick={addRow}>
                      + Add Journalvoucher
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mt: 4,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button type="submit" variant="contained">
                      {isEdit ? "Update" : "Submit"}
                    </Button>

                    {isEdit && (
                      <Button variant="outlined" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            {/* View List             */}
            <Box>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      {/* <TableCell component="th" scope="row"> journalvoucher</TableCell> */}
                      <TableCell align="right">JV_Code</TableCell>
                      <TableCell align="right">JV Date</TableCell>
                      <TableCell align="right">Dr Amount</TableCell>
                      <TableCell align="right">Cr Amount</TableCell>
                      <TableCell align="right">Remarks</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {journalvouchers.map((value, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {value.jv_code}
                        </TableCell>
                        <TableCell align="right">
                          {dayjs(value.jv_date).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell align="right">{value.dr_amount}</TableCell>
                        <TableCell align="right">{value.cr_amount}</TableCell>
                        <TableCell align="right">{value.remarks}</TableCell>
                        <TableCell align="right">{value.status}</TableCell>
                        <TableCell align="right">
                          {" "}
                          <Box
                            component={"div"}
                            sx={{
                              bottom: 0,
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <Box
                              component="div"
                              sx={{
                                display: "flex",
                                justifyContent: "end",
                                gap: 1.5, // 👈 adds space between buttons
                              }}
                            >
                              {value.status === "valid" && (
                                <>
                                  <Button
                                    variant="contained"
                                    sx={{ background: "red", color: "#fff" }}
                                    onClick={() => handleDelete(value._id)}
                                  >
                                    Delete
                                  </Button>

                                  <Button
                                    variant="contained"
                                    sx={{
                                      background: "gold",
                                      color: "#222222",
                                    }}
                                    onClick={() => handleEdit(value._id)}
                                  >
                                    Edit
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="contained"
                                sx={{ background: "green", color: "#fff" }}
                                onClick={() => handlePrint(value._id)}
                              >
                                Print
                              </Button>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
