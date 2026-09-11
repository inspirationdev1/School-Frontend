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
  Select,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";

import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { bonafidecertificateSchema } from "../../../yupSchema/bonafidecertificateSchema";

export default function Bonafidecertificates() {
  // =========================================================
  // STATES
  // =========================================================

  const [bonafidecertificates, setBonafidecertificates] = useState([]);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedYear, setSelectedYear] = useState(null);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [tab, setTab] = useState(0);

  const [search, setSearch] = useState("");

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  // =========================================================
  // ACADEMIC YEARS. This will get 10 yrs in the dropdown
  // =========================================================

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
      label: `${year}-${year + 1}`,
      value: year,
    };
  });

  // =========================================================
  // INITIAL VALUES
  // =========================================================

  const initialValues = {
    bonafidecertificate_name: "",
    bonafidecertificate_code: "",
    class: "",
    section: "",
    student: "",
    docDate: "",
    docTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    status: "valid",
    remarks: "",
    year: "",
  };

  // =========================================================
  // FETCH BONAFIDE CERTIFICATES
  // =========================================================

  const fetchbonafidecertificates = () => {
    axios
      .get(`${baseUrl}/bonafidecertificate/fetch-all`)
      .then((resp) => {
        console.log("Fetching bonafide certificates", resp.data);

        setBonafidecertificates(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching bonafide certificates", e);
      });
  };

  // =========================================================
  // FETCH CLASSES
  // =========================================================

  const fetchclasses = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        console.log("Fetching classes", resp.data);

        setClasses(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching classes", e);
      });
  };

  // =========================================================
  // FETCH SECTIONS
  // =========================================================

  const fetchsections = () => {
    axios
      .get(`${baseUrl}/section/fetch-all`)
      .then((resp) => {
        console.log("Fetching sections", resp.data);

        setSections(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching sections", e);
      });
  };

  // =========================================================
  // FETCH STUDENTS
  // =========================================================

  const fetchStudents = async () => {
    // Don't fetch if class or section is not selected
    if (!selectedClass?._id || !selectedSection?._id) {
      setStudents([]);
      return;
    }

    try {
      const studentsResponse = await axios.get(
        `${baseUrl}/student/fetch-with-query`,
        {
          params: {
            student_class: selectedClass._id,
            section: selectedSection._id,
          },
        },
      );

      setStudents(studentsResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching students", error);

      setStudents([]);
    }
  };

  // =========================================================
  // INITIAL DATA LOAD
  // =========================================================

  useEffect(() => {
    fetchclasses();
    fetchsections();
    fetchbonafidecertificates();
  }, []);

  // =========================================================
  // FETCH STUDENTS WHEN CLASS/SECTION CHANGES
  // =========================================================

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedSection]);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // =========================================================
  // FILTER BONAFIDE CERTIFICATES
  // =========================================================

  const filteredBonafidecertificates = bonafidecertificates.filter((value) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      value.bonafidecertificate_name?.toLowerCase().includes(searchText) ||
      value.bonafidecertificate_code?.toLowerCase().includes(searchText) ||
      value.class?.class_name?.toLowerCase().includes(searchText) ||
      value.section?.section_name?.toLowerCase().includes(searchText) ||
      value.student?.name?.toLowerCase().includes(searchText)
    );
  });

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/bonafidecertificate/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");

          // Refresh list
          fetchbonafidecertificates();
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Error deleting certificate");

          setType("error");

          console.log("Error deleting certificate", e);
        });
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/bonafidecertificate/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        // Certificate Name
        Formik.setFieldValue(
          "bonafidecertificate_name",
          data.bonafidecertificate_name || "",
        );

        // Certificate Code
        Formik.setFieldValue(
          "bonafidecertificate_code",
          data.bonafidecertificate_code || "",
        );

        // Document Date
        Formik.setFieldValue(
          "docDate",
          data.docDate ? dayjs(data.docDate).format("YYYY-MM-DD") : "",
        );

        // Document Time
        Formik.setFieldValue("docTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));

        // Class
        Formik.setFieldValue("class", data.class?._id || "");

        setSelectedClass(data.class || null);

        // Section
        Formik.setFieldValue("section", data.section?._id || "");

        setSelectedSection(data.section || null);

        // Student
        Formik.setFieldValue("student", data.student?._id || "");

        setSelectedStudent(data.student || null);

        // Remarks
        Formik.setFieldValue("remarks", data.remarks || "");

        // Academic Year
        Formik.setFieldValue("year", data.year || "");

        const matchedYear = years.find((item) => item.value === data.year);

        setSelectedYear(matchedYear || null);

        // Edit ID
        setEditId(data._id);

        // Open Create/Edit tab
        setTab(0);
      })
      .catch((e) => {
        console.log("Error fetching edit data", e);

        setMessage(e.response?.data?.message || "Error fetching certificate");

        setType("error");
      });
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);

    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedStudent(null);
    setSelectedYear(null);

    Formik.resetForm();
  };

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = (id) => {
    console.log("Handle Print is called", id);

    window.open(`/school/BonafidecertificatePrint?id=${id}`, "_blank");
  };

  // =========================================================
  // FORMik
  // =========================================================

  const Formik = useFormik({
    initialValues: initialValues,

    validationSchema: bonafidecertificateSchema,

    onSubmit: (values) => {
      // Don't modify Formik values directly.
      const submitData = {
        ...values,

        class: selectedClass?._id || "",

        section: selectedSection?._id || "",

        student: selectedStudent?._id || "",
      };

      console.log("Data being submitted", submitData);

      // =====================================================
      // UPDATE
      // =====================================================

      if (isEdit) {
        console.log("Updating certificate", editId);

        axios
          .patch(`${baseUrl}/bonafidecertificate/update/${editId}`, submitData)
          .then((resp) => {
            console.log("Edit submit", resp.data);

            setMessage(resp.data.message);

            setType("success");

            // Reset form
            cancelEdit();

            // Go to View List
            setTab(1);

            // Refresh list
            fetchbonafidecertificates();
          })
          .catch((e) => {
            console.log("Error updating certificate", e);

            setMessage(
              e.response?.data?.message || "Error updating certificate",
            );

            setType("error");
          });
      }

      // =====================================================
      // CREATE
      // =====================================================
      else {
        axios
          .post(`${baseUrl}/bonafidecertificate/create`, submitData)
          .then((resp) => {
            console.log("Create response", resp.data);

            setMessage(resp.data.message);

            setType("success");

            // Reset form
            cancelEdit();

            // Go to View List
            setTab(1);

            // Refresh list
            fetchbonafidecertificates();
          })
          .catch((e) => {
            console.log("Error creating certificate", e);

            setMessage(
              e.response?.data?.message || "Error creating certificate",
            );

            setType("error");
          });
      }
    },
  });

  // =========================================================
  // RESET MESSAGE
  // =========================================================

  const resetMessage = () => {
    setMessage("");
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <>
      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* =================================================
            TABS
        ================================================= */}

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
              label={
                isEdit
                  ? "Edit Bonafide Certificate"
                  : "Add New Bonafide Certificate"
              }
            />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        {tab === 0 && (
          <Box>
            <Paper
              sx={{
                p: 3,
                m: 2,
              }}
            >
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },

                  gap: 2,
                }}
              >
                {/* =========================================
                    BONAFIDE CERTIFICATE NAME
                ========================================= */}

                <Box>
                  <TextField
                    fullWidth
                    label="Bonafide Certificate Name"
                    name="bonafidecertificate_name"
                    value={Formik.values.bonafidecertificate_name}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    size="small"
                    error={
                      Formik.touched.bonafidecertificate_name &&
                      Boolean(Formik.errors.bonafidecertificate_name)
                    }
                    helperText={
                      Formik.touched.bonafidecertificate_name &&
                      Formik.errors.bonafidecertificate_name
                    }
                  />
                </Box>

                {/* =========================================
                    BONAFIDE CERTIFICATE CODE
                ========================================= */}

                <Box>
                  <TextField
                    disabled={isEdit}
                    fullWidth
                    label="Bonafide Certificate Code"
                    name="bonafidecertificate_code"
                    value={Formik.values.bonafidecertificate_code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    size="small"
                    error={
                      Formik.touched.bonafidecertificate_code &&
                      Boolean(Formik.errors.bonafidecertificate_code)
                    }
                    helperText={
                      Formik.touched.bonafidecertificate_code &&
                      Formik.errors.bonafidecertificate_code
                    }
                  />
                </Box>

                {/* =========================================
                    DATE
                ========================================= */}

                <Box>
                  <TextField
                    name="docDate"
                    label="Date"
                    type="date"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={Formik.values.docDate}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    disabled={isEdit}
                    error={
                      Formik.touched.docDate && Boolean(Formik.errors.docDate)
                    }
                    helperText={Formik.touched.docDate && Formik.errors.docDate}
                  />
                </Box>

                {/* =========================================
                    ACADEMIC YEAR
                ========================================= */}

                <Box>
                  <Autocomplete
                    disabled={isEdit}
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
                        helperText={Formik.touched.year && Formik.errors.year}
                      />
                    )}
                  />
                </Box>

                {/* =========================================
                    CLASS
                ========================================= */}

                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={classes}
                    getOptionLabel={(option) => option.class_name || ""}
                    value={selectedClass}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value?._id
                    }
                    onChange={(event, newValue) => {
                      setSelectedClass(newValue);

                      // Reset section
                      setSelectedSection(null);

                      // Reset student
                      setSelectedStudent(null);

                      Formik.setFieldValue(
                        "class",
                        newValue ? newValue._id : "",
                      );

                      Formik.setFieldValue("section", "");

                      Formik.setFieldValue("student", "");
                    }}
                    onBlur={() => Formik.setFieldTouched("class", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Class"
                        placeholder="Search Class..."
                        fullWidth
                        error={
                          Formik.touched.class && Boolean(Formik.errors.class)
                        }
                        helperText={Formik.touched.class && Formik.errors.class}
                      />
                    )}
                  />
                </Box>

                {/* =========================================
                    SECTION
                ========================================= */}

                <Box>
                  <Autocomplete
                    disabled={isEdit || !selectedClass}
                    options={sections}
                    getOptionLabel={(option) => option.section_name || ""}
                    value={selectedSection}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value?._id
                    }
                    onChange={(event, newValue) => {
                      setSelectedSection(newValue);

                      // Reset student
                      setSelectedStudent(null);

                      Formik.setFieldValue(
                        "section",
                        newValue ? newValue._id : "",
                      );

                      Formik.setFieldValue("student", "");
                    }}
                    onBlur={() => Formik.setFieldTouched("section", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Section"
                        placeholder="Search Section..."
                        fullWidth
                        error={
                          Formik.touched.section &&
                          Boolean(Formik.errors.section)
                        }
                        helperText={
                          Formik.touched.section && Formik.errors.section
                        }
                      />
                    )}
                  />
                </Box>

                {/* =========================================
                    STUDENT
                ========================================= */}

                <Box>
                  <Autocomplete
                    disabled={isEdit || !selectedClass || !selectedSection}
                    options={students}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedStudent}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value?._id
                    }
                    onChange={(event, newValue) => {
                      setSelectedStudent(newValue);

                      Formik.setFieldValue(
                        "student",
                        newValue ? newValue._id : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("student", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Student"
                        placeholder="Search Student..."
                        fullWidth
                        error={
                          Formik.touched.student &&
                          Boolean(Formik.errors.student)
                        }
                        helperText={
                          Formik.touched.student && Formik.errors.student
                        }
                      />
                    )}
                  />
                </Box>

                {/* =========================================
                    REMARKS
                ========================================= */}

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
                    error={
                      Formik.touched.remarks && Boolean(Formik.errors.remarks)
                    }
                    helperText={Formik.touched.remarks && Formik.errors.remarks}
                  />
                </Box>

                {/* =========================================
                    BUTTONS
                ========================================= */}

                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    mt: 1,
                  }}
                >
                  <Button type="submit" variant="contained" sx={{ mr: 1 }}>
                    {isEdit ? "Update" : "Submit"}
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

        {/* =================================================
            VIEW LIST
        ================================================= */}

        {tab === 1 && (
          <Box>
            {/* =============================================
                SEARCH
            ============================================= */}

            <Box sx={{ mb: 2 }}>
              <TextField
                label="Search"
                size="small"
                value={search}
                onChange={handleSearch}
                placeholder="Search certificate, code, class, section or student..."
                sx={{
                  "& .MuiInputBase-root": {
                    height: 42,

                    width: {
                      xs: "100%",
                      sm: 500,
                    },

                    fontSize: "14px",
                  },

                  "& .MuiInputLabel-root": {
                    fontSize: "13px",
                  },
                }}
              />
            </Box>

            {/* =============================================
                TABLE
            ============================================= */}

            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="bonafide certificates table"
              >
                {/* =========================================
                    TABLE HEAD
                ========================================= */}

                <TableHead>
                  <TableRow>
                    <TableCell>Bonafide Certificate Name</TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Class</TableCell>

                    <TableCell align="right">Section</TableCell>

                    <TableCell align="right">Student</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                {/* =========================================
                    TABLE BODY
                ========================================= */}

                <TableBody>
                  {filteredBonafidecertificates.length > 0 ? (
                    filteredBonafidecertificates.map((value) => (
                      <TableRow
                        key={value._id}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* Certificate Name */}

                        <TableCell component="th" scope="row">
                          {value.bonafidecertificate_name}
                        </TableCell>

                        {/* Code */}

                        <TableCell align="right">
                          {value.bonafidecertificate_code}
                        </TableCell>

                        {/* Class */}

                        <TableCell align="right">
                          {value.class?.class_name}
                        </TableCell>

                        {/* Section */}

                        <TableCell align="right">
                          {value.section?.section_name}
                        </TableCell>

                        {/* Student */}

                        <TableCell align="right">
                          {value.student?.name}
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
                            {/* DELETE */}

                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleDelete(value._id)}
                            >
                              Delete
                            </Button>

                            {/* EDIT */}

                            <Button
                              variant="contained"
                              color="warning"
                              size="small"
                              onClick={() => handleEdit(value._id)}
                            >
                              Edit
                            </Button>

                            {/* PRINT */}

                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handlePrint(value._id)}
                            >
                              Print
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    /* =====================================
                       NO DATA
                    ===================================== */

                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography
                          sx={{
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          No bonafide certificates found
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
