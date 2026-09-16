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
import { expenseSchema } from "../../../yupSchema/expenseSchema";
import ExpensePrint from "./ExpensePrint";

export default function Expenses() {
  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // Search
  const [search, setSearch] = useState("");

  // Total of filtered expense amounts
  const [expenseAmountTotal, setExpenseAmountTotal] = useState(0);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [loading, setLoading] = useState(true);

  const [expensetypes, setExpensetypes] = useState([]);
  const [selectedExpensetype, setSelectedExpensetype] = useState(null);

  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
      label: `${year}-${year + 1}`,
      value: year,
    };
  });

  const [expenseDetails, setExpenseDetails] = useState([
    {
      expensetype: null,
      quantity: 1,
      expensePrice: 0,
      expenseAmount: 0,
      taxrate: null,
      taxtype: "",
      tax_percent: 0,
      tax_amount: 0,
      taxable_amount: 0,
      remarks: "",
      isEdit: false,
    },
  ]);

  // =========================================================
  // CLEAR EXPENSE DETAILS
  // =========================================================

  const clearExpenseDetails = () => {
    setExpenseDetails([
      {
        expensetype: null,
        quantity: 1,
        expensePrice: 0,
        expenseAmount: 0,
        taxrate: null,
        taxtype: "",
        tax_percent: 0,
        tax_amount: 0,
        taxable_amount: 0,
        remarks: "",
        isEdit: false,
      },
    ]);
  };

  // =========================================================
  // MESSAGE
  // =========================================================

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/expense/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e?.response?.data?.message || "Error while deleting expense",
          );
          setType("error");

          console.log("Error deleting expense", e);
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
      .get(`${baseUrl}/expense/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("expenseCode", data.expenseCode);

        Formik.setFieldValue(
          "expenseDate",
          data.expenseDate ? dayjs(data.expenseDate).format("YYYY-MM-DD") : "",
        );

        Formik.setFieldValue(
          "expenseTime",
          dayjs().format("YYYY-MM-DD HH:mm:ss"),
        );

        Formik.setFieldValue("status", data.status);

        Formik.setFieldValue(
          "employee",
          data?.employee?._id || data?.employee || "",
        );

        setSelectedEmployee(data.employee || null);

        Formik.setFieldValue("remarks", data.remarks || "");

        Formik.setFieldValue("year", data.year);

        const matchedYear = years.find((s) => s.value === data.year);

        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("expenseAmount", data?.expenseAmount || 0);

        setEditId(data._id);

        const editExpenseDetails = (data.expenseDetails || []).map((row) => ({
          ...row,
          isEdit: true,
        }));

        setExpenseDetails(editExpenseDetails);

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
    setPrintId(id);

    const data = {
      id: id,
    };

    window.open(
      `/school/ExpensePrint?data=${encodeURIComponent(JSON.stringify(data))}`,
      "_blank",
    );

    setPrint(false);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);

    Formik.resetForm();

    setSelectedEmployee(null);
    setSelectedExpensetype(null);
    setSelectedYear(null);

    setIsDataValid(true);
    setDataError("");

    clearExpenseDetails();
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    setEdit(false);
    setEditId(null);

    setSelectedEmployee(null);
    setSelectedExpensetype(null);
    setSelectedYear(null);

    setIsDataValid(true);
    setDataError("");

    Formik.resetForm();

    clearExpenseDetails();
  };

  // =========================================================
  // INITIAL VALUES
  // =========================================================

  const initialValues = {
    expenseCode: "",
    expenseDate: "",
    expenseTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    employee: null,
    status: "valid",
    remarks: "",
    year: "",
    expenseAmount: 0,
  };

  // =========================================================
  // FORMIK
  // =========================================================

  const Formik = useFormik({
    initialValues: initialValues,

    validationSchema: expenseSchema,

    onSubmit: (values) => {
      if (expenseDetails.length === 0) {
        setDataError("Expense Details is missing");
        setIsDataValid(false);
        return;
      }

      let hasInvalidRow = false;

      for (const item of expenseDetails) {
        if (Number(item.expenseAmount || 0) === 0) {
          setDataError("expenseAmount must be greater than 0");

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

        expenseDetails: expenseDetails.map((row) => ({
          expensetype: row?.expensetype?._id,

          expensetype_code: row?.expensetype?.expensetype_code,

          invAmount: row?.invAmount,

          quantity: row?.quantity || 1,

          expensePrice: row?.expensePrice || 0,

          expenseAmount: row?.expenseAmount || 0,

          taxrate: row?.taxrate,

          taxtype: row?.taxtype,

          tax_percent: row?.tax_percent,

          tax_amount: row?.tax_amount,

          taxable_amount: row?.taxable_amount,

          remarks: "",

          employee: values.employee,

          year: values.year,
        })),
      };

      // =====================================================
      // UPDATE
      // =====================================================

      if (isEdit) {
        axios
          .patch(`${baseUrl}/expense/update/${editId}`, payload)
          .then((resp) => {
            setMessage(resp.data.message);

            setType("success");

            clearForm();

            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e?.response?.data?.message || "Error while updating expense",
            );

            setType("error");

            console.log("Error editing expense", e);
          });
      }

      // =====================================================
      // CREATE
      // =====================================================
      else {
        axios
          .post(`${baseUrl}/expense/create`, payload)
          .then((resp) => {
            setMessage(resp.data.message);

            setType("success");

            clearForm();

            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e?.response?.data?.message || "Error while creating expense",
            );

            setType("error");

            console.log("Error creating expense", e);
          });
      }
    },
  });

  // =========================================================
  // FETCH EXPENSES
  // =========================================================

  const fetchExpenses = () => {
    setLoading(true);

    axios
      .get(`${baseUrl}/expense/fetch-all`)
      .then((resp) => {
        const data = Array.isArray(resp.data.data) ? resp.data.data : [];

        setExpenses(data);
        setFilteredExpenses(data);
      })
      .catch((e) => {
        console.log("Error fetching expenses", e);

        setExpenses([]);
        setFilteredExpenses([]);
      })
      .finally(() => {
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

      const data = Array.isArray(employeesResponse.data.data)
        ? employeesResponse.data.data
        : [];

      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);

      setEmployees([]);
    }
  };

  // =========================================================
  // FETCH EXPENSE TYPES
  // =========================================================

  const fetchExpensetypes = async () => {
    try {
      const expensetypesResponse = await axios.get(
        `${baseUrl}/expensetype/fetch-all`,
      );

      setExpensetypes(
        Array.isArray(expensetypesResponse.data.data)
          ? expensetypesResponse.data.data
          : [],
      );
    } catch (error) {
      setExpensetypes([]);

      console.error("Error fetching expense types:", error);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchExpenses();
    fetchEmployees();
    fetchExpensetypes();
  }, [message]);

  // =========================================================
  // GET EMPLOYEE NAME
  //
  // IMPORTANT:
  // Handles all of these possibilities:
  //
  // 1. employee = populated object
  // 2. employee = employee ID
  // 3. employee_name
  // 4. name
  // 5. employeeName
  //
  // =========================================================

  const getEmployeeName = (employee) => {
    if (!employee) {
      return "";
    }

    // -----------------------------------------------
    // Employee is populated object
    // -----------------------------------------------

    if (typeof employee === "object") {
      return String(
        employee?.employee_name ||
          employee?.employeeName ||
          employee?.name ||
          employee?.fullName ||
          "",
      );
    }

    // -----------------------------------------------
    // Employee is only an ID
    // -----------------------------------------------

    const employeeId = String(employee);

    const matchedEmployee = employees.find(
      (emp) => String(emp?._id) === employeeId,
    );

    if (!matchedEmployee) {
      return "";
    }

    return String(
      matchedEmployee?.employee_name ||
        matchedEmployee?.employeeName ||
        matchedEmployee?.name ||
        matchedEmployee?.fullName ||
        "",
    );
  };

  // =========================================================
  // DYNAMIC SEARCH
  //
  // Searches:
  //
  // Expense Code
  // Expense Date
  // Expense Amount
  // Employee Name
  // Employee ID
  // Remarks
  // Status
  //
  // =========================================================

  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    // No search
    if (!searchValue) {
      setFilteredExpenses(expenses);
      return;
    }

    const filtered = expenses.filter((expense) => {
      // =============================================
      // EXPENSE CODE
      // =============================================

      const expenseCode = String(expense?.expenseCode || "").toLowerCase();

      // =============================================
      // EXPENSE DATE
      // =============================================

      const rawDate = expense?.expenseDate || "";

      const formattedDate = rawDate ? dayjs(rawDate).format("DD-MM-YYYY") : "";

      const formattedDateSlash = rawDate
        ? dayjs(rawDate).format("DD/MM/YYYY")
        : "";

      const isoDate = rawDate ? dayjs(rawDate).format("YYYY-MM-DD") : "";

      // =============================================
      // EXPENSE AMOUNT
      // =============================================

      const expenseAmount = String(expense?.expenseAmount ?? "");

      // =============================================
      // EMPLOYEE NAME
      //
      // This is the important part.
      // =============================================

      const employeeName = getEmployeeName(expense?.employee);

      // =============================================
      // EMPLOYEE ID
      // =============================================

      const employeeId =
        typeof expense?.employee === "object"
          ? String(expense?.employee?._id || "")
          : String(expense?.employee || "");

      // =============================================
      // REMARKS
      // =============================================

      const remarks = String(expense?.remarks || "");

      // =============================================
      // STATUS
      // =============================================

      const status = String(expense?.status || "");

      // =============================================
      // SEARCH
      // =============================================

      return (
        expenseCode.toLowerCase().includes(searchValue) ||
        formattedDate.toLowerCase().includes(searchValue) ||
        formattedDateSlash.toLowerCase().includes(searchValue) ||
        isoDate.toLowerCase().includes(searchValue) ||
        expenseAmount.toLowerCase().includes(searchValue) ||
        employeeName.toLowerCase().includes(searchValue) ||
        employeeId.toLowerCase().includes(searchValue) ||
        remarks.toLowerCase().includes(searchValue) ||
        status.toLowerCase().includes(searchValue)
      );
    });

    setFilteredExpenses(filtered);
  }, [search, expenses, employees]);

  // =========================================================
  // TOTAL FILTERED EXPENSE AMOUNT
  // =========================================================

  useEffect(() => {
    const total = filteredExpenses.reduce(
      (sum, item) => sum + Number(item?.expenseAmount || 0),
      0,
    );

    setExpenseAmountTotal(total);
  }, [filteredExpenses]);

  // =========================================================
  // CALCULATE DETAIL TOTAL
  // =========================================================

  const calculateTotals = (details = expenseDetails) => {
    return details.reduce(
      (total, item) => total + Number(item?.expenseAmount || 0),
      0,
    );
  };

  // =========================================================
  // HANDLE EXPENSE DETAIL CHANGE
  // =========================================================

  const handleChange = (index, field, value) => {
    const updated = [...expenseDetails];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    if (field === "expensetype") {
      updated[index].taxrate = value?.taxrate || null;

      updated[index].taxtype = value?.taxrate?.taxtype || "";

      updated[index].tax_percent = Number(value?.taxrate?.tax_percent || 0);
    }

    const netAmount = Number(updated[index]?.expensePrice || 0);

    const taxPercent = Number(updated[index]?.tax_percent || 0);

    const taxtype = updated[index]?.taxtype || "inclusive";

    let taxableAmount = netAmount;

    let taxAmount = 0;

    let expenseAmount = netAmount;

    if (taxtype === "inclusive") {
      taxableAmount = Number((netAmount / (1 + taxPercent / 100)).toFixed(0));

      taxAmount = Number((netAmount - taxableAmount).toFixed(0));

      expenseAmount = netAmount;
    } else if (taxtype === "exclusive") {
      taxableAmount = netAmount;

      taxAmount = Number(((taxableAmount * taxPercent) / 100).toFixed(0));

      expenseAmount = taxableAmount + taxAmount;
    }

    updated[index].expenseAmount = expenseAmount;

    updated[index].tax_amount = taxAmount;

    updated[index].taxable_amount = taxableAmount;

    setExpenseDetails(updated);

    const total = calculateTotals(updated);

    setExpenseAmountTotal(total);

    Formik.setFieldValue("expenseAmount", total);
  };

  // =========================================================
  // ADD ROW
  // =========================================================

  const addRow = () => {
    setExpenseDetails([
      ...expenseDetails,
      {
        expensetype: null,
        quantity: 1,
        expensePrice: 0,
        expenseAmount: 0,
        taxrate: null,
        taxtype: "",
        tax_percent: 0,
        tax_amount: 0,
        taxable_amount: 0,
        remarks: "",
        isEdit: false,
      },
    ]);
  };

  // =========================================================
  // REMOVE ROW
  // =========================================================

  const removeRow = (index) => {
    const updated = expenseDetails.filter((_, i) => i !== index);

    setExpenseDetails(updated);

    const total = calculateTotals(updated);

    setExpenseAmountTotal(total);

    Formik.setFieldValue("expenseAmount", total);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* ===================================================
            TABS
        =================================================== */}

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
            <Tab label={isEdit ? "Edit Expense" : "Create Expense"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* ===================================================
            CREATE / EDIT TAB
        =================================================== */}

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
                {isEdit ? "Edit expense" : "Add New expense"}
              </Typography>

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
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {/* Expense Code */}

                  <Box>
                    <TextField
                      disabled
                      fullWidth
                      label="Expense Code"
                      variant="outlined"
                      name="expenseCode"
                      value={Formik.values.expenseCode}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.expenseCode &&
                      Formik.errors.expenseCode && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.expenseCode}
                        </Typography>
                      )}
                  </Box>

                  {/* Expense Date */}

                  <Box>
                    <TextField
                      name="expenseDate"
                      label="Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={Formik.values.expenseDate}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                    />

                    {Formik.touched.expenseDate &&
                      Formik.errors.expenseDate && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.expenseDate}
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Academic Year"
                          placeholder="Search year..."
                          fullWidth
                        />
                      )}
                    />
                  </Box>

                  {/* Employee */}

                  <Box>
                    <Autocomplete
                      disabled={isEdit}
                      options={employees}
                      getOptionLabel={(option) =>
                        option?.employee_name ||
                        option?.employeeName ||
                        option?.name ||
                        option?.fullName ||
                        ""
                      }
                      value={selectedEmployee}
                      isOptionEqualToValue={(option, value) =>
                        option?._id === value?._id
                      }
                      onChange={(event, newValue) => {
                        setSelectedEmployee(newValue);

                        Formik.setFieldValue(
                          "employee",
                          newValue ? newValue._id : "",
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
                      disabled
                    >
                      <MenuItem value="">Select Status</MenuItem>

                      <MenuItem value="valid">Valid</MenuItem>

                      <MenuItem value="cancel">Cancel</MenuItem>
                    </TextField>
                  </Box>

                  {/* Expense Amount */}

                  <Box>
                    <TextField
                      disabled
                      fullWidth
                      label="Expense Amount"
                      variant="outlined"
                      name="expenseAmount"
                      type="number"
                      value={Formik.values.expenseAmount}
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
                  </Box>
                </Box>

                {/* Expense Details */}

                <Box sx={{ mt: 3 }}>
                  {!isDataValid && (
                    <Alert
                      severity="error"
                      sx={{
                        mt: 2,
                      }}
                    >
                      {dataError}
                    </Alert>
                  )}

                  {expenseDetails.map((row, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "3fr 1fr 1fr 0.5fr",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      {/* Expense Type */}

                      <Autocomplete
                        disabled={row.isEdit}
                        options={
                          Array.isArray(expensetypes) ? expensetypes : []
                        }
                        getOptionLabel={(option) =>
                          option?.expensetype_name || ""
                        }
                        value={row.expensetype}
                        isOptionEqualToValue={(option, value) =>
                          option?._id === value?._id
                        }
                        onChange={(event, newValue) => {
                          setSelectedExpensetype(newValue);

                          handleChange(index, "expensetype", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Expensetype"
                            placeholder="Search expensetype..."
                            fullWidth
                          />
                        )}
                      />

                      {/* Expense Price */}

                      <TextField
                        fullWidth
                        label="Expense Price"
                        variant="outlined"
                        type="number"
                        value={row.expensePrice}
                        inputProps={{
                          min: 0,
                        }}
                        onChange={(e) => {
                          const value = Math.max(
                            0,
                            Number(e.target.value || 0),
                          );

                          handleChange(index, "expensePrice", value);
                        }}
                      />

                      {/* Expense Amount */}

                      <TextField
                        disabled
                        fullWidth
                        label="Expense Amount"
                        variant="outlined"
                        value={row.expenseAmount || 0}
                      />

                      {/* Delete */}

                      <Box>
                        <Button color="error" onClick={() => removeRow(index)}>
                          ✕
                        </Button>
                      </Box>
                    </Box>
                  ))}

                  <Button variant="outlined" onClick={addRow}>
                    + Add Expense
                  </Button>
                </Box>

                {/* Buttons */}

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

        {/* ===================================================
            VIEW LIST TAB
        =================================================== */}

        {tab === 1 && (
          <Box>
            {/* =================================================
                SEARCH + TOTAL IN SAME ROW
            ================================================= */}

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
                  width: "100%",
                }}
              >
                {/* Search */}

                <TextField
                  fullWidth
                  label="Search Expenses"
                  placeholder="Search by Expense Code, Date, Amount, Employee, Remarks or Status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    flex: 1,
                  }}
                />

                {/* Clear */}

                {search && (
                  <Button
                    variant="outlined"
                    onClick={() => setSearch("")}
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    Clear
                  </Button>
                )}

                {/* =================================================
                    TOTAL EXPENSES
                ================================================= */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total No Of Expenses:{" "}
                  <strong>{filteredExpenses.length}</strong>
                </Typography>
              </Box>

              {/* Result count */}
            </Paper>

            {/* =================================================
                TABLE
            ================================================= */}

            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 900,
                }}
                aria-label="expense table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Expense Code</TableCell>

                    <TableCell>Expense Date</TableCell>

                    <TableCell>Employee</TableCell>

                    <TableCell align="right">Expense Amount</TableCell>

                    <TableCell>Remarks</TableCell>

                    <TableCell>Status</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Loading expenses...
                      </TableCell>
                    </TableRow>
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {search
                          ? "No expenses found matching your search."
                          : "No expenses found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((value, i) => (
                      <TableRow key={value?._id || i}>
                        {/* Expense Code */}

                        <TableCell>{value?.expenseCode || "-"}</TableCell>

                        {/* Expense Date */}

                        <TableCell>
                          {value?.expenseDate
                            ? dayjs(value.expenseDate).format("DD-MM-YYYY")
                            : "-"}
                        </TableCell>

                        {/* Employee */}

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 500,
                            }}
                          >
                            {getEmployeeName(value?.employee) || "-"}
                          </Typography>
                        </TableCell>

                        {/* Amount */}

                        <TableCell align="right">
                          ₹{" "}
                          {Number(value?.expenseAmount || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </TableCell>

                        {/* Remarks */}

                        <TableCell>{value?.remarks || "-"}</TableCell>

                        {/* Status */}

                        <TableCell>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                            }}
                          >
                            {value?.status || "-"}
                          </Typography>
                        </TableCell>

                        {/* Actions */}

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
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
                                    color: "#222",
                                    "&:hover": {
                                      background: "#e6c200",
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
