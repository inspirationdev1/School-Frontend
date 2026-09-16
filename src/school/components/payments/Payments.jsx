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
import { paymentSchema } from "../../../yupSchema/paymentSchema";
import PaymentPrint from "./PaymentPrint";

export default function Payments() {
  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");

  const [employeePayment, setEmployeePayment] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [date, setDate] = useState(new Date());

  const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);

  // Search for View List
  const [search, setSearch] = useState("");

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
      label: `${year}-${year + 1}`,
      value: year,
    };
  });

  const [paymentDetails, setPaymentDetails] = useState([
    {
      employee: null,
      expenseId: null,
      expenseAmount: 0,
      paidAmount: 0,
      remarks: "",
      year: "",
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
  // FORM INITIAL VALUES
  // =========================================================

  const initialValues = {
    paymentCode: "",
    paymentDate: "",
    paymentTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    paymentMethod: "",
    status: "valid",
    remarks: "",
    year: "",
  };

  // =========================================================
  // CLEAR PAYMENT DETAILS
  // =========================================================

  const clearPaymentDetails = () => {
    setPaymentDetails([
      {
        employee: null,
        expenseId: null,
        expenseAmount: 0,
        paidAmount: 0,
        remarks: "",
        year: "",
        isEdit: false,
      },
    ]);
  };

  // =========================================================
  // DELETE PAYMENT
  // =========================================================

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/payment/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e?.response?.data?.message || "Error while deleting payment",
          );
          setType("error");

          console.log("Error deleting payment", e);
        });
    }
  };

  // =========================================================
  // EDIT PAYMENT
  // =========================================================

  const handleEdit = async (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/payment/fetch-single/${id}`)
      .then((resp) => {
        const payment = resp.data.data;

        Formik.setFieldValue("paymentCode", payment.paymentCode);

        Formik.setFieldValue(
          "paymentDate",
          payment.paymentDate
            ? dayjs(payment.paymentDate).format("YYYY-MM-DD")
            : "",
        );

        Formik.setFieldValue(
          "paymentTime",
          dayjs().format("YYYY-MM-DD HH:mm:ss"),
        );

        Formik.setFieldValue("paymentMethod", payment.paymentMethod);
        Formik.setFieldValue("status", payment.status);
        Formik.setFieldValue("remarks", payment.remarks);
        Formik.setFieldValue("year", payment.year);

        const matchedYear = years.find((s) => s.value === payment.year);

        setSelectedYear(matchedYear || null);

        setEditId(payment._id);

        const editPaymentDetails = (payment.paymentDetails || []).map(
          (row) => ({
            ...row,
            isEdit: true,
          }),
        );

        setPaymentDetails(editPaymentDetails);

        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = (id) => {
    setPrint(true);

    const url = `${window.location.origin}/school/PaymentPrint?id=${id}`;

    window.open(url, "_blank");

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
    setSelectedExpense(null);
    setSelectedYear(null);

    setIsDataValid(true);

    clearPaymentDetails();
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    setEdit(false);
    setEditId(null);

    Formik.resetForm();

    setSelectedEmployee(null);
    setSelectedExpense(null);
    setSelectedYear(null);

    clearPaymentDetails();
  };

  // =========================================================
  // CHECK DUPLICATE EXPENSE
  // =========================================================

  const hasDuplicateInvoice = (paymentDetails) => {
    const seen = new Set();

    for (const row of paymentDetails) {
      if (!row.expenseId?._id) continue;

      if (seen.has(row.expenseId._id)) {
        return true;
      }

      seen.add(row.expenseId._id);
    }

    return false;
  };

  // =========================================================
  // FORMIK
  // =========================================================

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: paymentSchema,

    onSubmit: (values) => {
      if (paymentDetails.length === 0) {
        setDataError("Payment Details is missing");
        setIsDataValid(false);
        return;
      }

      if (hasDuplicateInvoice(paymentDetails)) {
        setDataError("Duplicate Expense selected. Please remove duplicates.");

        setIsDataValid(false);

        return;
      }

      let hasInvalidRow = false;

      for (const item of paymentDetails) {
        if (Number(item.expenseAmount) === 0 || Number(item.paidAmount) === 0) {
          setDataError("expenseAmount and paidAmount must be greater than 0");

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

        paymentDetails: paymentDetails.map((row) => ({
          employee:
            typeof row.employee === "object" ? row.employee?._id : row.employee,

          expenseId:
            typeof row.expenseId === "object"
              ? row.expenseId?._id
              : row.expenseId,

          expenseCode:
            typeof row.expenseId === "object" ? row.expenseId?.expenseCode : "",

          expenseAmount: row.expenseAmount,
          paidAmount: row.paidAmount,
          remarks: "",
          year: values.year,
        })),
      };

      if (isEdit) {
        axios
          .patch(`${baseUrl}/payment/update/${editId}`, payload)
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();

            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e?.response?.data?.message || "Error while updating payment",
            );

            setType("error");

            console.log("Error updating payment", e);
          });
      } else {
        axios
          .post(`${baseUrl}/payment/create`, payload)
          .then((resp) => {
            console.log("Response after submitting payment", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();

            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e?.response?.data?.message || "Error while creating payment",
            );

            setType("error");

            console.log("Error creating payment", e);
          });
      }
    },
  });

  // =========================================================
  // FETCH PAYMENT LIST
  // =========================================================

  const fetchemployeespayment = () => {
    setLoading(true);

    axios
      .get(`${baseUrl}/payment/fetch-all`)
      .then((resp) => {
        console.log("Fetching payment data.", resp);

        const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];

        setEmployeePayment(data);
        setFilteredPayments(data);

        setLoading(false);
      })
      .catch((e) => {
        console.log("Error in fetching payment data", e);

        setEmployeePayment([]);
        setFilteredPayments([]);

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

      const data = Array.isArray(employeesResponse?.data?.data)
        ? employeesResponse.data.data
        : [];

      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // =========================================================
  // FETCH EMPLOYEE EXPENSES
  // =========================================================

  const fetchExpenses = async () => {
    try {
      if (!selectedEmployee?._id) {
        setExpenses([]);
        return;
      }

      const expensesResponse = await axios.get(
        `${baseUrl}/expense/fetch-employee-expense`,
        {
          params: {
            employee: selectedEmployee?._id,
          },
        },
      );

      setExpenses(
        Array.isArray(expensesResponse?.data?.data)
          ? expensesResponse.data.data
          : [],
      );
    } catch (error) {
      setExpenses([]);

      console.error("Error fetching employee expenses:", error);
    }
  };

  // =========================================================
  // GET EMPLOYEE NAME
  // =========================================================

  const getEmployeeName = (employee) => {
    if (!employee) {
      return "";
    }

    // Employee is populated object
    if (typeof employee === "object") {
      const directName =
        employee?.employee_name ||
        employee?.employeeName ||
        employee?.name ||
        [employee?.firstName, employee?.lastName].filter(Boolean).join(" ");

      if (directName) {
        return directName;
      }

      // If object contains only _id, find it in employees
      const employeeId = employee?._id;

      const matchedEmployee = employees.find(
        (emp) => String(emp?._id || "") === String(employeeId || ""),
      );

      return (
        matchedEmployee?.employee_name ||
        matchedEmployee?.employeeName ||
        matchedEmployee?.name ||
        [matchedEmployee?.firstName, matchedEmployee?.lastName]
          .filter(Boolean)
          .join(" ") ||
        ""
      );
    }

    // Employee is ObjectId/string
    const matchedEmployee = employees.find(
      (emp) => String(emp?._id || "") === String(employee),
    );

    return (
      matchedEmployee?.employee_name ||
      matchedEmployee?.employeeName ||
      matchedEmployee?.name ||
      [matchedEmployee?.firstName, matchedEmployee?.lastName]
        .filter(Boolean)
        .join(" ") ||
      ""
    );
  };

  // =========================================================
  // GET EMPLOYEE NAMES FROM PAYMENT
  // =========================================================
  // Payment may contain:
  // payment.employee
  // OR payment.paymentDetails[].employee

  const getPaymentEmployeeNames = (payment) => {
    const names = [];

    // Direct employee
    if (payment?.employee) {
      const name = getEmployeeName(payment.employee);

      if (name) {
        names.push(name);
      }
    }

    // Employee inside paymentDetails
    if (Array.isArray(payment?.paymentDetails)) {
      payment.paymentDetails.forEach((detail) => {
        if (detail?.employee) {
          const name = getEmployeeName(detail.employee);

          if (
            name &&
            !names.some(
              (existingName) =>
                existingName.toLowerCase() === name.toLowerCase(),
            )
          ) {
            names.push(name);
          }
        }
      });
    }

    return names.join(", ");
  };

  // =========================================================
  // SEARCH PAYMENTS
  // =========================================================

  useEffect(() => {
    const searchValue = String(search || "")
      .trim()
      .toLowerCase();

    if (!searchValue) {
      setFilteredPayments(employeePayment);
      return;
    }

    const filtered = employeePayment.filter((payment) => {
      // Payment Code
      const paymentCode = String(payment?.paymentCode || "").toLowerCase();

      // Payment Date
      const rawDate = payment?.paymentDate || "";

      const formattedDate = rawDate
        ? dayjs(rawDate).format("DD-MM-YYYY").toLowerCase()
        : "";

      const formattedDateSlash = rawDate
        ? dayjs(rawDate).format("DD/MM/YYYY").toLowerCase()
        : "";

      const isoDate = rawDate
        ? dayjs(rawDate).format("YYYY-MM-DD").toLowerCase()
        : "";

      // Status
      const status = String(payment?.status || "").toLowerCase();

      // Payment Method
      const paymentMethod = String(payment?.paymentMethod || "").toLowerCase();

      // Employee
      const employeeName = getPaymentEmployeeNames(payment).toLowerCase();

      return (
        paymentCode.includes(searchValue) ||
        formattedDate.includes(searchValue) ||
        formattedDateSlash.includes(searchValue) ||
        isoDate.includes(searchValue) ||
        status.includes(searchValue) ||
        paymentMethod.includes(searchValue) ||
        employeeName.includes(searchValue)
      );
    });

    setFilteredPayments(filtered);
  }, [search, employeePayment, employees]);

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    fetchemployeespayment();
    fetchEmployees();
  }, [message]);

  // =========================================================
  // FETCH EXPENSES WHEN EMPLOYEE CHANGES
  // =========================================================

  useEffect(() => {
    fetchExpenses();
  }, [selectedEmployee]);

  // =========================================================
  // PAYMENT DETAIL CHANGE
  // =========================================================

  const handleChange = (index, field, value) => {
    const updated = [...paymentDetails];

    updated[index][field] = value;

    // Employee changed
    if (field === "employee") {
      updated[index].expenseId = null;
      updated[index].expenseAmount = 0;
      updated[index].paidAmount = 0;

      setExpenses([]);

      setSelectedExpense(null);

      setSelectedEmployee(value);
    }

    // Expense changed
    if (field === "expenseId") {
      if (value) {
        const invBal =
          (Number(value?.totalExpenseAmount) || 0) -
          (Number(value?.totalPaidAmount) || 0);

        updated[index].expenseAmount = invBal;
        updated[index].paidAmount = 0;
      } else {
        updated[index].expenseAmount = 0;
        updated[index].paidAmount = 0;
      }
    }

    // Paid amount changed
    if (field === "paidAmount") {
      if (
        Number(updated[index].paidAmount) > Number(updated[index].expenseAmount)
      ) {
        updated[index].paidAmount = 0;
      }
    }

    setPaymentDetails(updated);
  };

  // =========================================================
  // ADD PAYMENT DETAIL ROW
  // =========================================================

  const addRow = () => {
    setSelectedEmployee(null);
    setSelectedExpense(null);
    setExpenses([]);

    setPaymentDetails([
      ...paymentDetails,
      {
        employee: null,
        expenseId: null,
        expenseAmount: 0,
        paidAmount: 0,
        remarks: "",
        year: "",
        isEdit: false,
      },
    ]);
  };

  // =========================================================
  // REMOVE PAYMENT DETAIL ROW
  // =========================================================

  const removeRow = (index) => {
    setPaymentDetails(paymentDetails.filter((_, i) => i !== index));
  };

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
            <Tab label={isEdit ? "Edit Payment" : "Create Payment"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
            CREATE PAYMENT TAB
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
                {isEdit ? "Edit payment" : "Add New payment"}
              </Typography>

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* =====================================================
                    PAYMENT BASIC INFORMATION
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
                  {/* Payment Code */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Payment Code"
                      variant="outlined"
                      name="paymentCode"
                      value={Formik.values.paymentCode}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled
                    />

                    {Formik.touched.paymentCode &&
                      Formik.errors.paymentCode && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.paymentCode}
                        </Typography>
                      )}
                  </Box>

                  {/* Payment Date */}

                  <Box>
                    <TextField
                      name="paymentDate"
                      label="Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={Formik.values.paymentDate}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                    />

                    {Formik.touched.paymentDate &&
                      Formik.errors.paymentDate && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.paymentDate}
                        </Typography>
                      )}
                  </Box>

                  {/* Academic Year */}

                  <Box>
                    <Autocomplete
                      disabled={isEdit}
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

                  {/* Payment Method */}

                  <Box>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Payment Method"
                      name="paymentMethod"
                      value={Formik.values.paymentMethod}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                    >
                      <MenuItem value="">Select Payment Method</MenuItem>

                      <MenuItem value="cash">Cash</MenuItem>

                      <MenuItem value="bank">Bank</MenuItem>

                      <MenuItem value="upi">UPI</MenuItem>
                    </TextField>

                    {Formik.touched.paymentMethod &&
                      Formik.errors.paymentMethod && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.paymentMethod}
                        </Typography>
                      )}
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
                    PAYMENT DETAILS
                ====================================================== */}

                <Box sx={{ mt: 3 }}>
                  {!isDataValid && (
                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                      {dataError}
                    </Alert>
                  )}

                  {paymentDetails.map((row, index) => (
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
                      {/* Employee */}

                      <Box>
                        <Autocomplete
                          disabled={row.isEdit}
                          options={employees}
                          getOptionLabel={(option) =>
                            option?.employee_name ||
                            option?.employeeName ||
                            option?.name ||
                            ""
                          }
                          isOptionEqualToValue={(option, value) =>
                            option?._id === value?._id
                          }
                          value={row.employee}
                          onChange={(event, newValue) => {
                            handleChange(index, "employee", newValue);
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

                      {/* Expense */}

                      <Autocomplete
                        disabled={row.isEdit}
                        options={Array.isArray(expenses) ? expenses : []}
                        getOptionLabel={(option) => option?.expenseCode || ""}
                        value={row.expenseId}
                        isOptionEqualToValue={(option, value) =>
                          option?._id === value?._id
                        }
                        onChange={(event, newValue) => {
                          setSelectedExpense(newValue);

                          handleChange(index, "expenseId", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Expense"
                            placeholder="Search Expense..."
                            fullWidth
                          />
                        )}
                      />

                      {/* Expense Amount */}

                      <Box>
                        <TextField
                          fullWidth
                          label="expenseAmount"
                          variant="outlined"
                          name="expenseAmount"
                          type="number"
                          value={row.expenseAmount}
                          onChange={(e) =>
                            handleChange(index, "expenseAmount", e.target.value)
                          }
                          disabled
                        />
                      </Box>

                      {/* Paid Amount */}

                      <TextField
                        fullWidth
                        label="paidAmount"
                        variant="outlined"
                        name="paidAmount"
                        type="number"
                        value={row.paidAmount}
                        inputProps={{
                          min: 0,
                        }}
                        onChange={(e) => {
                          const value = Math.max(
                            0,
                            Number(e.target.value || 0),
                          );

                          handleChange(index, "paidAmount", value);
                        }}
                        disabled={row.isEdit}
                      />

                      {/* Delete Row */}

                      <Box>
                        <Button color="error" onClick={() => removeRow(index)}>
                          ✕
                        </Button>
                      </Box>
                    </Box>
                  ))}

                  {/* Add Row */}

                  <Button variant="outlined" onClick={addRow}>
                    + Add Expense
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

        {/* =========================================================
            VIEW LIST TAB
        ========================================================= */}

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
                  label="Search Payments"
                  placeholder="Search by Payment Code, Date, Status, Payment Method or Employee..."
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

                {/* TOTAL NUMBER OF PAYMENTS */}

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
                  Total Payments: <strong>{filteredPayments.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* =====================================================
                PAYMENT TABLE
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
                aria-label="payment table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Payment Code</TableCell>

                    <TableCell>Payment Date</TableCell>

                    {/* <TableCell>Employee</TableCell> */}

                    <TableCell>Status</TableCell>

                    <TableCell>Payment Method</TableCell>

                    <TableCell>Remarks</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Loading payments...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {search
                          ? "No payments found for the search criteria."
                          : "No payments found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* Payment Code */}

                        <TableCell>{value?.paymentCode || "-"}</TableCell>

                        {/* Payment Date */}

                        <TableCell>
                          {value?.paymentDate
                            ? dayjs(value.paymentDate).format("DD-MM-YYYY")
                            : "-"}
                        </TableCell>

                        {/* Employee */}

                        {/* <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 500,
                            }}
                          >
                            {getPaymentEmployeeNames(value) || "-"}
                          </Typography>
                        </TableCell> */}

                        {/* Status */}

                        <TableCell>{value?.status || "-"}</TableCell>

                        {/* Payment Method */}

                        <TableCell
                          sx={{
                            textTransform: "uppercase",
                          }}
                        >
                          {value?.paymentMethod || "-"}
                        </TableCell>

                        {/* Remarks */}

                        <TableCell>{value?.remarks || "-"}</TableCell>

                        {/* Actions */}

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
