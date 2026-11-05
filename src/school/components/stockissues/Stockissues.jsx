/* eslint-disable react-hooks/exhaustive-deps */
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Alert,
  IconButton,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import dayjs from "dayjs";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const emptyRow = () => ({
  item: null,
  quantity: 1,
  availableQuantity: 0,
  purchase_price: 0,
  grossAmount: 0,
  remarks: "",
});

const getArray = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getObject = (response) => {
  const data = response?.data;
  return data?.data || data;
};

const getEmployeeLabel = (employee) => {
  if (!employee) return "";

  if (typeof employee === "string") return employee;

  return (
    employee.name ||
    employee.employee_name ||
    employee.empName ||
    employee.first_name ||
    employee.firstName ||
    [
      employee.first_name || employee.firstName,
      employee.last_name || employee.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    employee.employeeCode ||
    employee.empCode ||
    ""
  );
};

const getItemLabel = (item) => {
  if (!item) return "";

  if (typeof item === "string") return item;

  return item.name || item.item_name || item.code || "";
};

const getItemId = (item) => {
  if (!item) return "";
  return typeof item === "string" ? item : item._id;
};

export default function Stockissues() {
  const [stockissues, setStockissues] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);

  const [issueDetails, setIssueDetails] = useState([emptyRow()]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [tab, setTab] = useState(0);

  const [params, setParams] = useState({});

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // FORM INITIAL VALUES
  // --------------------------------------------------

  const initialValues = {
    siCode: "",
    issueDate: dayjs().format("YYYY-MM-DD"),
    employee: "",
    employee_name: "",
    remarks: "",
    status: "valid",
  };

  const Formik = useFormik({
    initialValues,

    onSubmit: async (values) => {
      try {
        setIsDataValid(true);
        setDataError("");

        if (!values.employee) {
          setIsDataValid(false);
          setDataError("Please select an employee");
          return;
        }

        if (!values.issueDate) {
          setIsDataValid(false);
          setDataError("Please select issue date");
          return;
        }

        if (!issueDetails.length) {
          setIsDataValid(false);
          setDataError("Please add at least one item");
          return;
        }

        const selectedIds = issueDetails.map((row) => getItemId(row.item));

        if (selectedIds.some((id) => !id)) {
          setIsDataValid(false);
          setDataError("Please select an item in every row");
          return;
        }

        if (new Set(selectedIds).size !== selectedIds.length) {
          setIsDataValid(false);
          setDataError("Duplicate items are not allowed");
          return;
        }

        for (const row of issueDetails) {
          const quantity = Number(row.quantity);
          const available = Number(row.availableQuantity);

          if (!Number.isFinite(quantity) || quantity <= 0) {
            setIsDataValid(false);
            setDataError("Issue quantity must be greater than zero");
            return;
          }

          // if (quantity > available) {
          //   setIsDataValid(false);
          //   setDataError(
          //     `Insufficient stock for ${getItemLabel(row.item)}. Available: ${available}`,
          //   );
          //   return;
          // }
        }

        const payload = {
          issueDate: values.issueDate,
          employee: values.employee,
          employee_name:
            getEmployeeLabel(selectedEmployee) || values.employee_name,
          remarks: values.remarks || "",
          status: "valid",

          issueDetails: issueDetails.map((row) => ({
            item: getItemId(row.item),
            item_name: getItemLabel(row.item),
            quantity: Number(row.quantity),
            purchase_price: Number(row.purchase_price) || 0,
            grossAmount: Number(row.quantity) * Number(row.purchase_price || 0),
            remarks: row.remarks || "",
          })),
        };

        setLoading(true);

        let response;

        if (isEdit && editId) {
          response = await axios.put(
            `${baseUrl}/stockissue/update/${editId}`,
            payload,
          );
        } else {
          response = await axios.post(`${baseUrl}/stockissue/create`, payload);
        }

        setMessage(
          response.data?.message ||
            (isEdit
              ? "Stock issue updated successfully"
              : "Stock issue created successfully"),
        );

        setType("success");

        clearForm();
        setTab(1);
      } catch (error) {
        setType("error");
        setMessage(
          error.response?.data?.message || "Unable to save stock issue",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // --------------------------------------------------
  // FETCH EMPLOYEES
  // --------------------------------------------------

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${baseUrl}/employee/fetch-with-query`, {
        params: {},
      });

      setEmployees(getArray(response));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // --------------------------------------------------
  // FETCH ITEMS
  // --------------------------------------------------

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${baseUrl}/item/fetch-with-query`, {
        params: {},
      });

      setItems(getArray(response));
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // --------------------------------------------------
  // FETCH STOCK ISSUE LIST
  // --------------------------------------------------

  const fetchStockissues = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/stockissue/fetch-with-query`,
        { params },
      );

      setStockissues(getArray(response));
    } catch (error) {
      console.error("Error fetching stock issues:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchItems();
  }, []);

  useEffect(() => {
    fetchStockissues();
  }, [params, message]);

  // --------------------------------------------------
  // GET AVAILABLE STOCK
  // --------------------------------------------------

  const fetchAvailableStock = async (itemId, excludeIssueId = null) => {
    try {
      if (!itemId) return 0;

      const response = await axios.get(
        `${baseUrl}/stockissue/stock-availability/${itemId}`,
        {
          params: excludeIssueId ? { excludeIssueId } : {},
        },
      );

      const data = getObject(response);

      return Number(data?.availableQuantity || 0);
    } catch (error) {
      console.error("Error fetching available stock:", error);
      throw error;
    }
  };

  // --------------------------------------------------
  // HANDLE ROW CHANGES
  // --------------------------------------------------

  const handleChange = async (index, field, value) => {
    const updated = [...issueDetails];
    const row = { ...updated[index] };

    if (field === "item") {
      row.item = value;
      row.quantity = 1;
      row.purchase_price = Number(value?.purchase_price || 0);
      row.grossAmount = row.purchase_price;
      row.availableQuantity = 0;

      // if (value?._id) {
      //   try {
      //     row.availableQuantity = await fetchAvailableStock(
      //       value._id,
      //       isEdit ? editId : null,
      //     );
      //   } catch (error) {
      //     setType("error");
      //     setMessage(
      //       error.response?.data?.message || "Unable to fetch available stock",
      //     );
      //   }
      // }
    } else {
      row[field] = value;

      if (field === "quantity" || field === "purchase_price") {
        row[field] = value === "" ? "" : Number(value);
      }

      row.grossAmount =
        (Number(row.quantity) || 0) * (Number(row.purchase_price) || 0);
    }

    updated[index] = row;
    setIssueDetails(updated);
  };

  // --------------------------------------------------
  // ADD ROW
  // --------------------------------------------------

  const addRow = () => {
    setIssueDetails([...issueDetails, emptyRow()]);
  };

  // --------------------------------------------------
  // REMOVE ROW
  // --------------------------------------------------

  const removeRow = (index) => {
    if (issueDetails.length === 1) {
      setIssueDetails([emptyRow()]);
      return;
    }

    setIssueDetails(issueDetails.filter((_, i) => i !== index));
  };

  // --------------------------------------------------
  // CLEAR FORM
  // --------------------------------------------------

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    setSelectedEmployee(null);

    Formik.resetForm({
      values: {
        ...initialValues,
        issueDate: dayjs().format("YYYY-MM-DD"),
      },
    });

    setIssueDetails([emptyRow()]);
    setIsDataValid(true);
    setDataError("");
  };

  // --------------------------------------------------
  // EDIT STOCK ISSUE
  // --------------------------------------------------

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/stockissue/fetch-single/${id}`,
      );

      const data = getObject(response);

      if (!data) {
        throw new Error("Stock issue not found");
      }

      setEdit(true);
      setEditId(id);

      const employeeObject =
        data.employee && typeof data.employee === "object"
          ? data.employee
          : employees.find((employee) => employee._id === data.employee) ||
            null;

      setSelectedEmployee(employeeObject);

      Formik.setValues({
        siCode: data.siCode || "",
        issueDate: data.issueDate
          ? dayjs(data.issueDate).format("YYYY-MM-DD")
          : "",
        employee:
          typeof data.employee === "object"
            ? data.employee?._id
            : data.employee || "",
        employee_name: data.employee_name || getEmployeeLabel(employeeObject),
        remarks: data.remarks || "",
        status: data.status || "valid",
      });

      const details = data.issueDetails || [];

      const updatedDetails = await Promise.all(
        details.map(async (row) => {
          const itemObject =
            row.item && typeof row.item === "object"
              ? row.item
              : items.find((item) => item._id === row.item) || null;

          let availableQuantity = 0;

          if (itemObject?._id) {
            availableQuantity = await fetchAvailableStock(itemObject._id, id);
          }

          return {
            item: itemObject,
            quantity: Number(row.quantity || 0),
            availableQuantity,
            purchase_price: Number(row.purchase_price || 0),
            grossAmount: Number(row.grossAmount || 0),
            remarks: row.remarks || "",
          };
        }),
      );

      setIssueDetails(updatedDetails.length ? updatedDetails : [emptyRow()]);

      setTab(0);
      setIsDataValid(true);
    } catch (error) {
      setType("error");
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch stock issue",
      );
    }
  };

  // --------------------------------------------------
  // CANCEL STOCK ISSUE
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this stock issue?",
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${baseUrl}/stockissue/delete/${id}`);

      setType("success");
      setMessage(
        response.data?.message || "Stock issue cancelled successfully",
      );
    } catch (error) {
      setType("error");
      setMessage(
        error.response?.data?.message || "Unable to cancel stock issue",
      );
    }
  };

  // --------------------------------------------------
  // PRINT
  // --------------------------------------------------

  const handlePrint = (id) => {
    const data = { id };

    window.open(
      `/company/StockissuePrint?data=${encodeURIComponent(
        JSON.stringify(data),
      )}`,
      "_blank",
    );
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = (event) => {
    const search = event.target.value;

    setParams((previous) => {
      const updated = { ...previous };

      if (search.trim()) {
        updated.search = search;
      } else {
        delete updated.search;
      }

      return updated;
    });
  };

  // --------------------------------------------------
  // SNACKBAR
  // --------------------------------------------------

  const resetMessage = () => {
    setMessage("");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

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
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
          }}
        >
          <Tabs
            value={tab}
            onChange={(event, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={isEdit ? "Edit Stock Issue" : "Create Stock Issue"} />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* ==========================================
            CREATE / EDIT FORM
        ========================================== */}

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
                  fontWeight: 800,
                  textAlign: "center",
                  mb: 3,
                }}
              >
                {isEdit ? "Edit Stock Issue" : "Create Stock Issue"}
              </Typography>

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* HEADER FIELDS */}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr",
                    },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Issue Code"
                    name="siCode"
                    value={Formik.values.siCode}
                    disabled
                  />

                  <TextField
                    fullWidth
                    label="Issue Date"
                    name="issueDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={Formik.values.issueDate}
                    onChange={Formik.handleChange}
                  />

                  <Autocomplete
                    options={employees}
                    value={selectedEmployee}
                    fullWidth
                    getOptionLabel={getEmployeeLabel}
                    isOptionEqualToValue={(option, value) =>
                      option?._id === value?._id
                    }
                    onChange={(event, value) => {
                      setSelectedEmployee(value);

                      Formik.setFieldValue("employee", value?._id || "");

                      Formik.setFieldValue(
                        "employee_name",
                        getEmployeeLabel(value),
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Employee" required />
                    )}
                  />

                  <TextField
                    fullWidth
                    label="Remarks"
                    name="remarks"
                    value={Formik.values.remarks}
                    onChange={Formik.handleChange}
                  />
                </Box>

                {/* ERROR MESSAGE */}

                {!isDataValid && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {dataError}
                  </Alert>
                )}

                {/* ITEM DETAILS */}

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Issue Details
                </Typography>

                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 950 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sl.No</TableCell>
                        <TableCell>Item</TableCell>
                        {/* <TableCell align="right">Available Qty</TableCell> */}
                        <TableCell align="right">Issue Qty</TableCell>
                        <TableCell align="right">Purchase Price</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Remarks</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {issueDetails.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>

                          <TableCell sx={{ minWidth: 220 }}>
                            <Autocomplete
                              options={items}
                              value={row.item}
                              getOptionLabel={getItemLabel}
                              isOptionEqualToValue={(option, value) =>
                                option?._id === value?._id
                              }
                              onChange={(event, value) =>
                                handleChange(index, "item", value)
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Item"
                                  size="small"
                                />
                              )}
                            />
                          </TableCell>

                          {/* <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "success.main",
                              }}
                            >
                              {row.availableQuantity}
                            </Typography>
                          </TableCell> */}

                          <TableCell sx={{ minWidth: 110 }}>
                            <TextField
                              type="number"
                              size="small"
                              value={row.quantity}
                              onChange={(event) =>
                                handleChange(
                                  index,
                                  "quantity",
                                  event.target.value,
                                )
                              }
                              inputProps={{
                                min: 0.000001,
                                step: "any",
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ minWidth: 120 }}>
                            <TextField
                              type="number"
                              size="small"
                              value={row.purchase_price}
                              onChange={(event) =>
                                handleChange(
                                  index,
                                  "purchase_price",
                                  event.target.value,
                                )
                              }
                              inputProps={{
                                min: 0,
                                step: "any",
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            {(
                              Number(row.quantity || 0) *
                              Number(row.purchase_price || 0)
                            ).toFixed(2)}
                          </TableCell>

                          <TableCell sx={{ minWidth: 150 }}>
                            <TextField
                              size="small"
                              value={row.remarks}
                              onChange={(event) =>
                                handleChange(
                                  index,
                                  "remarks",
                                  event.target.value,
                                )
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => removeRow(index)}
                              title="Remove row"
                            >
                              ✕
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* ADD ROW */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mt: 2,
                  }}
                >
                  <Button variant="outlined" onClick={addRow}>
                    Add Item
                  </Button>
                </Box>

                {/* TOTAL */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total Amount:{" "}
                    {issueDetails
                      .reduce(
                        (total, row) =>
                          total +
                          Number(row.quantity || 0) *
                            Number(row.purchase_price || 0),
                        0,
                      )
                      .toFixed(2)}
                  </Typography>
                </Box>

                {/* FORM BUTTONS */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 4,
                  }}
                >
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading
                      ? "Saving..."
                      : isEdit
                        ? "Update Stock Issue"
                        : "Save Stock Issue"}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={clearForm}
                  >
                    Clear
                  </Button>

                  {isEdit && (
                    <Button
                      type="button"
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        clearForm();
                        setTab(1);
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* ==========================================
            VIEW LIST
        ========================================== */}

        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Stock Issue List
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Search by Issue Code or Employee"
                onChange={handleSearch}
              />
            </Box>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Issue Code</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stockissues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No stock issues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockissues.map((value) => (
                      <TableRow key={value._id}>
                        <TableCell>{value.siCode}</TableCell>

                        <TableCell>
                          {value.issueDate
                            ? dayjs(value.issueDate).format("DD-MM-YYYY")
                            : ""}
                        </TableCell>

                        <TableCell>
                          {value.employee_name ||
                            getEmployeeLabel(value.employee)}
                        </TableCell>

                        <TableCell>{value.remarks}</TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                value.status === "valid"
                                  ? "success.main"
                                  : "error.main",
                              fontWeight: 600,
                            }}
                          >
                            {value.status}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            {value.status === "valid" && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleDelete(value._id)}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  onClick={() => handleEdit(value._id)}
                                >
                                  Edit
                                </Button>
                              </>
                            )}

                            <Button
                              size="small"
                              variant="contained"
                              color="success"
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
