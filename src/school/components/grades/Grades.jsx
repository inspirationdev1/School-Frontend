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
import { gradeSchema } from "../../../yupSchema/gradeSchema";

export default function Grades() {
  const [grades, setGrades] = useState([]);

  // Search text
  const [search, setSearch] = useState("");

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    grade_code: "",
    gpa: "",
    marks_limit: 0,
    marks_max: 0,
    marks_min: 0,
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/grade/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Error deleting grade");
          setType("error");
          console.log("Error, deleting", e);
        });
    }
  };

  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/grade/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("grade_code", resp.data.data?.grade_code);

        Formik.setFieldValue("gpa", resp.data.data?.gpa);

        Formik.setFieldValue("marks_limit", resp.data.data?.marks_limit);

        Formik.setFieldValue("marks_max", resp.data.data?.marks_max);

        Formik.setFieldValue("marks_min", resp.data.data?.marks_min);

        setEditId(resp.data.data._id);
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: gradeSchema,

    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/grade/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();

            // Clear search after update
            setSearch("");

            setTab(1);
          })
          .catch((e) => {
            setMessage(e.response?.data?.message || "Error updating grade");
            setType("error");

            console.log("Error, edit grade submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/grade/create`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting grade", resp);

            setMessage(resp.data.message);
            setType("success");

            // Clear search after create
            setSearch("");

            setTab(1);
          })
          .catch((e) => {
            setMessage(e.response?.data?.message || "Error creating grade");
            setType("error");

            console.log("Error, response grade create", e);
          });

        Formik.resetForm();
      }
    },
  });

  // Fetch all grades
  const fetchGrades = () => {
    axios
      .get(`${baseUrl}/grade/fetch-with-query`)
      .then((resp) => {
        setGrades(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching grades data", e);
      });
  };

  useEffect(() => {
    fetchGrades();
  }, [message]);

  // Dynamic search
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Filter grades dynamically
  const filteredGrades = grades.filter((value) => {
    const searchText = search.toLowerCase().trim();

    // Show all grades when search is empty
    if (!searchText) {
      return true;
    }

    const marksLimit = String(value?.marks_limit ?? "").toLowerCase();

    const marksMin = String(value?.marks_min ?? "").toLowerCase();

    const marksMax = String(value?.marks_max ?? "").toLowerCase();

    const gradeCode = String(value?.grade_code ?? "").toLowerCase();

    const gpa = String(value?.gpa ?? "").toLowerCase();

    return (
      marksLimit.includes(searchText) ||
      marksMin.includes(searchText) ||
      marksMax.includes(searchText) ||
      gradeCode.includes(searchText) ||
      gpa.includes(searchText)
    );
  });

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
        {/* Tabs */}
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
            <Tab label={isEdit ? "Edit Grade" : "Add New Grade"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =========================
                    TAB 0 - CREATE / EDIT
                ========================= */}
        {tab === 0 && (
          <Box>
            <Paper sx={{ p: 3, m: 1 }}>
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
                {/* Marks Limit */}
                <Box>
                  <TextField
                    type="number"
                    fullWidth
                    label="Marks Limit"
                    name="marks_limit"
                    value={Formik.values.marks_limit}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.marks_limit && Formik.errors.marks_limit && (
                    <p
                      style={{
                        color: "red",
                      }}
                    >
                      {Formik.errors.marks_limit}
                    </p>
                  )}
                </Box>

                {/* Marks Min */}
                <Box>
                  <TextField
                    type="number"
                    fullWidth
                    label="Marks(Min)"
                    name="marks_min"
                    value={Formik.values.marks_min}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.marks_min && Formik.errors.marks_min && (
                    <p
                      style={{
                        color: "red",
                      }}
                    >
                      {Formik.errors.marks_min}
                    </p>
                  )}
                </Box>

                {/* Marks Max */}
                <Box>
                  <TextField
                    type="number"
                    fullWidth
                    label="Marks(Max)"
                    name="marks_max"
                    value={Formik.values.marks_max}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.marks_max && Formik.errors.marks_max && (
                    <p
                      style={{
                        color: "red",
                      }}
                    >
                      {Formik.errors.marks_max}
                    </p>
                  )}
                </Box>

                {/* Grade */}
                <Box>
                  <TextField
                    disabled={isEdit}
                    fullWidth
                    label="Grade"
                    variant="outlined"
                    name="grade_code"
                    value={Formik.values.grade_code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.grade_code && Formik.errors.grade_code && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.grade_code}
                    </p>
                  )}
                </Box>

                {/* GPA */}
                <Box>
                  <TextField
                    disabled={isEdit}
                    fullWidth
                    label="GPA"
                    variant="outlined"
                    name="gpa"
                    value={Formik.values.gpa}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.gpa && Formik.errors.gpa && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.gpa}
                    </p>
                  )}
                </Box>

                {/* Buttons */}
                <Box>
                  <Button type="submit" sx={{ mr: 1 }} variant="contained">
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

        {/* =========================
                    TAB 1 - VIEW LIST
                ========================= */}
        {tab === 1 && (
          <Box>
            {/* Search + Count */}
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
              }}
            >
              {/* Search */}
              <TextField
                label="Search Marks Limit / Min / Max / Grade / GPA"
                size="small"
                value={search}
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

              {/* Grades Count */}
              <Box
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Total Grades: {filteredGrades.length}
              </Box>
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="grades table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Marks Limit</TableCell>

                    <TableCell align="right">Marks (Min)</TableCell>

                    <TableCell align="right">Marks (Max)</TableCell>

                    <TableCell align="right">Grade</TableCell>

                    <TableCell align="right">GPA</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell align="right">
                          {value?.marks_limit}
                        </TableCell>

                        <TableCell align="right">{value?.marks_min}</TableCell>

                        <TableCell align="right">{value?.marks_max}</TableCell>

                        <TableCell align="right">{value?.grade_code}</TableCell>

                        <TableCell align="right">{value?.gpa}</TableCell>

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
                      <TableCell colSpan={6} align="center">
                        <Typography
                          sx={{
                            py: 2,
                            fontWeight: 500,
                          }}
                        >
                          No grades found
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
