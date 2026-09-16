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
import { classsubjectSchema } from "../../../yupSchema/classsubjectSchema";

export default function Classsubject() {
  const [classsubject, setClasssubject] = useState([]);
  const [filteredClasssubjects, setFilteredClasssubjects] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Message
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/classsubject/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e.response?.data?.message || "Error deleting class subject",
          );
          setType("error");

          console.log("Error, deleting", e);
        });
    }
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------
  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/classsubject/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("class", data?.class?._id || "");

        Formik.setFieldValue("subject", data?.subject?._id || "");

        Formik.setFieldValue("seq", data?.seq ?? 0);

        setSelectedClass(data?.class || null);
        setSelectedSubject(data?.subject || null);

        setEditId(data?._id);

        // Open Edit tab
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);

        setMessage(
          e.response?.data?.message || "Error fetching class subject details",
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
    setSelectedClass(null);
    setSelectedSubject(null);
    Formik.resetForm();
  };

  // --------------------------------------------------
  // FORMIK
  // --------------------------------------------------
  const initialValues = {
    class: "",
    class_name: "",
    subject: "",
    subject_name: "",
    seq: 0,
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: classsubjectSchema,

    onSubmit: (values) => {
      const submitValues = {
        ...values,
        class: selectedClass?._id || "",
        subject: selectedSubject?._id || "",
        class_name: selectedClass?.class_name || "",
        subject_name: selectedSubject?.subject_name || "",
      };

      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/classsubject/update/${editId}`, submitValues)
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error updating class subject",
            );

            setType("error");

            console.log("Error, edit class subject submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/classsubject/create`, submitValues)
          .then((resp) => {
            console.log("Response after submitting class subject", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error creating class subject",
            );

            setType("error");

            console.log("Error, response class subject create", e);
          });
      }
    },
  });

  // --------------------------------------------------
  // FETCH CLASS SUBJECTS
  // --------------------------------------------------
  const fetchClasssubject = () => {
    axios
      .get(`${baseUrl}/classsubject/fetch-with-query`)
      .then((resp) => {
        console.log("Fetching class subject data", resp);

        const data = Array.isArray(resp.data.data) ? resp.data.data : [];

        setClasssubject(data);
        setFilteredClasssubjects(data);
      })
      .catch((e) => {
        console.log("Error in fetching classsubject data", e);

        setClasssubject([]);
        setFilteredClasssubjects([]);
      });
  };

  // --------------------------------------------------
  // FETCH CLASSES
  // --------------------------------------------------
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseUrl}/class/fetch-all`);

      console.log("classes", response);

      const data = Array.isArray(response.data.data) ? response.data.data : [];

      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);

      setClasses([]);
    }
  };

  // --------------------------------------------------
  // FETCH SUBJECTS
  // --------------------------------------------------
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${baseUrl}/subject/fetch-all`);

      console.log("subjects", response);

      const data = Array.isArray(response.data.data) ? response.data.data : [];

      setSubjects(data);
    } catch (error) {
      console.error("Error fetching Subjects:", error);

      setSubjects([]);
    }
  };

  // --------------------------------------------------
  // INITIAL / AFTER CRUD FETCH
  // --------------------------------------------------
  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchClasssubject();
  }, [message]);

  // --------------------------------------------------
  // DYNAMIC SEARCH
  // --------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    // Show all records when search is empty
    if (!searchValue) {
      setFilteredClasssubjects(classsubject);
      return;
    }

    const filtered = classsubject.filter((item) => {
      const className = String(
        item?.class?.class_name || item?.class_name || "",
      ).toLowerCase();

      const subjectName = String(
        item?.subject?.subject_name || item?.subject_name || "",
      ).toLowerCase();

      const seq = String(item?.seq ?? "").toLowerCase();

      return (
        className.includes(searchValue) ||
        subjectName.includes(searchValue) ||
        seq.includes(searchValue)
      );
    });

    setFilteredClasssubjects(filtered);
  }, [search, classsubject]);

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
            <Tab
              label={isEdit ? "Edit Class Subject" : "Add New Class Subject"}
            />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* ==================================================
            TAB 0 - ADD / EDIT
        ================================================== */}
        {tab === 0 && (
          <Box>
            <Paper
              sx={{
                p: 3,
                m: 1,
              }}
            >
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* CLASS */}
                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={classes}
                    getOptionLabel={(option) => option?.class_name || ""}
                    value={selectedClass}
                    isOptionEqualToValue={(option, value) =>
                      option?._id === value?._id
                    }
                    onChange={(event, newValue) => {
                      setSelectedClass(newValue);

                      Formik.setFieldValue(
                        "class",
                        newValue ? newValue._id : "",
                      );

                      Formik.setFieldValue(
                        "class_name",
                        newValue ? newValue.class_name : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("class", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Class"
                        placeholder="Search class..."
                        fullWidth
                        error={
                          Formik.touched.class && Boolean(Formik.errors.class)
                        }
                        helperText={Formik.touched.class && Formik.errors.class}
                      />
                    )}
                  />
                </Box>

                {/* SUBJECT */}
                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={subjects}
                    getOptionLabel={(option) => option?.subject_name || ""}
                    value={selectedSubject}
                    isOptionEqualToValue={(option, value) =>
                      option?._id === value?._id
                    }
                    onChange={(event, newValue) => {
                      setSelectedSubject(newValue);

                      Formik.setFieldValue(
                        "subject",
                        newValue ? newValue._id : "",
                      );

                      Formik.setFieldValue(
                        "subject_name",
                        newValue ? newValue.subject_name : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("subject", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Subject"
                        placeholder="Search subject..."
                        fullWidth
                        error={
                          Formik.touched.subject &&
                          Boolean(Formik.errors.subject)
                        }
                        helperText={
                          Formik.touched.subject && Formik.errors.subject
                        }
                      />
                    )}
                  />
                </Box>

                {/* SEQ */}
                <Box>
                  <TextField
                    type="number"
                    fullWidth
                    label="Seq"
                    name="seq"
                    value={Formik.values.seq}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.seq && Formik.errors.seq && (
                    <p
                      style={{
                        color: "red",
                      }}
                    >
                      {Formik.errors.seq}
                    </p>
                  )}
                </Box>

                {/* BUTTONS */}
                <Box>
                  <Button type="submit" sx={{ mr: 1 }} variant="contained">
                    Submit
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
                  label="Search Class Subjects"
                  placeholder="Search by Class, Subject or Seq..."
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

                {/* CLEAR */}
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

                {/* TOTAL */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Class Subjects:{" "}
                  <strong>{filteredClasssubjects.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* TABLE */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="class subject table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Class</TableCell>

                    <TableCell align="right">Subject</TableCell>

                    <TableCell align="right">Seq</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredClasssubjects.length > 0 ? (
                    filteredClasssubjects.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* CLASS */}
                        <TableCell align="right">
                          {value?.class?.class_name || value?.class_name || ""}
                        </TableCell>

                        {/* SUBJECT */}
                        <TableCell align="right">
                          {value?.subject?.subject_name ||
                            value?.subject_name ||
                            ""}
                        </TableCell>

                        {/* SEQ */}
                        <TableCell align="right">{value?.seq}</TableCell>

                        {/* ACTION */}
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1.5,
                            }}
                          >
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
                      <TableCell colSpan={4} align="center">
                        <Typography
                          sx={{
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          {search
                            ? "No Class Subjects found matching your search."
                            : "No Class Subjects available."}
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
