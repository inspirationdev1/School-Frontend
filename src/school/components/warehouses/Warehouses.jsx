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
} from "@mui/material";

import { useEffect, useCallback, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

export default function Warehouse() {
  // =========================
  // STATES
  // =========================

  const [params, setParams] = useState({});
  const [warehouses, setWarehouses] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [tab, setTab] = useState(0);

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =========================
  // SNACKBAR
  // =========================

  const resetMessage = () => {
    setMessage("");
  };

  const handleError = (error, defaultMessage) => {
    setMessage(error.response?.data?.message || defaultMessage);
    setType("error");
  };

  // =========================
  // INITIAL VALUES
  // =========================

  const initialValues = {
    warehouse_name: "",
    warehouse_code: "",
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    Formik.resetForm();
    setEdit(false);
    setEditId(null);
  };

  // =========================
  // FETCH WAREHOUSES
  // =========================

  const fetchWarehouses = useCallback(async () => {
    setFetchLoading(true);

    try {
      const resp = await axios.get(`${baseUrl}/warehouse/fetch-with-query`, {
        params,
      });

      setWarehouses(Array.isArray(resp.data.data) ? resp.data.data : []);
    } catch (error) {
      handleError(error, "Error fetching warehouses.");
    } finally {
      setFetchLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // =========================
  // FORMIK
  // =========================

  const Formik = useFormik({
    initialValues,

    validate: (values) => {
      const errors = {};

      if (!values.warehouse_name.trim()) {
        errors.warehouse_name = "Warehouse name is required";
      }

      if (!values.warehouse_code.trim()) {
        errors.warehouse_code = "Warehouse code is required";
      }

      return errors;
    },

    onSubmit: async (values, { resetForm }) => {
      setLoading(true);

      const formData = {
        warehouse_name: values.warehouse_name.trim(),
        warehouse_code: values.warehouse_code.trim(),
      };

      try {
        if (isEdit) {
          // UPDATE WAREHOUSE

          const resp = await axios.patch(
            `${baseUrl}/warehouse/update/${editId}`,
            formData,
          );

          setMessage(resp.data.message || "Warehouse updated successfully.");
          setType("success");

          resetForm();
          setEdit(false);
          setEditId(null);
        } else {
          // CREATE WAREHOUSE

          const resp = await axios.post(
            `${baseUrl}/warehouse/create`,
            formData,
          );

          setMessage(resp.data.message || "Warehouse created successfully.");

          setType("success");
          resetForm();
        }

        setTab(1);
        await fetchWarehouses();
      } catch (error) {
        handleError(error, "Unable to save warehouse.");
      } finally {
        setLoading(false);
      }
    },
  });

  // =========================
  // DELETE WAREHOUSE
  // =========================

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) {
      return;
    }

    setDeletingId(id);

    try {
      const resp = await axios.delete(`${baseUrl}/warehouse/delete/${id}`);

      setMessage(resp.data.message || "Warehouse deleted successfully.");
      setType("success");

      await fetchWarehouses();
    } catch (error) {
      handleError(error, "Unable to delete warehouse.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // EDIT WAREHOUSE
  // =========================

  const handleEdit = async (id) => {
    try {
      const resp = await axios.get(`${baseUrl}/warehouse/fetch-single/${id}`);

      const warehouse = resp.data.data;

      if (!warehouse) {
        throw new Error("Warehouse data not found.");
      }

      Formik.setValues({
        warehouse_name: warehouse.warehouse_name || "",
        warehouse_code: warehouse.warehouse_code || "",
      });

      setEditId(warehouse._id);
      setEdit(true);
      setTab(0);
    } catch (error) {
      handleError(error, "Error fetching warehouse details.");
    }
  };

  // =========================
  // SEARCH WAREHOUSE
  // =========================

  const handleSearch = (e) => {
    const searchValue = e.target.value;

    setParams((prev) => {
      const newParams = { ...prev };

      if (searchValue.trim() !== "") {
        newParams.search = searchValue;
      } else {
        delete newParams.search;
      }

      return newParams;
    });
  };

  // =========================
  // RENDER
  // =========================

  return (
    <>
      {/* SNACKBAR */}

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
            <Tab label={isEdit ? "Edit Warehouse" : "Add New Warehouse"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =========================
            ADD / EDIT WAREHOUSE
        ========================= */}

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
                {/* WAREHOUSE NAME */}

                <TextField
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  id="warehouse-name"
                  label="Warehouse Name"
                  variant="outlined"
                  name="warehouse_name"
                  value={Formik.values.warehouse_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  error={
                    Formik.touched.warehouse_name &&
                    Boolean(Formik.errors.warehouse_name)
                  }
                  helperText={
                    Formik.touched.warehouse_name &&
                    Formik.errors.warehouse_name
                  }
                />

                {/* WAREHOUSE CODE */}

                <TextField
                  disabled={isEdit}
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  id="warehouse-code"
                  label="Warehouse Code"
                  variant="outlined"
                  name="warehouse_code"
                  value={Formik.values.warehouse_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  error={
                    Formik.touched.warehouse_code &&
                    Boolean(Formik.errors.warehouse_code)
                  }
                  helperText={
                    Formik.touched.warehouse_code &&
                    Formik.errors.warehouse_code
                  }
                />

                {/* BUTTONS */}

                <Box sx={{ marginTop: "15px" }}>
                  <Button
                    type="submit"
                    sx={{ marginRight: "10px" }}
                    variant="contained"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : isEdit
                        ? "Update Warehouse"
                        : "Submit"}
                  </Button>

                  {isEdit && (
                    <Button
                      sx={{ marginRight: "10px" }}
                      variant="outlined"
                      onClick={cancelEdit}
                      disabled={loading}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* =========================
            WAREHOUSE LIST
        ========================= */}

        {tab === 1 && (
          <Box>
            {/* SEARCH AND TOTAL */}

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
              <TextField
                label="Search Warehouse..."
                size="small"
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

              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ whiteSpace: "nowrap" }}
              >
                Total Warehouses: {warehouses.length}
              </Typography>
            </Box>

            {/* TABLE */}

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="warehouse table">
                <TableHead>
                  <TableRow>
                    <TableCell>Warehouse Name</TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {fetchLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Loading warehouses...
                      </TableCell>
                    </TableRow>
                  ) : warehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No warehouses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    warehouses.map((value) => (
                      <TableRow
                        key={value._id}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {value.warehouse_name}
                        </TableCell>

                        <TableCell align="right">
                          {value.warehouse_code}
                        </TableCell>

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
                              color="error"
                              disabled={deletingId === value._id}
                              onClick={() => handleDelete(value._id)}
                            >
                              {deletingId === value._id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>

                            {/* EDIT */}

                            <Button
                              variant="contained"
                              sx={{
                                background: "gold",
                                color: "#222222",
                                "&:hover": {
                                  background: "#e6c200",
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
