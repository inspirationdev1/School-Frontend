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
} from "@mui/material";

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { subjectSchema } from "../../../yupSchema/subjectSchema";

export default function Subject() {
  const [studentSubject, setStudentSubject] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

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
  // DELETE SUBJECT
  // --------------------------------------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/subject/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Error deleting subject");
          setType("error");

          console.log("Error, deleting subject", e);
        });
    }
  };

  // --------------------------------------------------
  // EDIT SUBJECT
  // --------------------------------------------------
  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/subject/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("subject_name", data?.subject_name || "");

        Formik.setFieldValue("subject_code", data?.subject_code || "");

        Formik.setFieldValue("seq", data?.seq ?? 0);

        setEditId(data?._id);

        // Open Edit Subject tab
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);

        setMessage(
          e.response?.data?.message || "Error fetching subject details",
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
    subject_name: "",
    subject_code: "",
    seq: 0,
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: subjectSchema,

    onSubmit: (values) => {
      if (isEdit) {
        console.log("Edit id", editId);

        axios
          .patch(`${baseUrl}/subject/update/${editId}`, {
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
            setMessage(e.response?.data?.message || "Error updating subject");

            setType("error");

            console.log("Error, edit subject submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/subject/create`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting subject", resp);

            setMessage(resp.data.message);
            setType("success");

            Formik.resetForm();

            // Go to View List
            setTab(1);
          })
          .catch((e) => {
            setMessage(e.response?.data?.message || "Error creating subject");

            setType("error");

            console.log("Error, response subject create", e);
          });
      }
    },
  });

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // --------------------------------------------------
  // FETCH SUBJECTS
  // --------------------------------------------------
  const fetchstudentssubject = () => {
    axios
      .get(`${baseUrl}/subject/fetch-all`)
      .then((resp) => {
        console.log("Fetching subject data.", resp);

        const data = Array.isArray(resp.data.data) ? resp.data.data : [];

        setStudentSubject(data);
        setFilteredSubjects(data);
      })
      .catch((e) => {
        console.log("Error in fetching subject data", e);

        setStudentSubject([]);
        setFilteredSubjects([]);
      });
  };

  // --------------------------------------------------
  // FETCH DATA AFTER MESSAGE CHANGES
  // --------------------------------------------------
  useEffect(() => {
    fetchstudentssubject();
  }, [message]);

  // --------------------------------------------------
  // DYNAMIC SEARCH FILTER
  // --------------------------------------------------
  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    // If search is empty, show all subjects
    if (!searchValue) {
      setFilteredSubjects(studentSubject);
      return;
    }

    const filtered = studentSubject.filter((subject) => {
      const subjectName = String(subject?.subject_name || "").toLowerCase();

      const subjectCode = String(subject?.subject_code || "").toLowerCase();

      const seq = String(subject?.seq ?? "").toLowerCase();

      return (
        subjectName.includes(searchValue) ||
        subjectCode.includes(searchValue) ||
        seq.includes(searchValue)
      );
    });

    setFilteredSubjects(filtered);
  }, [search, studentSubject]);

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
        {/* --------------------------------------------------
            TABS
        -------------------------------------------------- */}
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
            <Tab label={isEdit ? "Edit Subject" : "Add New Subject"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* ==================================================
            TAB 0 - ADD / EDIT SUBJECT
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
                {/* SUBJECT NAME */}
                <TextField
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  label="Subject Name"
                  variant="outlined"
                  name="subject_name"
                  value={Formik.values.subject_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.subject_name && Formik.errors.subject_name && (
                  <p
                    style={{
                      color: "red",
                      textTransform: "capitalize",
                    }}
                  >
                    {Formik.errors.subject_name}
                  </p>
                )}

                {/* SUBJECT CODE */}
                <TextField
                  disabled={isEdit}
                  fullWidth
                  sx={{ marginTop: "10px" }}
                  label="Subject Code"
                  variant="outlined"
                  name="subject_code"
                  value={Formik.values.subject_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.subject_code && Formik.errors.subject_code && (
                  <p
                    style={{
                      color: "red",
                      textTransform: "capitalize",
                    }}
                  >
                    {Formik.errors.subject_code}
                  </p>
                )}

                {/* SEQ */}
                <Box>
                  <TextField
                    fullWidth
                    sx={{ marginTop: "10px" }}
                    label="Seq"
                    variant="outlined"
                    name="seq"
                    type="number"
                    value={Formik.values.seq}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.seq && Formik.errors.seq && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.seq}
                    </p>
                  )}
                </Box>

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
            {/* --------------------------------------------------
                SEARCH + TOTAL
            -------------------------------------------------- */}
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
                  label="Search Subjects"
                  placeholder="Search by Subject Name, Code or Seq..."
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

                {/* TOTAL SUBJECTS */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Subjects: <strong>{filteredSubjects.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* --------------------------------------------------
                SUBJECT TABLE
            -------------------------------------------------- */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="subject table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Subject Name
                    </TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Seq</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* SUBJECT NAME */}
                        <TableCell component="th" scope="row">
                          {value?.subject_name}
                        </TableCell>

                        {/* SUBJECT CODE */}
                        <TableCell align="right">
                          {value?.subject_code}
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
                      <TableCell colSpan={4} align="center">
                        <Typography
                          sx={{
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          {search
                            ? "No Subjects found matching your search."
                            : "No Subjects available."}
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
