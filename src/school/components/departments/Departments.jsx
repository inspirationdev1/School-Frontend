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

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { departmentSchema } from "../../../yupSchema/departmentSchema";

export default function Department() {
  const [studentDepartment, setStudentDepartment] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  // Search
  const [search, setSearch] = useState("");

  // Message
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // --------------------------------------------------
  // DELETE DEPARTMENT
  // --------------------------------------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/department/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Error deleting department");

          setType("error");

          console.log("Error, deleting department", e);
        });
    }
  };

  // --------------------------------------------------
  // EDIT DEPARTMENT
  // --------------------------------------------------
  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/department/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("department_name", data?.department_name || "");

        Formik.setFieldValue("department_code", data?.department_code || "");

        setEditId(data?._id);

        // Open Edit Department tab
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);

        setMessage(
          e.response?.data?.message || "Error fetching department details",
        );

        setType("error");
      });
  };

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------
  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
  };

  // --------------------------------------------------
  // FORMIK
  // --------------------------------------------------
  const initialValues = {
    department_name: "",
    department_code: "",
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: departmentSchema,

    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/department/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();

            // Go to View List
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error updating department",
            );

            setType("error");

            console.log("Error, edit department submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/department/create`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting department", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();

            // Go to View List
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error creating department",
            );

            setType("error");

            console.log("Error, response department create", e);
          });
      }
    },
  });

  // --------------------------------------------------
  // FETCH DEPARTMENTS
  // --------------------------------------------------
  const fetchstudentsdepartment = () => {
    axios
      .get(`${baseUrl}/department/fetch-all`)
      .then((resp) => {
        console.log("Fetching department data", resp);

        const data = Array.isArray(resp.data.data) ? resp.data.data : [];

        setStudentDepartment(data);
        setFilteredDepartments(data);
      })
      .catch((e) => {
        console.log("Error in fetching department data", e);

        setStudentDepartment([]);
        setFilteredDepartments([]);
      });
  };

  // --------------------------------------------------
  // FETCH DATA AFTER CRUD
  // --------------------------------------------------
  useEffect(() => {
    fetchstudentsdepartment();
  }, [message]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // --------------------------------------------------
  // DYNAMIC SEARCH FILTER
  // --------------------------------------------------
  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    // Show all departments when search is empty
    if (!searchValue) {
      setFilteredDepartments(studentDepartment);
      return;
    }

    const filtered = studentDepartment.filter((department) => {
      const departmentName = String(
        department?.department_name || "",
      ).toLowerCase();

      const departmentCode = String(
        department?.department_code || "",
      ).toLowerCase();

      return (
        departmentName.includes(searchValue) ||
        departmentCode.includes(searchValue)
      );
    });

    setFilteredDepartments(filtered);
  }, [search, studentDepartment]);

  // --------------------------------------------------
  // UI
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
        {/* ==================================================
            TABS
        ================================================== */}
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
            <Tab label={isEdit ? "Edit Department" : "Add New Department"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* ==================================================
            TAB 0 - ADD / EDIT DEPARTMENT
        ================================================== */}
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
                {/* DEPARTMENT NAME */}
                <TextField
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Department Name"
                  variant="outlined"
                  name="department_name"
                  value={Formik.values.department_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.department_name &&
                  Formik.errors.department_name && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.department_name}
                    </p>
                  )}

                {/* DEPARTMENT CODE */}
                <TextField
                  disabled={isEdit}
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Department Code"
                  variant="outlined"
                  name="department_code"
                  value={Formik.values.department_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.department_code &&
                  Formik.errors.department_code && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.department_code}
                    </p>
                  )}

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

        {/* ==================================================
            TAB 1 - VIEW LIST
        ================================================== */}
        {tab === 1 && (
          <Box>
            {/* SEARCH + TOTAL */}
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
                  label="Search Departments"
                  placeholder="Search by Department Name or Code..."
                  size="small"
                  value={search}
                  onChange={handleSearch}
                  sx={{
                    flex: 1,
                    minWidth: {
                      xs: "100%",
                      sm: "400px",
                    },

                    "& .MuiInputBase-root": {
                      height: 42,
                      fontSize: "14px",
                    },
                  }}
                />

                {/* CLEAR BUTTON */}
                {search && (
                  <Button
                    variant="outlined"
                    onClick={() => setSearch("")}
                    sx={{
                      height: 42,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Clear
                  </Button>
                )}

                {/* TOTAL DEPARTMENTS */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Departments:{" "}
                  <strong>{filteredDepartments.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* TABLE */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="department table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Department Name
                    </TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredDepartments.length > 0 ? (
                    filteredDepartments.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* DEPARTMENT NAME */}
                        <TableCell component="th" scope="row">
                          {value?.department_name}
                        </TableCell>

                        {/* DEPARTMENT CODE */}
                        <TableCell align="right">
                          {value?.department_code}
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
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography
                          sx={{
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          {search
                            ? "No Departments found matching your search."
                            : "No Departments available."}
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
