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
  MenuItem,
  Alert,
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
import { journalvoucherSchema } from "../../../yupSchema/journalvoucherSchema";
import JournalvoucherPrint from "./JournalvoucherPrint";

export default function Journalvouchers() {
  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");

  const [journalvouchers, setJournalvouchers] = useState([]);
  const [filteredJournalvouchers, setFilteredJournalvouchers] = useState([]);

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

  // Search
  const [search, setSearch] = useState("");

  const [journalvoucherAmountTotal, setJournalvoucherAmountTotal] = useState(0);

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
      label: `${year}-${year + 1}`,
      value: year,
    };
  });

  const [journalvoucherDetails, setJournalvoucherDetails] = useState([
    {
      amount_type: "",
      accountledger: null,
      account_type: "",
      jv_amount: 0,
      remarks: "",
      isEdit: false,
    },
  ]);

  // =========================================================
  // MESSAGE
  // =========================================================

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // =========================================================
  // INITIAL VALUES
  // =========================================================

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

  // =========================================================
  // CLEAR JOURNAL VOUCHER DETAILS
  // =========================================================

  const clearJournalvoucherDetails = () => {
    setJournalvoucherDetails([
      {
        amount_type: "",
        accountledger: null,
        account_type: "",
        jv_amount: 0,
        remarks: "",
        isEdit: false,
      },
    ]);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/journalvoucher/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e?.response?.data?.message ||
              "Error while deleting journal voucher",
          );

          setType("error");

          console.log("Error deleting journal voucher", e);
        });
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = async (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/journalvoucher/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("journalvoucherCode", data.journalvoucherCode);

        Formik.setFieldValue(
          "jv_date",
          data.jv_date ? dayjs(data.jv_date).format("YYYY-MM-DD") : "",
        );

        Formik.setFieldValue("jv_time", dayjs().format("YYYY-MM-DD HH:mm:ss"));

        Formik.setFieldValue("status", data.status);

        Formik.setFieldValue("remarks", data.remarks);

        Formik.setFieldValue("year", data.year);

        const matchedYear = years.find((s) => s.value === data.year);

        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("dr_amount", data?.dr_amount || 0);

        Formik.setFieldValue("cr_amount", data?.cr_amount || 0);

        setEditId(data._id);

        const editJournalvoucherDetails = (
          data.journalvoucherDetails || []
        ).map((row) => ({
          ...row,
          isEdit: true,
        }));

        setJournalvoucherDetails(editJournalvoucherDetails);

        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = async (id) => {
    console.log("Handle Print is called", id);

    setPrint(true);

    const data = {
      id: id,
    };

    window.open(
      `/school/JournalvoucherPrint?data=${encodeURIComponent(
        JSON.stringify(data),
      )}`,
      "_blank",
    );

    setPrint(false);
  };

  const handleJournalvoucher = async (id) => {
    console.log("Handle Print is called", id);

    setPrint(true);

    window.open(`/school/JournalvoucherPrint?id=${id}`, "_blank");

    setPrint(false);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);

    Formik.resetForm();

    setSelectedAccountledger(null);
    setSelectedAmounttype(null);
    setSelectedYear(null);

    setIsDataValid(true);

    clearJournalvoucherDetails();
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    setEdit(false);
    setEditId(null);

    Formik.resetForm();

    setSelectedAccountledger(null);
    setSelectedAmounttype(null);
    setSelectedYear(null);

    clearJournalvoucherDetails();
  };

  // =========================================================
  // CHECK FORM SUBMISSION
  // =========================================================

  const Formik = useFormik({
    initialValues: initialValues,

    validationSchema: journalvoucherSchema,

    onSubmit: (values) => {
      if (journalvoucherDetails.length === 0) {
        setDataError("Journalvoucher Details is missing");

        setIsDataValid(false);

        return;
      }

      if (Number(values.dr_amount) === 0 || Number(values.cr_amount) === 0) {
        setDataError("Enter the Debit/Credit Amounts");

        setIsDataValid(false);

        return;
      }

      if (Number(values.dr_amount) !== Number(values.cr_amount)) {
        setDataError("Total Debit & Total Credit must be equal");

        setIsDataValid(false);

        return;
      }

      let hasInvalidRow = false;

      for (const item of journalvoucherDetails) {
        if (Number(item.jv_amount) === 0) {
          setDataError("jv_amount must be greater than 0");

          hasInvalidRow = true;

          break;
        }
      }

      if (hasInvalidRow) {
        setIsDataValid(false);

        return;
      }

      setIsDataValid(true);

      const payload = {
        ...values,

        journalvoucherDetails: journalvoucherDetails.map((row) => ({
          accountledger: row?.accountledger?._id,

          amount_type: row?.amount_type?.value || row?.amount_type,

          account_type: row?.account_type?.value || row?.account_type,

          jv_amount: Number(row?.jv_amount) || 0,

          remarks: "",

          year: values.year,
        })),
      };

      // UPDATE
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/journalvoucher/update/${editId}`, payload)
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();

            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e?.response?.data?.message ||
                "Error while updating journal voucher",
            );

            setType("error");

            console.log("Error updating journal voucher", e);
          });
      } else {
        // CREATE
        axios
          .post(`${baseUrl}/journalvoucher/create`, payload)
          .then((resp) => {
            console.log("Response after submitting journal voucher", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();

            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e?.response?.data?.message ||
                "Error while creating journal voucher",
            );

            setType("error");

            console.log("Error creating journal voucher", e);
          });
      }
    },
  });

  // =========================================================
  // FETCH JOURNAL VOUCHERS
  // =========================================================

  const fetchjournalvouchers = () => {
    setLoading(true);

    axios
      .get(`${baseUrl}/journalvoucher/fetch-all`)
      .then((resp) => {
        console.log("Fetching journal vouchers.", resp);

        const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];

        setJournalvouchers(data);
        setFilteredJournalvouchers(data);

        setLoading(false);
      })
      .catch((e) => {
        console.log("Error in fetching journal vouchers", e);

        setJournalvouchers([]);
        setFilteredJournalvouchers([]);

        setLoading(false);
      });
  };

  // =========================================================
  // FETCH EMPLOYEES
  // =========================================================

  const fetchEmployees = async () => {
    try {
      const employeesResponse = await axios.get(
        `${baseUrl}/employee/fetch-with-query`,
      );

      setEmployees(
        Array.isArray(employeesResponse?.data?.data)
          ? employeesResponse.data.data
          : [],
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // =========================================================
  // FETCH ACCOUNT LEDGERS
  // =========================================================

  const fetchAccountledgers = async () => {
    try {
      const accountledgersResponse = await axios.get(
        `${baseUrl}/accountledger/fetch-with-query`,
      );

      setAccountledgers(
        Array.isArray(accountledgersResponse?.data?.data)
          ? accountledgersResponse.data.data
          : [],
      );
    } catch (error) {
      console.error("Error fetching accountledgers:", error);
    }
  };

  // =========================================================
  // FETCH JOURNAL VOUCHER TYPES
  // =========================================================

  const fetchJournalvouchertypes = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/journalvouchertype/fetch-all`,
      );

      setJournalvouchertypes(
        Array.isArray(response?.data?.data) ? response.data.data : [],
      );
    } catch (error) {
      setJournalvouchertypes([]);

      console.error("Error fetching journal voucher types:", error);
    }
  };

  // =========================================================
  // FETCH AMOUNT TYPES
  // =========================================================

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

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    fetchjournalvouchers();
    fetchEmployees();
    fetchAccountledgers();
    fetchAmountTypes();
    fetchJournalvouchertypes();
  }, [message]);

  // =========================================================
  // CALCULATE TOTALS
  // =========================================================

  const calculateTotals = (details = journalvoucherDetails) => {
    const jv_totals = details.reduce(
      (acc, item) => {
        const amountType = item?.amount_type?.value || item?.amount_type;

        if (amountType === "dr") {
          acc.dr_amount += Number(item?.jv_amount || 0);
        }

        if (amountType === "cr") {
          acc.cr_amount += Number(item?.jv_amount || 0);
        }

        return acc;
      },
      {
        dr_amount: 0,
        cr_amount: 0,
      },
    );

    return jv_totals;
  };

  // =========================================================
  // HANDLE DETAIL CHANGE
  // =========================================================

  const handleChange = (index, field, value) => {
    const updated = [...journalvoucherDetails];

    updated[index][field] = value;

    if (field === "accountledger") {
      updated[index].account_type =
        updated[index]?.accountledger?.account_type || "";
    }

    setJournalvoucherDetails(updated);

    // Recalculate totals using UPDATED array
    const jv_totals = calculateTotals(updated);

    Formik.setFieldValue("dr_amount", jv_totals.dr_amount);

    Formik.setFieldValue("cr_amount", jv_totals.cr_amount);
  };

  // =========================================================
  // ADD ROW
  // =========================================================

  const addRow = () => {
    setJournalvoucherDetails([
      ...journalvoucherDetails,
      {
        amount_type: "",
        accountledger: null,
        account_type: "",
        jv_amount: 0,
        remarks: "",
        isEdit: false,
      },
    ]);
  };

  // =========================================================
  // REMOVE ROW
  // =========================================================

  const removeRow = (index) => {
    const updated = journalvoucherDetails.filter((_, i) => i !== index);

    setJournalvoucherDetails(updated);

    const jv_totals = calculateTotals(updated);

    Formik.setFieldValue("dr_amount", jv_totals.dr_amount);

    Formik.setFieldValue("cr_amount", jv_totals.cr_amount);
  };

  // =========================================================
  // GET ACCOUNT LEDGER NAME
  // =========================================================

  const getAccountLedgerName = (accountledger) => {
    if (!accountledger) {
      return "";
    }

    // Populated account ledger
    if (typeof accountledger === "object") {
      const directName =
        accountledger?.accountledger_name ||
        accountledger?.accountLedgerName ||
        accountledger?.name ||
        accountledger?.ledger_name ||
        "";

      if (directName) {
        return directName;
      }

      // If only _id is present, find from accountledgers
      const ledgerId = accountledger?._id;

      const matchedLedger = accountledgers.find(
        (ledger) => String(ledger?._id || "") === String(ledgerId || ""),
      );

      return (
        matchedLedger?.accountledger_name ||
        matchedLedger?.accountLedgerName ||
        matchedLedger?.name ||
        matchedLedger?.ledger_name ||
        ""
      );
    }

    // Account ledger is an ID
    const matchedLedger = accountledgers.find(
      (ledger) => String(ledger?._id || "") === String(accountledger),
    );

    return (
      matchedLedger?.accountledger_name ||
      matchedLedger?.accountLedgerName ||
      matchedLedger?.name ||
      matchedLedger?.ledger_name ||
      ""
    );
  };

  // =========================================================
  // GET ACCOUNT LEDGERS FROM JOURNAL VOUCHER
  // =========================================================

  const getJournalVoucherAccountLedgers = (journalvoucher) => {
    const ledgerNames = [];

    // Direct accountledger
    if (journalvoucher?.accountledger) {
      const name = getAccountLedgerName(journalvoucher.accountledger);

      if (name) {
        ledgerNames.push(name);
      }
    }

    // Account ledgers inside journalvoucherDetails
    if (Array.isArray(journalvoucher?.journalvoucherDetails)) {
      journalvoucher.journalvoucherDetails.forEach((detail) => {
        if (detail?.accountledger) {
          const name = getAccountLedgerName(detail.accountledger);

          if (
            name &&
            !ledgerNames.some(
              (existingName) =>
                existingName.toLowerCase() === name.toLowerCase(),
            )
          ) {
            ledgerNames.push(name);
          }
        }
      });
    }

    return ledgerNames.join(", ");
  };

  // =========================================================
  // DYNAMIC SEARCH FOR TAB 1
  // =========================================================

  useEffect(() => {
    const searchValue = String(search || "")
      .trim()
      .toLowerCase();

    // No search
    if (!searchValue) {
      setFilteredJournalvouchers(journalvouchers);

      return;
    }

    const filtered = journalvouchers.filter((journalvoucher) => {
      // ---------------------------------------------
      // JV CODE
      // ---------------------------------------------

      const jvCode = String(
        journalvoucher?.jv_code || journalvoucher?.journalvoucherCode || "",
      ).toLowerCase();

      // ---------------------------------------------
      // JV DATE
      // ---------------------------------------------

      const rawDate = journalvoucher?.jv_date || "";

      const formattedDate = rawDate
        ? dayjs(rawDate).format("DD-MM-YYYY").toLowerCase()
        : "";

      const formattedDateSlash = rawDate
        ? dayjs(rawDate).format("DD/MM/YYYY").toLowerCase()
        : "";

      const isoDate = rawDate
        ? dayjs(rawDate).format("YYYY-MM-DD").toLowerCase()
        : "";

      // ---------------------------------------------
      // DR AMOUNT
      // ---------------------------------------------

      const drAmount = String(journalvoucher?.dr_amount ?? "").toLowerCase();

      // ---------------------------------------------
      // CR AMOUNT
      // ---------------------------------------------

      const crAmount = String(journalvoucher?.cr_amount ?? "").toLowerCase();

      // ---------------------------------------------
      // ACCOUNT LEDGER
      // ---------------------------------------------

      const accountLedger =
        getJournalVoucherAccountLedgers(journalvoucher).toLowerCase();

      // ---------------------------------------------
      // SEARCH
      // ---------------------------------------------

      return (
        jvCode.includes(searchValue) ||
        formattedDate.includes(searchValue) ||
        formattedDateSlash.includes(searchValue) ||
        isoDate.includes(searchValue) ||
        drAmount.includes(searchValue) ||
        crAmount.includes(searchValue) ||
        accountLedger.includes(searchValue)
      );
    });

    setFilteredJournalvouchers(filtered);
  }, [search, journalvouchers, accountledgers]);

  // =========================================================
  // RENDER
  // =========================================================

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
        {/* =====================================================
            TABS
        ====================================================== */}

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
            <Tab
              label={isEdit ? "Edit Journalvoucher" : "Create Journalvoucher"}
            />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
            CREATE JOURNAL VOUCHER TAB
        ====================================================== */}

        {tab === 0 && (
          <Box>
            <Paper
              sx={{
                padding: "20px",
                margin: "10px",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                {isEdit ? "Edit journalvoucher" : "Add New journalvoucher"}
              </Typography>

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* =====================================================
                    BASIC INFORMATION
                ====================================================== */}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr",
                    },
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {/* JV Code */}

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

                  {/* JV Date */}

                  <Box>
                    <TextField
                      name="jv_date"
                      label="Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
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
                      options={years}
                      getOptionLabel={(option) => option?.label || ""}
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
                          helperText={Formik.touched.year && Formik.errors.year}
                        />
                      )}
                    />
                  </Box>

                  {/* Status */}

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
                      <Typography color="error" variant="caption">
                        {Formik.errors.status}
                      </Typography>
                    )}
                  </Box>

                  {/* Dr Amount */}

                  <Box>
                    <TextField
                      disabled
                      fullWidth
                      label="dr_amount"
                      variant="outlined"
                      name="dr_amount"
                      type="number"
                      value={Formik.values.dr_amount}
                      inputProps={{
                        min: 0,
                      }}
                    />
                  </Box>

                  {/* Cr Amount */}

                  <Box>
                    <TextField
                      disabled
                      fullWidth
                      label="cr_amount"
                      variant="outlined"
                      name="cr_amount"
                      type="number"
                      value={Formik.values.cr_amount}
                      inputProps={{
                        min: 0,
                      }}
                    />
                  </Box>

                  {/* Remarks */}

                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                    }}
                  >
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

                {/* =====================================================
                    JOURNAL VOUCHER DETAILS
                ====================================================== */}

                <Box sx={{ mt: 3 }}>
                  {!isDataValid && (
                    <Alert
                      severity="error"
                      sx={{
                        mt: 2,
                        mb: 2,
                      }}
                    >
                      {dataError}
                    </Alert>
                  )}

                  {journalvoucherDetails.map((row, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "3fr 1fr 1fr 1fr 0.5fr",
                        },
                        gap: 1,
                        mb: 1,
                        alignItems: "center",
                      }}
                    >
                      {/* Amount Type */}

                      <Autocomplete
                        disabled={row.isEdit}
                        options={Array.isArray(amounttypes) ? amounttypes : []}
                        getOptionLabel={(option) => option?.label || ""}
                        value={
                          row?.amount_type &&
                          typeof row.amount_type === "object"
                            ? row.amount_type
                            : amounttypes.find(
                                (option) => option.value === row.amount_type,
                              ) || null
                        }
                        isOptionEqualToValue={(option, value) =>
                          option?.value === value?.value
                        }
                        onChange={(event, newValue) => {
                          setSelectedAmounttype(newValue);

                          handleChange(index, "amount_type", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Amount Type"
                            placeholder="Search Amount Type..."
                            fullWidth
                          />
                        )}
                      />

                      {/* Account Ledger */}

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

                      {/* JV Amount */}

                      <TextField
                        fullWidth
                        label="amount"
                        variant="outlined"
                        name="jv_amount"
                        type="number"
                        value={row.jv_amount}
                        inputProps={{
                          min: 0,
                        }}
                        onChange={(e) => {
                          const value = Math.max(
                            0,
                            Number(e.target.value || 0),
                          );

                          handleChange(index, "jv_amount", value);
                        }}
                      />

                      {/* Delete */}

                      <Box>
                        <Button color="error" onClick={() => removeRow(index)}>
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

                {/* Submit */}

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
        )}

        {/* =====================================================
            VIEW LIST TAB
        ====================================================== */}

        {tab === 1 && (
          <Box>
            {/* =====================================================
                SEARCH + TOTAL
            ====================================================== */}

            <Paper
              sx={{
                p: 2,
                mb: 2,
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
                  label="Search Journal Vouchers"
                  placeholder="Search by JV Code, JV Date, Dr Amount, Cr Amount"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    flex: 1,
                    minWidth: {
                      xs: "100%",
                      md: "450px",
                    },
                  }}
                />

                {search && (
                  <Button variant="outlined" onClick={() => setSearch("")}>
                    Clear
                  </Button>
                )}

                {/* TOTAL NUMBER OF JOURNAL VOUCHERS */}

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    ml: {
                      xs: 0,
                      md: "auto",
                    },
                  }}
                >
                  Total Journal Vouchers:{" "}
                  <strong>{filteredJournalvouchers.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* =====================================================
                JOURNAL VOUCHER TABLE
            ====================================================== */}

            <TableContainer
              component={Paper}
              sx={{
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 1000,
                }}
                aria-label="journal voucher table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>JV Code</TableCell>

                    <TableCell>JV Date</TableCell>

                    {/* <TableCell>Account Ledger</TableCell> */}

                    <TableCell align="right">Dr Amount</TableCell>

                    <TableCell align="right">Cr Amount</TableCell>

                    <TableCell>Remarks</TableCell>

                    <TableCell>Status</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Loading Journal Vouchers...
                      </TableCell>
                    </TableRow>
                  ) : filteredJournalvouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        {search
                          ? "No Journal Vouchers found for the search criteria."
                          : "No Journal Vouchers found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJournalvouchers.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* JV Code */}

                        <TableCell>
                          {value?.jv_code || value?.journalvoucherCode || "-"}
                        </TableCell>

                        {/* JV Date */}

                        <TableCell>
                          {value?.jv_date
                            ? dayjs(value.jv_date).format("DD-MM-YYYY")
                            : "-"}
                        </TableCell>

                        {/* Account Ledger */}

                        {/* <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 500,
                            }}
                          >
                            {getJournalVoucherAccountLedgers(value) || "-"}
                          </Typography>
                        </TableCell> */}

                        {/* Dr Amount */}

                        <TableCell align="right">
                          {value?.dr_amount ?? 0}
                        </TableCell>

                        {/* Cr Amount */}

                        <TableCell align="right">
                          {value?.cr_amount ?? 0}
                        </TableCell>

                        {/* Remarks */}

                        <TableCell>{value?.remarks || "-"}</TableCell>

                        {/* Status */}

                        <TableCell>{value?.status || "-"}</TableCell>

                        {/* Action */}

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1.5,
                              flexWrap: "wrap",
                            }}
                          >
                            {value?.status === "valid" && (
                              <>
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
                              </>
                            )}

                            <Button
                              variant="contained"
                              sx={{
                                background: "green",
                                color: "#fff",
                                "&:hover": {
                                  background: "#006400",
                                },
                              }}
                              onClick={() => handlePrint(value._id)}
                            >
                              Print
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
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
