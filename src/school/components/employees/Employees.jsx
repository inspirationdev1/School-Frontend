/* eslint-disable react-hooks/exhaustive-deps */

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  CardMedia,
  Paper,
  TextField,
  Typography,
  Tabs,
  Tab,
  Autocomplete,
  Grid,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
} from "@mui/material";

import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { employeeSchema } from "../../../yupSchema/employeeSchema";
import dayjs from "dayjs";

export default function Employees() {
  const [employees, setemployees] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [tab, setTab] = useState(0);

  const [selectedYear, setSelectedYear] = useState(null);

  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({
    value: "active",
    label: "Active",
    meaning: "Currently working",
  });

  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const fileInputRef = useRef(null);

  // -------------------------------------------------------
  // Academic Years
  // -------------------------------------------------------

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
      label: `${year}-${year + 1}`,
      value: year,
    };
  });

  // -------------------------------------------------------
  // Status
  // -------------------------------------------------------

  const fetchStatuses = async () => {
    try {
      const employeeStatuses = [
        {
          value: "active",
          label: "Active",
          meaning: "Currently working",
        },
        {
          value: "inactive",
          label: "Inactive",
          meaning: "Temporarily inactive",
        },
      ];

      setStatuses(employeeStatuses);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  // -------------------------------------------------------
  // Image Upload
  // -------------------------------------------------------

  const addImage = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setImageUrl(URL.createObjectURL(selectedFile));
    setFile(selectedFile);

    console.log("Selected Employee Image:", selectedFile);
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFile(null);
    setImageUrl(null);
  };

  // -------------------------------------------------------
  // View Uploaded Image
  // -------------------------------------------------------

  const viewUploadFile = (fileName) => {
    if (!fileName) {
      setMessage("Employee image is not available.");
      setType("error");
      return;
    }

    window.open(fileName, "_blank", "noopener,noreferrer");
  };

  // -------------------------------------------------------
  // Calculate Age
  // -------------------------------------------------------

  const calculateAge = (dob) => {
    if (!dob) {
      return "";
    }

    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // -------------------------------------------------------
  // Initial Form Values
  // -------------------------------------------------------

  const initialValues = {
    email: "",
    employee_name: "",
    employee_code: "",
    qualification: "",
    gender: "",
    age: "",
    password: "",
    year: "",
    dOBDate: "",
    joinDate: "",
    phoneno: "",
    status: "active",
  };

  // -------------------------------------------------------
  // Reset Form
  // -------------------------------------------------------

  const resetEmployeeForm = () => {
    Formik.resetForm({
      values: {
        email: "",
        employee_name: "",
        employee_code: "",
        qualification: "",
        gender: "",
        age: "",
        password: "",
        year: "",
        dOBDate: "",
        joinDate: "",
        phoneno: "",
        status: "active",
      },
    });

    setSelectedYear(null);

    setSelectedStatus({
      value: "active",
      label: "Active",
      meaning: "Currently working",
    });

    handleClearFile();
  };

  // -------------------------------------------------------
  // Cancel Edit
  // -------------------------------------------------------

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    resetEmployeeForm();
  };

  // -------------------------------------------------------
  // Delete Employee
  // -------------------------------------------------------

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete?")) {
      return;
    }

    axios
      .delete(`${baseUrl}/employee/delete/${id}`)
      .then((resp) => {
        setMessage(resp.data?.message || "Employee deleted successfully.");

        setType("success");

        // Refresh list immediately
        fetchemployees();
      })
      .catch((e) => {
        console.error("Error deleting employee:", e.response?.data || e);

        setMessage(
          e.response?.data?.message ||
            e.response?.data?.error ||
            "Failed to delete employee.",
        );

        setType("error");
      });
  };

  // -------------------------------------------------------
  // Edit Employee
  // -------------------------------------------------------

  const handleEdit = (id) => {
    console.log("Handle Edit called:", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/employee/fetch-single/${id}`)
      .then((resp) => {
        const employee = resp.data?.data;

        if (!employee) {
          setMessage("Employee data not found.");
          setType("error");
          return;
        }

        console.log("Employee data for edit:", employee);

        Formik.setFieldValue("email", employee.email || "");

        Formik.setFieldValue("employee_name", employee.employee_name || "");

        Formik.setFieldValue("employee_code", employee.employee_code || "");

        Formik.setFieldValue("qualification", employee.qualification || "");

        Formik.setFieldValue("gender", employee.gender || "");

        Formik.setFieldValue("password", employee.password || "");

        Formik.setFieldValue("year", employee.year || "");

        const matchedYear = years.find((s) => s.value === employee.year);

        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("dOBDate", employee.dOBDate?.split("T")[0] || "");

        Formik.setFieldValue(
          "joinDate",
          employee.joinDate?.split("T")[0] || "",
        );

        const age = calculateAge(employee.dOBDate?.split("T")[0] || "");

        Formik.setFieldValue("age", age);

        Formik.setFieldValue("phoneno", employee.phoneno || "");

        // Status
        const employeeStatus = employee.status || "active";

        Formik.setFieldValue("status", employeeStatus);

        const matchedStatus = statuses.find((s) => s.value === employeeStatus);

        setSelectedStatus(
          matchedStatus || {
            value: "active",
            label: "Active",
            meaning: "Currently working",
          },
        );

        setEditId(employee._id);

        setTab(0);
      })
      .catch((e) => {
        console.error(
          "Error fetching employee for edit:",
          e.response?.data || e,
        );

        setMessage(
          e.response?.data?.message || "Error fetching employee data.",
        );

        setType("error");
      });
  };

  // -------------------------------------------------------
  // Formik
  // -------------------------------------------------------

  const Formik = useFormik({
    initialValues,
    validationSchema: employeeSchema,

    onSubmit: async (values) => {
      console.log("Employee Formik values:", values);

      // ---------------------------------------------------
      // EDIT EMPLOYEE
      // ---------------------------------------------------

      if (isEdit) {
        try {
          const fd = new FormData();

          Object.keys(values).forEach((key) => {
            fd.append(
              key,
              values[key] !== undefined && values[key] !== null
                ? values[key]
                : "",
            );
          });

          if (file) {
            fd.append("image", file, file.name);
          }

          console.log("Updating employee...");
          console.log("Edit ID:", editId);
          console.log("Employee values:", values);

          const resp = await axios.patch(
            `${baseUrl}/employee/update/${editId}`,
            fd,
          );

          console.log("Employee update response:", resp.data);

          setMessage(resp.data?.message || "Employee updated successfully.");

          setType("success");

          resetEmployeeForm();

          setEdit(false);
          setEditId(null);

          setSearchText("");

          setTab(1);

          // Refresh list
          fetchemployees();
        } catch (e) {
          console.error("Employee update error:", e.response?.data || e);

          setMessage(
            e.response?.data?.message ||
              e.response?.data?.error ||
              "Employee update failed.",
          );

          setType("error");
        }

        return;
      }

      // ---------------------------------------------------
      // ADD NEW EMPLOYEE
      // ---------------------------------------------------

      if (!file) {
        setMessage("Please provide employee image.");
        setType("error");
        return;
      }

      try {
        const fd = new FormData();

        // Add image
        fd.append("image", file, file.name);

        // Add all Formik values
        Object.keys(values).forEach((key) => {
          fd.append(
            key,
            values[key] !== undefined && values[key] !== null
              ? values[key]
              : "",
          );
        });

        // Debug FormData
        console.log("Employee registration values:", values);

        for (const pair of fd.entries()) {
          console.log("FormData:", pair[0], pair[1]);
        }

        const resp = await axios.post(`${baseUrl}/employee/register`, fd);

        console.log("Employee registration response:", resp.data);

        setMessage(resp.data?.message || "Employee registered successfully.");

        setType("success");

        // IMPORTANT:
        // Reset only after successful API response
        resetEmployeeForm();

        setEdit(false);
        setEditId(null);

        setSearchText("");

        setTab(1);

        // Refresh employee list
        fetchemployees();
      } catch (e) {
        console.error("Employee registration error:", e.response?.data || e);

        console.error("Employee registration status:", e.response?.status);

        setMessage(
          e.response?.data?.message ||
            e.response?.data?.error ||
            e.message ||
            "Employee registration failed.",
        );

        setType("error");
      }
    },
  });

  // -------------------------------------------------------
  // Fetch Employees
  // -------------------------------------------------------

  const fetchemployees = () => {
    axios
      .get(`${baseUrl}/employee/fetch-with-query`)
      .then((resp) => {
        console.log("Fetching employees:", resp.data);

        setemployees(resp.data?.data || []);
      })
      .catch((e) => {
        console.error("Error fetching employees:", e.response?.data || e);
      });
  };

  // -------------------------------------------------------
  // Search Employees
  // Search by:
  // 1. Employee Name
  // 2. Employee Email
  // -------------------------------------------------------

  const filteredEmployees = employees.filter((employee) => {
    const search = searchText.toLowerCase().trim();

    if (!search) {
      return true;
    }

    const name = String(employee?.employee_name || "").toLowerCase();

    const email = String(employee?.email || "").toLowerCase();

    return name.includes(search) || email.includes(search);
  });

  // -------------------------------------------------------
  // Initial Data
  // -------------------------------------------------------

  useEffect(() => {
    fetchemployees();
    fetchStatuses();
  }, []);

  // -------------------------------------------------------
  // Clear Message
  // -------------------------------------------------------

  const resetMessage = () => {
    setMessage("");
  };

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------

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
        {/* ------------------------------------------------
            TABS
        ------------------------------------------------ */}

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
            <Tab label={isEdit ? "Edit Employee" : "Add New Employee"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =================================================
            TAB 0 - ADD / EDIT EMPLOYEE
        ================================================= */}

        {tab === 0 && (
          <Box component="div">
            <Paper
              sx={{
                padding: "20px",
                margin: "10px",
              }}
            >
              <Box component="form" onSubmit={Formik.handleSubmit}>
                <Grid container spacing={2}>
                  {/* Employee Image */}

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="h6">Employee Pic</Typography>

                      <TextField
                        type="file"
                        name="file"
                        onChange={addImage}
                        inputRef={fileInputRef}
                        inputProps={{
                          accept: "image/*",
                        }}
                      />

                      {file && imageUrl && (
                        <CardMedia
                          component="img"
                          image={imageUrl}
                          sx={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Email */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={Formik.values.email}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={
                        Formik.touched.email && Boolean(Formik.errors.email)
                      }
                      helperText={Formik.touched.email && Formik.errors.email}
                    />
                  </Grid>

                  {/* Employee Code */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Code"
                      name="employee_code"
                      value={Formik.values.employee_code}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={
                        Formik.touched.employee_code &&
                        Boolean(Formik.errors.employee_code)
                      }
                      helperText={
                        Formik.touched.employee_code &&
                        Formik.errors.employee_code
                      }
                    />
                  </Grid>

                  {/* Employee Name */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="employee_name"
                      value={Formik.values.employee_name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={
                        Formik.touched.employee_name &&
                        Boolean(Formik.errors.employee_name)
                      }
                      helperText={
                        Formik.touched.employee_name &&
                        Formik.errors.employee_name
                      }
                    />
                  </Grid>

                  {/* Qualification */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Qualification"
                      name="qualification"
                      value={Formik.values.qualification}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={
                        Formik.touched.qualification &&
                        Boolean(Formik.errors.qualification)
                      }
                      helperText={
                        Formik.touched.qualification &&
                        Formik.errors.qualification
                      }
                    />
                  </Grid>

                  {/* Gender */}

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>

                      <Select
                        name="gender"
                        value={Formik.values.gender}
                        label="Gender"
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                      >
                        <MenuItem value="">Select Gender</MenuItem>

                        <MenuItem value="male">Male</MenuItem>

                        <MenuItem value="female">Female</MenuItem>

                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>

                    {Formik.touched.gender && Formik.errors.gender && (
                      <Typography color="error" variant="caption">
                        {Formik.errors.gender}
                      </Typography>
                    )}
                  </Grid>

                  {/* Date of Birth */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="dOBDate"
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={Formik.values.dOBDate}
                      onChange={(e) => {
                        const dob = e.target.value;

                        Formik.setFieldValue("dOBDate", dob);

                        const age = calculateAge(dob);

                        Formik.setFieldValue("age", age);
                      }}
                      onBlur={Formik.handleBlur}
                      error={
                        Formik.touched.dOBDate && Boolean(Formik.errors.dOBDate)
                      }
                      helperText={
                        Formik.touched.dOBDate && Formik.errors.dOBDate
                      }
                    />
                  </Grid>

                  {/* Age */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      value={Formik.values.age}
                      disabled
                    />
                  </Grid>

                  {/* Join Date */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="joinDate"
                      label="Join Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={Formik.values.joinDate}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={
                        Formik.touched.joinDate &&
                        Boolean(Formik.errors.joinDate)
                      }
                      helperText={
                        Formik.touched.joinDate && Formik.errors.joinDate
                      }
                    />
                  </Grid>

                  {/* Phone Number */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneno"
                      value={Formik.values.phoneno}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      error={
                        Formik.touched.phoneno && Boolean(Formik.errors.phoneno)
                      }
                      helperText={
                        Formik.touched.phoneno && Formik.errors.phoneno
                      }
                    />
                  </Grid>

                  {/* Academic Year */}

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={years}
                      getOptionLabel={(option) => option?.label || ""}
                      value={selectedYear}
                      onChange={(e, newValue) => {
                        setSelectedYear(newValue);

                        Formik.setFieldValue("year", newValue?.value || "");
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
                  </Grid>

                  {/* Status */}

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={statuses}
                      getOptionLabel={(option) =>
                        option ? `${option.meaning} (${option.label})` : ""
                      }
                      value={selectedStatus}
                      onChange={(event, newValue) => {
                        setSelectedStatus(newValue);

                        Formik.setFieldValue(
                          "status",
                          newValue ? newValue.value : "",
                        );
                      }}
                      onBlur={() => Formik.setFieldTouched("status", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Status"
                          placeholder="Search status..."
                          fullWidth
                          error={
                            Formik.touched.status &&
                            Boolean(Formik.errors.status)
                          }
                          helperText={
                            Formik.touched.status && Formik.errors.status
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* Password */}

                  {!isEdit && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        name="password"
                        value={Formik.values.password}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        error={
                          Formik.touched.password &&
                          Boolean(Formik.errors.password)
                        }
                        helperText={
                          Formik.touched.password && Formik.errors.password
                        }
                      />
                    </Grid>
                  )}

                  {/* Buttons */}

                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" sx={{ mr: 1 }}>
                      {isEdit ? "Update" : "Submit"}
                    </Button>

                    {isEdit && (
                      <Button variant="outlined" onClick={cancelEdit}>
                        Cancel Edit
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>
        )}

        {/* =================================================
            TAB 1 - EMPLOYEE LIST
        ================================================= */}

        {tab === 1 && (
          <Box>
            {/* Search + Total Employees */}

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },
                mb: 2,
                padding: "2px",
              }}
            >
              <TextField
                label="Search Name / Email"
                size="small"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{
                  width: {
                    xs: "100%",
                    sm: 500,
                  },

                  "& .MuiInputBase-root": {
                    height: 42,
                    fontSize: "14px",
                  },

                  "& .MuiInputLabel-root": {
                    fontSize: "13px",
                  },
                }}
              />

              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  whiteSpace: "nowrap",
                }}
              >
                Total Employees: {filteredEmployees.length}
              </Typography>
            </Box>

            {/* Employee Table */}

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="employee table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>

                    <TableCell align="right">Email</TableCell>

                    <TableCell align="right">DOB</TableCell>

                    <TableCell align="right">Join Date</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* Name */}

                        <TableCell component="th" scope="row">
                          {value?.employee_name}
                        </TableCell>

                        {/* Email */}

                        <TableCell align="right">{value?.email}</TableCell>

                        {/* DOB */}

                        <TableCell align="right">
                          {value?.dOBDate
                            ? dayjs(value.dOBDate).format("DD/MM/YYYY")
                            : ""}
                        </TableCell>

                        {/* Join Date */}

                        <TableCell align="right">
                          {value?.joinDate
                            ? dayjs(value.joinDate).format("DD/MM/YYYY")
                            : ""}
                        </TableCell>

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
                            <Button
                              variant="contained"
                              sx={{
                                background: "red",
                                color: "#fff",
                                "&:hover": {
                                  background: "darkred",
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

                            <Button
                              variant="contained"
                              sx={{
                                background: "skyblue",
                                color: "#000",
                                "&:hover": {
                                  background: "#5fb3d8",
                                },
                              }}
                              onClick={() =>
                                viewUploadFile(value?.employee_image)
                              }
                            >
                              View Pic
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          sx={{
                            py: 3,
                            fontWeight: "bold",
                            color: "text.secondary",
                          }}
                        >
                          No employees found.
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
