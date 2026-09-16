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
  Autocomplete,
} from "@mui/material";

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { attendeeSchema } from "../../../yupSchema/attendeeSchema";

export default function Attendees() {
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [search, setSearch] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/attendee/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e?.response?.data?.message || "Error deleting attendee");
          setType("error");
          console.log("Error, deleting", e);
        });
    }
  };

  // ---------------------------------------------------------
  // EDIT
  // ---------------------------------------------------------
  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/attendee/fetch-single/${id}`)
      .then((resp) => {
        const data = resp?.data?.data;

        Formik.setFieldValue("class", data?.class?._id || "");
        setSelectedClass(data?.class || null);

        Formik.setFieldValue("section", data?.section?._id || "");
        setSelectedSection(data?.section || null);

        Formik.setFieldValue("teacher", data?.teacher?._id || "");
        setSelectedTeacher(data?.teacher || null);

        Formik.setFieldValue("status", data?.status || "valid");

        Formik.setFieldValue("remarks", data?.remarks || "");

        setEditId(data?._id);
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  // ---------------------------------------------------------
  // CANCEL EDIT
  // ---------------------------------------------------------
  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);

    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedTeacher(null);

    Formik.resetForm();
  };

  // ---------------------------------------------------------
  // FORMIK
  // ---------------------------------------------------------
  const initialValues = {
    class: "",
    section: "",
    teacher: "",
    status: "valid",
    remarks: "",
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: attendeeSchema,

    onSubmit: (values) => {
      values.class = selectedClass?._id || "";
      values.section = selectedSection?._id || "";
      values.teacher = selectedTeacher?._id || "";

      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/attendee/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(e?.response?.data?.message || "Error updating attendee");
            setType("error");

            console.log("Error editing attendee", e);
          });
      } else {
        axios
          .post(`${baseUrl}/attendee/create`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting attendee", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(e?.response?.data?.message || "Error creating attendee");
            setType("error");

            console.log("Error creating attendee", e);
          });
      }
    },
  });

  // ---------------------------------------------------------
  // FETCH ATTENDEES
  // ---------------------------------------------------------
  const fetchattendees = () => {
    axios
      .get(`${baseUrl}/attendee/fetch-all`)
      .then((resp) => {
        const data = resp?.data?.data || [];

        setAttendees(data);
        setFilteredAttendees(data);
      })
      .catch((e) => {
        console.log("Error in fetching attendees", e);

        setAttendees([]);
        setFilteredAttendees([]);
      });
  };

  // ---------------------------------------------------------
  // FETCH CLASSES
  // ---------------------------------------------------------
  const fetchclasses = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setClasses(resp?.data?.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching classes", e);
        setClasses([]);
      });
  };

  // ---------------------------------------------------------
  // FETCH SECTIONS
  // ---------------------------------------------------------
  const fetchsections = () => {
    axios
      .get(`${baseUrl}/section/fetch-all`)
      .then((resp) => {
        setSections(resp?.data?.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching sections", e);
        setSections([]);
      });
  };

  // ---------------------------------------------------------
  // FETCH TEACHERS
  // ---------------------------------------------------------
  const fetchTachers = async () => {
    try {
      const teachersResponse = await axios.get(
        `${baseUrl}/teacher/fetch-with-query`,
        {
          params: {
            teacher_class: selectedClass?._id,
            section: selectedSection?._id,
          },
        },
      );

      setTeachers(teachersResponse?.data?.data || []);
    } catch (error) {
      console.error("Error fetching teachers", error);
      setTeachers([]);
    }
  };

  // ---------------------------------------------------------
  // INITIAL FETCH
  // ---------------------------------------------------------
  useEffect(() => {
    fetchclasses();
    fetchsections();
    fetchattendees();
  }, [message]);

  // ---------------------------------------------------------
  // FETCH TEACHERS WHEN CLASS / SECTION CHANGES
  // ---------------------------------------------------------
  useEffect(() => {
    fetchTachers();
  }, [selectedClass, selectedSection]);

  // ---------------------------------------------------------
  // SEARCH
  // Class
  // Section
  // Teacher
  // Status
  // Remarks
  // ---------------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      setFilteredAttendees(attendees);
      return;
    }

    const filtered = attendees.filter((attendee) => {
      const className = String(
        attendee?.class?.class_name || attendee?.class_name || "",
      ).toLowerCase();

      const sectionName = String(
        attendee?.section?.section_name || attendee?.section_name || "",
      ).toLowerCase();

      const teacherName = String(
        attendee?.teacher?.name || attendee?.teacher_name || "",
      ).toLowerCase();

      const status = String(attendee?.status || "").toLowerCase();

      const remarks = String(attendee?.remarks || "").toLowerCase();

      return (
        className.includes(searchValue) ||
        sectionName.includes(searchValue) ||
        teacherName.includes(searchValue) ||
        status.includes(searchValue) ||
        remarks.includes(searchValue)
      );
    });

    setFilteredAttendees(filtered);
  }, [search, attendees]);

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
        {/* -------------------------------------------------
                    TABS
                ------------------------------------------------- */}
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
            <Tab label={isEdit ? "Edit Attendee" : "Add New Attendee"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =================================================
                    TAB 0 - ADD / EDIT
                ================================================= */}
        {tab === 0 && (
          <Box>
            <Paper sx={{ p: 3, m: 2 }}>
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
                {/* Class */}
                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={classes}
                    getOptionLabel={(option) => option?.class_name || ""}
                    value={selectedClass}
                    onChange={(event, newValue) => {
                      setSelectedClass(newValue);

                      Formik.setFieldValue(
                        "class",
                        newValue ? newValue._id : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("class", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select class"
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

                {/* Section */}
                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={sections}
                    getOptionLabel={(option) => option?.section_name || ""}
                    value={selectedSection}
                    onChange={(event, newValue) => {
                      setSelectedSection(newValue);

                      Formik.setFieldValue(
                        "section",
                        newValue ? newValue._id : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("section", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select section"
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

                {/* Teacher */}
                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={teachers}
                    getOptionLabel={(option) => option?.name || ""}
                    value={selectedTeacher}
                    onChange={(event, newValue) => {
                      setSelectedTeacher(newValue);

                      Formik.setFieldValue(
                        "teacher",
                        newValue ? newValue._id : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("teacher", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select teacher"
                        placeholder="Search Teacher..."
                        fullWidth
                        error={
                          Formik.touched.teacher &&
                          Boolean(Formik.errors.teacher)
                        }
                        helperText={
                          Formik.touched.teacher && Formik.errors.teacher
                        }
                      />
                    )}
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

                  {Formik.touched.remarks && Formik.errors.remarks && (
                    <Typography color="error" variant="caption">
                      {Formik.errors.remarks}
                    </Typography>
                  )}
                </Box>

                <Box />

                {/* Buttons */}
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    mt: 1,
                  }}
                >
                  <Button type="submit" variant="contained" sx={{ mr: 1 }}>
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

        {/* =================================================
                    TAB 1 - VIEW LIST
                ================================================= */}
        {tab === 1 && (
          <Box>
            {/* SEARCH */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  label="Search Attendees"
                  placeholder="Search by Class, Section, Teacher, Status or Remarks"
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

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Attendees: <strong>{filteredAttendees.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* TABLE */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="attendees table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Class</TableCell>

                    <TableCell align="left">Section</TableCell>

                    <TableCell align="left">Teacher</TableCell>

                    <TableCell align="left">Status</TableCell>

                    <TableCell align="left">Remarks</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredAttendees.length > 0 ? (
                    filteredAttendees.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell align="left">
                          {value?.class?.class_name || value?.class_name || ""}
                        </TableCell>

                        <TableCell align="left">
                          {value?.section?.section_name ||
                            value?.section_name ||
                            ""}
                        </TableCell>

                        <TableCell align="left">
                          {value?.teacher?.name || value?.teacher_name || ""}
                        </TableCell>

                        <TableCell align="left">
                          {value?.status || ""}
                        </TableCell>

                        <TableCell align="left">
                          {value?.remarks || ""}
                        </TableCell>

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
                              onClick={() => handleDelete(value?._id)}
                            >
                              Delete
                            </Button>

                            <Button
                              variant="contained"
                              sx={{
                                background: "gold",
                                color: "#222222",
                              }}
                              onClick={() => handleEdit(value?._id)}
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
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          {search
                            ? "No Attendees found matching your search."
                            : "No Attendees available."}
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
